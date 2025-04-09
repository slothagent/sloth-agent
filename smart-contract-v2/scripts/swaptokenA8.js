require('dotenv').config();
const { ethers } = require('ethers');

// Contract addresses
const ROUTER_ADDRESS = '0xb4EE3D56ca23d056345ac771297e42Ce108f0F62';
const A8_TOKEN_ADDRESS = '0xfC57492d6569f6F45Ea1b8850e842Bf5F9656EA6';

// ABI for the router (only the functions we need)
const ROUTER_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "WETH",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function swapETHForA8(ethAmount, minA8Amount) {
    try {
        // Connect to Ancient8 testnet
        const provider = new ethers.JsonRpcProvider('https://rpcv2-testnet.ancient8.gg');
        
        // Create wallet from private key
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Create contract instance
        const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);

        // Set up swap parameters
        const WETH = await router.WETH();
        const path = [WETH, A8_TOKEN_ADDRESS];
        const to = wallet.address;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
        const amountOutMin = ethers.parseEther(minA8Amount.toString());
        const value = ethers.parseEther(ethAmount.toString());

        console.log('Swapping', ethAmount, 'ETH for A8 tokens...');
        console.log('Wallet address:', wallet.address);

        // Perform the swap
        const tx = await router.swapExactETHForTokens(
            amountOutMin,
            path,
            to,
            deadline,
            {
                value: value,
                gasLimit: 300000 // Adjust gas limit as needed
            }
        );

        console.log('Transaction sent! Waiting for confirmation...');
        console.log('Transaction hash:', tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        
        console.log('Swap successful!');
        console.log('Gas used:', receipt.gasUsed.toString());
        return receipt;

    } catch (error) {
        console.error('Error during swap:', error);
        throw error;
    }
}

// Example usage
async function main() {
    const ethToSwap = 0.01; // Amount of ETH to swap
    const minA8ToReceive = 0; // Minimum amount of A8 tokens to receive (set to 0 for no minimum)

    try {
        await swapETHForA8(ethToSwap, minA8ToReceive);
    } catch (error) {
        console.error('Main execution failed:', error);
    }
}

// Run the script
main();
