const hre = require("hardhat");

async function main() {
  console.log("Deploying BondingCurve contract...");

  // Deploy BondingCurve
  const BondingCurve = await hre.ethers.deployContract("BondingCurve");
  await BondingCurve.waitForDeployment();
  console.log("BondingCurve deployed to:", BondingCurve.target);

  // Verify contract on explorer
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: BondingCurve.target,
      constructorArguments: []
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }

  // Log important contract parameters
  console.log("\nContract Parameters:");
  console.log("-------------------");
  console.log("MAX_SUPPLY:", await BondingCurve.MAX_SUPPLY());
  console.log("INIT_SUPPLY:", await BondingCurve.INIT_SUPPLY());
  console.log("INITIAL_PRICE:", await BondingCurve.INITIAL_PRICE());
  console.log("TOKEN_CREATION_FEE:", await BondingCurve.TOKEN_CREATION_PLATFORM_FEE());
  console.log("FUNDING_GOAL:", await BondingCurve.MEMECOIN_FUNDING_GOAL());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 