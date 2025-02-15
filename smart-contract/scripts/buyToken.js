const { ethers } = require("hardhat");

async function main() {
    try {
        // Contract addresses
        const FACTORY_ADDRESS = "0xEfD274F10fD2dF021be3d910d66C24C94E24cD98";
        const TOKEN_ADDRESS = "0x1BBeb098795744A8FD10687348fDFFdf8236D424";

        // Get the Factory contract
        const factory = await ethers.getContractAt("Factory", FACTORY_ADDRESS);

        // Amount of ETH to spend
        const ethToSpend = ethers.parseEther("0.0001"); // 0.0001 ETH
        console.log("\nETH to spend:", ethers.formatEther(ethToSpend), "ETH");

        // Get current token price first
        const currentPrice = await factory.getCurrentTokenPrice(TOKEN_ADDRESS);
        console.log("Current token price:", ethers.formatEther(currentPrice), "ETH");

        // Calculate estimated tokens we can get
        const estimatedTokens = await factory.calculateTokensForEth(TOKEN_ADDRESS, ethToSpend);
        console.log("Estimated tokens to receive:", ethers.formatUnits(estimatedTokens, 18));

        // Buy tokens
        console.log("\nBuying tokens...");
        const tx = await factory.buyTokens(
            TOKEN_ADDRESS,
            estimatedTokens,
            { 
                value: ethToSpend,
                gasLimit: 300000
            }
        );

        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();

        // Get purchase details from event
        const event = receipt.events.find(e => e.event === 'Buy');
        if (event) {
            console.log("\nPurchase successful!");
            console.log("Tokens bought:", ethers.formatUnits(event.args.tokenAmount, 18));
            console.log("ETH spent:", ethers.formatEther(event.args.paymentAmount));
        }

    } catch (error) {
        console.error("\nError buying tokens:");
        if (error.reason) {
            console.error("Reason:", error.reason);
        } else {
            console.error(error);
        }
    }
}

// Alternative function to buy specific amount of tokens
async function buySpecificAmount() {
    try {
        const FACTORY_ADDRESS = "0xEdA7f6C80d0135C04329C1624F023a3DE2E7D743";
        const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS"; // Replace with your token address

        const factory = await ethers.getContractAt("Factory", FACTORY_ADDRESS);

        // Amount of tokens to buy (e.g., 1 token)
        const tokensToBuy = ethers.parseUnits("1", 18);

        // Get price for this amount
        const price = await factory.getTokenPrice(TOKEN_ADDRESS, tokensToBuy);
        console.log("Price for tokens:", ethers.formatEther(price), "ETH");

        // Buy tokens
        const tx = await factory.buyTokens(
            TOKEN_ADDRESS,
            tokensToBuy,
            { 
                value: price,
                gasLimit: 300000
            }
        );

        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === 'Buy');
        if (event) {
            console.log("\nPurchase successful!");
            console.log("Tokens bought:", ethers.formatUnits(event.args.tokenAmount, 18));
            console.log("ETH spent:", ethers.formatEther(event.args.paymentAmount));
        }

    } catch (error) {
        console.error("Error buying specific amount:", error);
    }
}

// Uncomment the function you want to use
main()
    // buySpecificAmount()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 