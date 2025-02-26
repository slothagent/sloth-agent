const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts for BancorFormula...");

  // Deploy Factory
  const BancorFormulaFactory = await hre.ethers.getContractFactory("BancorFormula");
  const BancorFormula = await BancorFormulaFactory.deploy();
  await BancorFormula.waitForDeployment();

  const formulaAddress = await BancorFormula.getAddress();
  console.log("BancorFormula deployed to:", formulaAddress);

  // Verify contract on explorer
  console.log("\nVerifying contract...");
  try {
    await hre.run("verify:verify", {
      address: formulaAddress,
      constructorArguments: []
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