const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying PairFactory with account:", deployer.address);

  // Get contract factory
  const PairFactory = await hre.ethers.getContractFactory("PairFactory");

  // Deploy parameters
  const voter = process.env.VOTER_ADDRESS;
  const treasury = process.env.TREASURY_ADDRESS;
  const accessHub = process.env.ACCESS_HUB_ADDRESS;
  const feeRecipientFactory = process.env.FEE_RECIPIENT_FACTORY_ADDRESS;

  // Validate parameters
  if (!voter || !treasury || !accessHub || !feeRecipientFactory) {
    throw new Error("Missing required environment variables for deployment");
  }

  console.log("Deploying with parameters:");
  console.log("- Voter:", voter);
  console.log("- Treasury:", treasury);
  console.log("- AccessHub:", accessHub);
  console.log("- FeeRecipientFactory:", feeRecipientFactory);

  // Deploy contract
  const pairFactory = await PairFactory.deploy(
    voter,
    treasury,
    accessHub,
    feeRecipientFactory
  );

  await pairFactory.waitForDeployment();
  const pairFactoryAddress = await pairFactory.getAddress();

  console.log("PairFactory deployed to:", pairFactoryAddress);

  // Verify contract on Etherscan if not on a local network
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 31337 && network.chainId !== 1337) { // Not local network
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: pairFactoryAddress,
      constructorArguments: [
        voter,
        treasury,
        accessHub,
        feeRecipientFactory
      ],
    });
  }

  return pairFactoryAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 