const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy FactoryLib first
  const FactoryLib = await hre.ethers.deployContract("FactoryLib");
  await FactoryLib.waitForDeployment();
  console.log("FactoryLib deployed to:", FactoryLib.target);

  // Deploy Factory with creation fee of 0.01 ETH
  const creationFee = hre.ethers.parseEther("0.01");
  const Factory = await hre.ethers.deployContract("Factory", [creationFee], {
    libraries: {
      FactoryLib: FactoryLib.target
    }
  });
  await Factory.waitForDeployment();
  console.log("Factory deployed to:", Factory.target);

  // Verify contracts on explorer
  console.log("Verifying contracts...");
  try {
    await hre.run("verify:verify", {
      address: FactoryLib.target,
      constructorArguments: []
    });

    await hre.run("verify:verify", {
      address: Factory.target,
      constructorArguments: [creationFee],
      libraries: {
        FactoryLib: FactoryLib.target
      }
    });
    console.log("Contracts verified successfully");
  } catch (error) {
    console.error("Error verifying contracts:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 