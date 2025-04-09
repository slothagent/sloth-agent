const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  // Get the SlothFactory contract
  const slothFactory = await ethers.getContractAt(
    "SlothFactory",
    process.env.SLOTH_FACTORY_ADDRESS
  );

  // Token parameters
  const name = "Test Token";
  const symbol = "TEST";
  const totalSupply = ethers.parseEther("1000000000"); // 1billion tokens
  const curveIndex = 2;

  // Get the create fee from the contract
  const createFee = await slothFactory.createFee();
  
  // Additional ETH to send for initial liquidity (optional)
  const additionalEth = ethers.parseEther("1"); // 1 ETH
  
  const totalValue = createFee + additionalEth;

  console.log(`Creating token with parameters:
    Name: ${name}
    Symbol: ${symbol}
    Total Supply: 1,000,000,000
    Curve Index: ${curveIndex}
    Create Fee: ${ethers.formatEther(createFee)} ETH
    Additional ETH: ${ethers.formatEther(additionalEth)} ETH
  `);

  try {
    // Create the token
    const tx = await slothFactory.createToken(
      name,
      symbol,
      totalSupply,
      curveIndex,
      { value: totalValue }
    );

    console.log("Transaction sent:", tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Get the token address from the TokenCreated event
    const event = receipt.events.find(e => e.event === "TokenCreated");
    const tokenAddress = event.args.token;
    
    console.log(`
    Token created successfully!
    Token Address: ${tokenAddress}
    Transaction Hash: ${receipt.transactionHash}
    Gas Used: ${receipt.gasUsed.toString()}
    `);

  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 