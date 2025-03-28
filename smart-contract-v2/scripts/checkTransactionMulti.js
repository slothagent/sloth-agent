const { AxelarQueryAPI, Environment, EvmChain } = require('@axelar-network/axelarjs-sdk');

// Initialize Axelar Query API
const api = new AxelarQueryAPI({
    environment: Environment.TESTNET, // or Environment.MAINNET for mainnet
});

// Sample transaction data structure
const transactions = [
    {
        sourceChain: EvmChain.ETHEREUM,
        destinationChain: EvmChain.POLYGON,
        txHash: "YOUR_TX_HASH_1",
    },
    {
        sourceChain: EvmChain.AVALANCHE,
        destinationChain: EvmChain.FANTOM,
        txHash: "YOUR_TX_HASH_2",
    },
    // Add more transactions as needed
];

async function checkTransactionStatus(transaction) {
    try {
        const { sourceChain, destinationChain, txHash } = transaction;
        
        // Get gas status
        const gasStatus = await api.estimateGasFee(
            sourceChain,
            destinationChain,
            50000, // Example gas limit - adjust based on your needs
            1.1 // Gas multiplier for safety margin
        );

        console.log(`\nTransaction: ${txHash}`);
        console.log(`Source Chain: ${sourceChain}`);
        console.log(`Destination Chain: ${destinationChain}`);
        console.log(`Estimated Gas Fee: ${gasStatus} wei`);

        // You can add more status checks here based on your needs
        // For example:
        // - Check if transaction is completed
        // - Check for specific events
        // - Check token transfer status

    } catch (error) {
        console.error(`Error checking transaction ${transaction.txHash}:`, error.message);
    }
}

async function checkAllTransactions() {
    console.log("Starting transaction status check...");
    
    // Check all transactions in parallel
    const promises = transactions.map(tx => checkTransactionStatus(tx));
    await Promise.all(promises);
    
    console.log("\nCompleted checking all transactions");
}

// Run the script
checkAllTransactions().catch(console.error); 