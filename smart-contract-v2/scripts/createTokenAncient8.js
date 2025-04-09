const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  try {
    // Get the contract factory
    const SlothFactoryAncient8 = await ethers.getContractFactory("SlothFactoryAncient8");
    
    // Get the deployed contract address
    const FACTORY_ADDRESS = process.env.SLOTH_FACTORY_ADDRESS;
    const A8_TOKEN_ADDRESS = process.env.A8_TOKEN_ADDRESS; // Make sure to add this to your .env file
    
    if (!FACTORY_ADDRESS || !A8_TOKEN_ADDRESS) {
      throw new Error("Missing contract addresses in .env file");
    }

    const factory = await SlothFactoryAncient8.attach(FACTORY_ADDRESS);
    
    // Get A8 Token contract using getContractAt instead of getContractFactory
    const a8Token = await ethers.getContractAt("IA8Token", A8_TOKEN_ADDRESS);


    // Get creation fee
    const createFee = await factory.createFee();
    console.log("Creation fee required:", ethers.formatEther(createFee), "A8 tokens");

    // Check A8 token balance
    const [signer] = await ethers.getSigners();
    const balance = await a8Token.balanceOf(signer.address);
    console.log("Your A8 balance:", ethers.formatEther(balance), "A8 tokens");
    
    if (balance < createFee) {
      throw new Error(`Insufficient A8 token balance. Need ${ethers.formatEther(createFee)} A8 tokens but you have ${ethers.formatEther(balance)}`);
    }

    // Check and set allowance for A8 tokens
    const allowance = await a8Token.allowance(signer.address, FACTORY_ADDRESS);
    if (allowance < createFee) {
      console.log("Approving A8 tokens...");
      const approveTx = await a8Token.approve(FACTORY_ADDRESS, createFee);
      await approveTx.wait();
      console.log("A8 tokens approved successfully");
    }

    // Token parameters
    const tokenName = "MySlothToken";
    const tokenSymbol = "MST";
    const totalSupply = ethers.parseEther("1000000"); // 1 million tokens
    const curveIndex = 2;

    // Check if curve exists
    const curve = await factory.curves(curveIndex);
    if (curve.percentOfLP === 0n) {
      throw new Error("Curve does not exist at specified index");
    }

    console.log("\nCreating token with parameters:");
    console.log("Name:", tokenName);
    console.log("Symbol:", tokenSymbol);
    console.log("Total Supply:", ethers.formatEther(totalSupply));
    console.log("Curve Index:", curveIndex);

    // Create token
    console.log("\nSending transaction...");
    const tx = await factory.createToken(
      tokenName,
      tokenSymbol,
      totalSupply,
      curveIndex
    );

    console.log("Transaction hash:", tx.hash);

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
