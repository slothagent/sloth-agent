const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts for BancorFactory...");

  const formulaAddress = "0x4288Eed15554A3290c0D9Ea33CC2D1D1f5542371";
  const creationFee = "1000000000000000000";
  const treasuryAddress = "0x40550d2C3574c696446663FB911ee9EfDB7bf964";

  // Deploy Factory
  const BancorFactoryFactory = await hre.ethers.getContractFactory("BancorFactory");
  const BancorFactory = await BancorFactoryFactory.deploy(formulaAddress, creationFee, treasuryAddress);
  await BancorFactory.waitForDeployment();

  const factoryAddress = await BancorFactory.getAddress();
  console.log("BancorFactory deployed to:", factoryAddress);

  // Verify contract on explorer
  console.log("\nVerifying contract...");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [
        formulaAddress,
        creationFee,
        treasuryAddress
      ]
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 