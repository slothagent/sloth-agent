const { ethers } = require("hardhat");
require('dotenv').config();

async function calculateExpectedTokens(factory, tokenAddress, a8Amount) {
  // Get token info
  const tokenInfo = await factory.tokens(tokenAddress);
  
  // Constants from contract
  const BASIS = ethers.getBigInt(10000);
  const BIN_WIDTH = ethers.getBigInt(2000);
  const COEF = ethers.getBigInt(2);
  
  // Current state
  const currentIndex = ethers.getBigInt(tokenInfo.currentIndex);
  const initialSupply = ethers.getBigInt(tokenInfo.initialSupply);
  
  // Calculate expected tokens based on contract's _buy logic
  const tradingFee = ethers.getBigInt(100); // 1%
  const a8Value = a8Amount;
  const fee = (a8Value * tradingFee) / BASIS;
  const value = a8Value - fee;
  
  // Calculate tokens per A8 at current index
  const binWidthMultiplier = BIN_WIDTH * currentIndex;
  const denominator = BASIS + binWidthMultiplier;
  const amountPerA8 = (initialSupply * COEF) / denominator;
  const expectedTokens = (amountPerA8 * value) / ethers.parseEther("1");
  
  return expectedTokens;
}

async function main() {
  try {
    // Get the contract factory
    const SlothFactoryAncient8 = await ethers.getContractFactory("SlothFactoryAncient8");
    
    // Get the deployed contract addresses
    const FACTORY_ADDRESS = process.env.SLOTH_FACTORY_ADDRESS;
    const A8_TOKEN_ADDRESS = process.env.A8_TOKEN_ADDRESS;
    const TOKEN_ADDRESS = process.env.TOKEN_TO_BUY_ADDRESS; // Add this to your .env file
    
    if (!FACTORY_ADDRESS || !A8_TOKEN_ADDRESS || !TOKEN_ADDRESS) {
      throw new Error("Missing contract addresses in .env file");
    }

    const factory = await SlothFactoryAncient8.attach(FACTORY_ADDRESS);
    const a8Token = await ethers.getContractAt("IA8Token", A8_TOKEN_ADDRESS);

    // Get signer
    const [signer] = await ethers.getSigners();

    // Amount of A8 tokens to spend (e.g., 1 A8 token)
    const amountA8ToSpend = ethers.parseEther("1");

    // Check A8 token balance
    const balance = await a8Token.balanceOf(signer.address);
    console.log("Your A8 balance:", ethers.formatEther(balance), "A8 tokens");
    
    if (balance < amountA8ToSpend) {
      throw new Error(`Insufficient A8 token balance. Need ${ethers.formatEther(amountA8ToSpend)} A8 tokens but you have ${ethers.formatEther(balance)}`);
    }

    // Check and set allowance for A8 tokens
    const allowance = await a8Token.allowance(signer.address, FACTORY_ADDRESS);
    if (allowance < amountA8ToSpend) {
      console.log("Approving A8 tokens...");
      const approveTx = await a8Token.approve(FACTORY_ADDRESS, amountA8ToSpend);
      await approveTx.wait();
      console.log("A8 tokens approved successfully");
    }

    // Calculate expected tokens
    const expectedTokens = await calculateExpectedTokens(factory, TOKEN_ADDRESS, amountA8ToSpend);
    console.log("Expected tokens:", ethers.formatEther(expectedTokens));
    
    // Add 15% slippage tolerance
    const slippageTolerance = 0.15;
    const amount0OutMin = expectedTokens * ethers.getBigInt(Math.floor(100 - (slippageTolerance * 100))) / ethers.getBigInt(100);

    console.log("\nBuying tokens with parameters:");
    console.log("A8 Amount to spend:", ethers.formatEther(amountA8ToSpend));
    console.log("Minimum tokens to receive:", ethers.formatEther(amount0OutMin));

    // Buy tokens
    console.log("\nSending transaction...");
    const tx = await factory.buy(TOKEN_ADDRESS, amount0OutMin);

    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("Buy transaction completed successfully!");

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