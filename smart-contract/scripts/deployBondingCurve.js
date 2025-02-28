const hre = require("hardhat");

async function main() {
  console.log("Deploying BondingCurve contract...");

  // Deploy BondingCurve
  const BondingCurve = await hre.ethers.deployContract("BondingCurve", ['0x0e8AB8A9fDa2d1d01b2d0Da98D678004df47aa2d', 500000, 800000000]);
  await BondingCurve.waitForDeployment();
  console.log("BondingCurve deployed to:", BondingCurve.target);

  // Verify contract on explorer
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: BondingCurve.target,
      constructorArguments: ['0x0e8AB8A9fDa2d1d01b2d0Da98D678004df47aa2d', 500000, 800000000]
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 