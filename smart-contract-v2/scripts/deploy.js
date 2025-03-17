const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy parameters
  const msig = "0x40550d2C3574c696446663FB911ee9EfDB7bf964"; // Replace with your multisig address
  const shadowRouter = process.env.SHADOW_ROUTER;  // Replace with Shadow router address

  // Deploy SlothFactory
  const SlothFactory = await hre.ethers.getContractFactory("SlothFactory");
  const slothFactory = await SlothFactory.deploy(msig, shadowRouter);
  await slothFactory.waitForDeployment();

  const slothFactoryAddress = await slothFactory.getAddress();
  console.log("SlothFactory deployed to:", slothFactoryAddress);

  // Verify contract on Etherscan
  console.log("Waiting for 5 block confirmations...");
  const deployTx = await slothFactory.deploymentTransaction();
  await deployTx.wait(5);
  
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: slothFactoryAddress,
    constructorArguments: [msig, shadowRouter],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 