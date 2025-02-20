const hre = require("hardhat");

async function main() {
    console.log("Starting contract verification...");

    const factoryAddress = "0xEfD274F10fD2dF021be3d910d66C24C94E24cD98";
    const factoryLibAddress = "0x5D67608eaa7906Cd786894Eca81b8837e88de7c4"; // You need to replace this with actual FactoryLib address
    const creationFee = hre.ethers.parseEther("0.001137"); // $3 in ETH

    // First verify FactoryLib
    console.log("\nVerifying FactoryLib...");
    try {
        await hre.run("verify:verify", {
            address: factoryLibAddress,
            constructorArguments: []
        });
        console.log("FactoryLib verified successfully!");
    } catch (error) {
        console.log("Error verifying FactoryLib:", error.message);
    }

    // Then verify Factory
    console.log("\nVerifying Factory...");
    try {
        await hre.run("verify:verify", {
            address: factoryAddress,
            constructorArguments: [creationFee],
            libraries: {
                FactoryLib: factoryLibAddress
            }
        });
        console.log("Factory verified successfully!");
    } catch (error) {
        console.log("Error verifying Factory:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 