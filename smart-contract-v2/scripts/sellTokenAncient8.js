const { ethers } = require("hardhat");
require('dotenv').config();

async function calculateMinimumA8Out(factory, tokenAddress, tokenAmount) {
  // Get token info
  const tokenInfo = await factory.tokens(tokenAddress);
  
  // Constants from contract
  const BASIS = ethers.getBigInt(10000);
  const BIN_WIDTH = ethers.getBigInt(2000);
  const COEF = ethers.getBigInt(2);
  
  // Current state
  const currentIndex = ethers.getBigInt(tokenInfo.currentIndex);
  const initialSupply = ethers.getBigInt(tokenInfo.initialSupply);
  
  // Calculate expected A8 based on contract's sell logic
  const amountPerA8 = (initialSupply * COEF) / (BASIS + (BIN_WIDTH * currentIndex));
  const expectedA8 = (tokenAmount * ethers.parseEther("1")) / amountPerA8;
  
  // Apply trading fee (1%)
  const tradingFee = ethers.getBigInt(100);
  const fee = (expectedA8 * tradingFee) / BASIS;
  const finalA8 = expectedA8 - fee;
  
  return finalA8;
}

async function main() {
  try {
    // Get the contract factory
    const SlothFactoryAncient8 = await ethers.getContractFactory("SlothFactoryAncient8");
    
    // Get the deployed contract addresses
    const FACTORY_ADDRESS = process.env.SLOTH_FACTORY_ADDRESS;
    const TOKEN_ADDRESS = process.env.TOKEN_TO_BUY_ADDRESS; // Add this to your .env file
    
    if (!FACTORY_ADDRESS || !TOKEN_ADDRESS) {
      throw new Error("Missing contract addresses in .env file");
    }

    const factory = await SlothFactoryAncient8.attach(FACTORY_ADDRESS);
    const tokenToSell = await ethers.getContractAt("SlothToken", TOKEN_ADDRESS);

    // Get signer
    const [signer] = await ethers.getSigners();

    // Get token balance and calculate 20% to sell
    const balance = await tokenToSell.balanceOf(signer.address);
    console.log("Your token balance:", ethers.formatEther(balance), "tokens");
    
    // Calculate 20% of balance
    const amountToSell = (balance * ethers.getBigInt(20)) / ethers.getBigInt(100);
    console.log("Amount to sell (20%):", ethers.formatEther(amountToSell));

    // Calculate expected A8 tokens first
    const expectedA8 = await calculateMinimumA8Out(factory, TOKEN_ADDRESS, amountToSell);
    console.log("Expected A8 tokens:", ethers.formatEther(expectedA8));


    if (balance < amountToSell) {
      throw new Error(`Insufficient token balance. Need ${ethers.formatEther(amountToSell)} tokens but you have ${ethers.formatEther(balance)}`);
    }

    // Check and set allowance for tokens
    const allowance = await tokenToSell.allowance(signer.address, FACTORY_ADDRESS);
    if (allowance < amountToSell) {
      console.log("Approving tokens...");
      const approveTx = await tokenToSell.approve(FACTORY_ADDRESS, amountToSell);
      await approveTx.wait();
      console.log("Tokens approved successfully");
    }

    // Add 15% slippage tolerance
    const slippageTolerance = 0.15;
    const minA8ToReceive = expectedA8 * ethers.getBigInt(Math.floor(100 - (slippageTolerance * 100))) / ethers.getBigInt(100);
    
    // Set deadline 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    console.log("\nSelling tokens with parameters:");
    console.log("Amount to sell:", ethers.formatEther(amountToSell));
    console.log("Minimum A8 to receive:", ethers.formatEther(minA8ToReceive));
    console.log("Deadline:", new Date(deadline * 1000).toLocaleString());

    // Use the non-permit version of sell
    console.log("\nSending transaction...");
    const tx = await factory.sell(
      TOKEN_ADDRESS,
      amountToSell,
      minA8ToReceive
    );

    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("Sell transaction completed successfully!");

  } catch (error) {
    console.error("\nError details:");
    if (error.reason) console.error("Reason:", error.reason);
    if (error.data) console.error("Error data:", error.data);
    if (error.transaction) console.error("Transaction:", error.transaction);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 