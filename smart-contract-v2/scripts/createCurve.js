const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    // The SlothFactory contract address
    const FACTORY_ADDRESS = process.env.SLOTH_FACTORY_ADDRESS;  
    
    // Get the contract factory
    const factory = await ethers.getContractAt("SlothFactory", FACTORY_ADDRESS);

    // Define all curves' distributions
    const distributions = [
        // Curve 1 - Flat distribution
        [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
        
        // Curve 2 - Ascending distribution (Adjusted for 100,000 tokens)
        [300, 325, 350, 375, 400, 425, 450, 475, 500, 530, 550, 580, 600, 630, 650, 680, 700, 730, 750],
        
        // Curve 3 - Descending distribution
        [750, 730, 700, 680, 650, 630, 600, 580, 550, 530, 500, 475, 450, 425, 400, 375, 350, 325, 300],
        
        // Curve 4 - Bell curve distribution
        [240, 290, 340, 390, 440, 490, 540, 590, 640, 680, 720, 680, 640, 590, 540, 490, 440, 390, 340, 290, 240]
    ];

    // Create each curve
    for (let i = 0; i < distributions.length; i++) {
        try {
            console.log(`Creating curve ${i + 1}...`);
            const tx = await factory.createCurve(i + 1, distributions[i]);
            console.log(`Transaction hash for curve ${i + 1}:`, tx.hash);
            
            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log(`Curve ${i + 1} created successfully!`);
            console.log("Gas used:", receipt.gasUsed.toString());
            
            // Get the event data
            const event = receipt.events?.find(e => e.event === "CurveCreated");
            if (event) {
                console.log("Curve index:", event.args.curveIndex.toString());
            }
        } catch (error) {
            console.error(`Error creating curve ${i + 1}:`, error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 