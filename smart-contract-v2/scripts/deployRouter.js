const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the contract factory
    const Router = await ethers.getContractFactory("Router");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Router with account:", deployer.address);

    // Get factory and WETH addresses from environment or config
    // You should replace these with your actual deployed addresses
    const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
    const WETH_ADDRESS = process.env.WETH_ADDRESS;

    if (!FACTORY_ADDRESS || !WETH_ADDRESS) {
      throw new Error("FACTORY_ADDRESS and WETH_ADDRESS must be set in environment variables");
    }

    // Deploy the contract
    console.log("Deploying Router...");
    const router = await Router.deploy(FACTORY_ADDRESS, WETH_ADDRESS);
    await router.waitForDeployment();
    
    const routerAddress = await router.getAddress();
    console.log("Router deployed to:", routerAddress);
    console.log("Factory address:", FACTORY_ADDRESS);
    console.log("WETH address:", WETH_ADDRESS);

    // Verify contract on Etherscan
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337 && network.chainId !== 1337) { // Not local network
      console.log("Waiting for 6 block confirmations before verification...");
      const deployTx = router.deploymentTransaction();
      await deployTx.wait(6);

      await hre.run("verify:verify", {
        address: routerAddress,
        constructorArguments: [FACTORY_ADDRESS, WETH_ADDRESS],
      });
      console.log("Router contract verified on Etherscan");
    }

  } catch (error) {
    console.error("Error deploying Router contract:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 