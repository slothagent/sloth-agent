const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy parameters
  const msig = "0x40550d2C3574c696446663FB911ee9EfDB7bf964"; // Replace with your multisig address
  const dojoRouter = '0xb4EE3D56ca23d056345ac771297e42Ce108f0F62';  // Replace with Shadow router address
  const A8Token = '0xfC57492d6569f6F45Ea1b8850e842Bf5F9656EA6';

  // Deploy SlothFactory
  const SlothFactory = await hre.ethers.getContractFactory("SlothFactoryAncient8");
  const slothFactory = await SlothFactory.deploy(msig, dojoRouter, A8Token);
  await slothFactory.waitForDeployment();

  const slothFactoryAddress = await slothFactory.getAddress();
  console.log("SlothFactoryAncient8 deployed to:", slothFactoryAddress);

  // Verify contract on Etherscan
  console.log("Waiting for 5 block confirmations...");
  const deployTx = await slothFactory.deploymentTransaction();
  await deployTx.wait(5);
  
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: slothFactoryAddress,
    constructorArguments: [msig, dojoRouter, A8Token],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 