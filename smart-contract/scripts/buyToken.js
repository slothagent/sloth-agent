require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    try {
        // Connect to the network using private key
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Contract addresses of existing token and curve
        const TOKEN_ADDRESS = "0xbAD87119C50e8c3B8f72fd65b4CBAaE00518C7ab";
        const CURVE_ADDRESS = "0x18B65f3e741d3bc1Adf2C62146e9c135De29e849";

        console.log("Connected wallet address:", wallet.address);

        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log("\nWallet balance:", ethers.formatEther(balance), "ETH");

        // Connect to Token contract
        const Token = await ethers.getContractFactory("ContractErc20");
        const token = Token.attach(TOKEN_ADDRESS).connect(wallet);
        
        // Get initial balance and total supply
        const balanceBefore = await token.balanceOf(wallet.address);
        const totalSupply = await token.totalSupply();
        console.log("\nToken total supply:", ethers.formatEther(totalSupply));
        console.log("Initial token balance:", ethers.formatEther(balanceBefore));
        
        // Connect to BondingCurve (AMM) contract
        const BondingCurve = await ethers.getContractFactory("BondingCurve");
        const bondingCurve = BondingCurve.attach(CURVE_ADDRESS).connect(wallet);

        // Get AMM stats
        const currentPrice = await bondingCurve.getCurrentPrice();
        const reserveBalance = await bondingCurve.reserveBalance();
        const reserveWeight = await bondingCurve.reserveWeight();
        const initialSupply = await bondingCurve.initialSupply();
        const curveSupply = await bondingCurve.totalSupply();
        
        console.log("\nAMM Statistics:");
        console.log("Current price:", ethers.formatEther(currentPrice), "ETH per token");
        console.log("Reserve balance:", ethers.formatEther(reserveBalance), "ETH");
        console.log("Reserve weight:", Number(reserveWeight) / 10000, "%");
        console.log("Initial supply:", ethers.formatEther(initialSupply));
        console.log("Current curve supply:", ethers.formatEther(curveSupply));
        console.log("Available supply:", ethers.formatEther(initialSupply - curveSupply));

        // Get funding status
        const fundingRaised = await bondingCurve.getTotalFundingRaised();
        const fundingGoal = await bondingCurve.FUNDING_GOAL();
        const progress = (fundingRaised * 100n) / fundingGoal;
        console.log("\nFunding progress:", Number(progress), "%");
        console.log("Total raised:", ethers.formatEther(fundingRaised), "ETH");
        console.log("Funding goal:", ethers.formatEther(fundingGoal), "ETH");

        // Start with smaller amount to test
        let ethAmount = ethers.parseEther("2"); // Start with 0.1 ETH
        console.log("\nTesting purchase with:", ethers.formatEther(ethAmount), "ETH");
        
        // Calculate expected tokens
        let estimatedTokens = await bondingCurve.calculateTokensForEth(ethAmount);
        console.log("Estimated tokens to receive:", ethers.formatEther(estimatedTokens));

        if (estimatedTokens === 0n) {
            console.log("\nTrying to adjust ETH amount to get valid token amount...");
            // Try increasing ETH amount until we get valid token amount or hit 1 ETH limit
            while (estimatedTokens === 0n && ethAmount < ethers.parseEther("2")) {
                ethAmount = ethAmount * 2n;
                estimatedTokens = await bondingCurve.calculateTokensForEth(ethAmount);
                console.log(`For ${ethers.formatEther(ethAmount)} ETH: ${ethers.formatEther(estimatedTokens)} tokens`);
            }
        }

        if (estimatedTokens === 0n) {
            throw new Error("Cannot calculate valid token amount even with 1 ETH");
        }

        // Check if we have enough balance
        if (balance < ethAmount) {
            throw new Error(`Insufficient balance. Need ${ethers.formatEther(ethAmount)} ETH`);
        }

        // Buy tokens through AMM
        console.log("\nExecuting purchase through AMM...");
        console.log(`Buying with ${ethers.formatEther(ethAmount)} ETH`);
        console.log(`Minimum tokens to receive: ${ethers.formatEther(estimatedTokens)}`);

        const buyTx = await bondingCurve.buy(
            estimatedTokens, // minTokens
            wallet.address,  // buyer
            { 
                value: ethAmount,
                gasLimit: 500000 // Added explicit gas limit
            }
        );
        console.log("Transaction hash:", buyTx.hash);

        // Wait for transaction to be mined
        const buyReceipt = await buyTx.wait();
        console.log("Transaction confirmed!");
        
        // Get buy event details
        const buyEvent = buyReceipt.logs.find(
            log => log.fragment && log.fragment.name === 'Buy'
        );
        const tokensBought = buyEvent.args[1];
        const ethPaid = buyEvent.args[2];

        console.log("\nPurchase successful!");
        console.log("Tokens received:", ethers.formatEther(tokensBought));
        console.log("ETH paid:", ethers.formatEther(ethPaid));
        console.log("Effective price per token:", ethers.formatEther(ethPaid) / ethers.formatEther(tokensBought), "ETH");

        // Check new balance
        const balanceAfter = await token.balanceOf(wallet.address);
        console.log("\nNew token balance:", ethers.formatEther(balanceAfter));
        console.log("Balance increase:", ethers.formatEther(balanceAfter - balanceBefore));

        // Get updated AMM stats
        const newPrice = await bondingCurve.getCurrentPrice();
        const newReserveBalance = await bondingCurve.reserveBalance();
        
        console.log("\nUpdated AMM Statistics:");
        console.log("New price:", ethers.formatEther(newPrice), "ETH per token");
        console.log("Price increase:", ethers.formatEther(newPrice - currentPrice), "ETH");
        console.log("New reserve balance:", ethers.formatEther(newReserveBalance), "ETH");

        // Get new funding progress
        const newFundingRaised = await bondingCurve.getTotalFundingRaised();
        const newProgress = (newFundingRaised * 100n) / fundingGoal;
        console.log("\nNew funding progress:", Number(newProgress), "%");

    } catch (error) {
        console.error("Error:", error);
        if (error.data) {
            console.error("Error data:", error.data);
        }
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