require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    try {
        // Connect to the network using private key
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Factory contract address
        const FACTORY_ADDRESS = "0x6E1A33A69036247dff6763634eAb015452E2b347";
        
        // Connect to Factory contract
        const Factory = await ethers.getContractFactory("Factory");
        const factory = Factory.attach(FACTORY_ADDRESS).connect(wallet);

        console.log("Connected wallet address:", wallet.address);

        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log("\nWallet balance:", ethers.formatEther(balance), "ETH");
        
        // Creation fee is 1 ETH
        const CREATION_FEE = ethers.parseEther("1");
        if (balance < CREATION_FEE) {
            throw new Error(`Insufficient balance for creation fee. Need ${ethers.formatEther(CREATION_FEE)} ETH`);
        }

        // 1. Create new token
        console.log("\nCreating new Continuous Token...");
        const tokenParams = {
            name: "Test Continuous Token",
            symbol: "TCT",
        };

        // Create token and curve
        const createTx = await factory.createTokenAndCurve(
            tokenParams.name,
            tokenParams.symbol,
            { value: CREATION_FEE }
        );
        console.log("Create transaction hash:", createTx.hash);
        
        // Wait for transaction to be mined
        const createReceipt = await createTx.wait();
        console.log("Token and Curve created!");

        // Get token and curve addresses from event
        const createEvent = createReceipt.logs.find(
            log => log.fragment && log.fragment.name === 'TokenAndCurveCreated'
        );
        const tokenAddress = createEvent.args[0];
        const curveAddress = createEvent.args[1];

        console.log("\nToken address:", tokenAddress);
        console.log("Curve address:", curveAddress);

        // Connect to Token contract
        const Token = await ethers.getContractFactory("ContractErc20");
        const token = Token.attach(tokenAddress).connect(wallet);

        // Get initial token balance
        const initialBalance = await token.balanceOf(wallet.address);
        console.log("\nInitial token balance:", ethers.formatEther(initialBalance));

        // 2. Buy tokens through Bonding Curve
        console.log("\nBuying tokens through AMM...");
        
        // Connect to BondingCurve contract
        const BondingCurve = await ethers.getContractFactory("BondingCurve");
        const bondingCurve = BondingCurve.attach(curveAddress).connect(wallet);

        // Get current price
        const currentPrice = await bondingCurve.getCurrentPrice();
        console.log("Current price:", ethers.formatEther(currentPrice), "ETH per token");

        // Calculate tokens for 0.1 ETH
        const ethAmount = ethers.parseEther("1"); // Reduced from 1 ETH to 0.1 ETH
        
        // Check if we have enough balance for purchase
        const newBalance = await provider.getBalance(wallet.address);
        if (newBalance < ethAmount) {
            throw new Error(`Insufficient balance for purchase. Need ${ethers.formatEther(ethAmount)} ETH`);
        }

        const estimatedTokens = await bondingCurve.calculateTokensForEth(ethAmount);
        console.log("\nEstimated tokens for 0.1 ETH:", ethers.formatEther(estimatedTokens));

        // Buy tokens
        const buyTx = await bondingCurve.buy(
            estimatedTokens, // minTokens
            wallet.address,  // buyer
            { 
                value: ethAmount,
                gasLimit: 500000 // Added explicit gas limit
            }
        );
        console.log("Buy transaction hash:", buyTx.hash);

        // Wait for transaction to be mined
        const buyReceipt = await buyTx.wait();
        
        // Get buy event details
        const buyEvent = buyReceipt.logs.find(
            log => log.fragment && log.fragment.name === 'Buy'
        );
        const tokensBought = buyEvent.args[1];
        const ethPaid = buyEvent.args[2];

        console.log("\nPurchase successful!");
        console.log("Tokens bought:", ethers.formatEther(tokensBought));
        console.log("ETH paid:", ethers.formatEther(ethPaid));

        // Get new balance
        const newTokenBalance = await token.balanceOf(wallet.address);
        console.log("\nNew token balance:", ethers.formatEther(newTokenBalance));
        console.log("Balance increase:", ethers.formatEther(newTokenBalance - initialBalance));

        // Get new price
        const newPrice = await bondingCurve.getCurrentPrice();
        console.log("\nNew price:", ethers.formatEther(newPrice), "ETH per token");
        console.log("Price increase:", ethers.formatEther(newPrice - currentPrice), "ETH");

        // Get funding progress
        const fundingRaised = await bondingCurve.getTotalFundingRaised();
        const fundingGoal = await bondingCurve.FUNDING_GOAL();
        const progress = (fundingRaised * 100n) / fundingGoal;
        console.log("\nFunding progress:", Number(progress), "%");

    } catch (error) {
        console.error("Error:", error);
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 