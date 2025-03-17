const { ethers } = require("hardhat");

async function main() {
    // The SlothFactory contract address
    const FACTORY_ADDRESS = "0xf485B9489722baca8491f754770b2D4EC6dFe0E6";
    
    // Get the contract factory
    const factory = await ethers.getContractAt("SlothFactory", FACTORY_ADDRESS);

    // Create a distribution array that sums to 10000 (BASIS)
    // This is just an example distribution - adjust as needed
    const distribution = [
        240,
        290,
        340,
        390,
        440,
        490,
        540,
        590,
        640,
        680,
        720,
        680,
        640,
        590,
        540,
        490,
        440,
        390,
        340,
        290,
        240
    ];

    try {
        // Create the curve with index 1
        // You can change the index as needed
        const tx = await factory.createCurve(4, distribution);
        console.log("Transaction hash:", tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Curve created successfully!");
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Get the event data
        const event = receipt.events?.find(e => e.event === "CurveCreated");
        if (event) {
        console.log("Curve index:", event.args.curveIndex.toString());
        }
    } catch (error) {
        console.error("Error creating curve:", error.message);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 