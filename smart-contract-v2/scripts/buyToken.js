const ethers = require('ethers');
require('dotenv').config();

// Contract addresses
const SLOTH_FACTORY_ADDRESS = process.env.SLOTH_FACTORY_ADDRESS;
const TOKEN_ADDRESS = "0x7697dc7cc0ba4ecde215c8fb912a7949074b9b0a";

// ABI for SlothFactory
const SLOTH_FACTORY_ABI = [
  "function buy(address token, uint256 amount0OutMin) external payable",
  "function tokens(address) external view returns (address creator, address pair, uint8 curveIndex, uint256 currentIndex, uint256 currentValue, uint256 initialSupply, bool hasLaunched)",
  "function curves(uint8) external view returns (uint256[] distribution, uint256 percentOfLP, uint256 avaxAtLaunch)"
];

async function calculateExpectedTokens(slothFactory, tokenAddress, ethAmount) {
  // Get token info
  const tokenInfo = await slothFactory.tokens(tokenAddress);
  console.log("Token Info:", tokenInfo);
  
  // Constants from contract
  const BASIS = ethers.getBigInt(10000);
  const BIN_WIDTH = ethers.getBigInt(2000);
  const COEF = ethers.getBigInt(2);
  
  // Current state
  const currentIndex = ethers.getBigInt(tokenInfo.currentIndex);
  const initialSupply = ethers.getBigInt(tokenInfo.initialSupply);
  
  // Calculate expected tokens based on contract's _buy logic
  const tradingFee = ethers.getBigInt(100); // 1%
  const ethValue = ethers.parseEther(ethAmount);
  const fee = (ethValue * tradingFee) / BASIS;
  const value = ethValue - fee;
  
  // Calculate tokens per ETH at current index
  const binWidthMultiplier = BIN_WIDTH * currentIndex;
  const denominator = BASIS + binWidthMultiplier;
  const amountPerAVAX = (initialSupply * COEF) / denominator;
  const expectedTokens = (amountPerAVAX * value) / ethers.parseEther("1");
  
  return expectedTokens;
}

async function buyToken() {
  try {
    // Connect to provider
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    // Connect wallet using private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Create contract instance
    const slothFactory = new ethers.Contract(SLOTH_FACTORY_ADDRESS, SLOTH_FACTORY_ABI, wallet);
    
    // Amount of ETH to spend (in ether)
    const ethAmount = "1.0";
    
    // Calculate expected tokens automatically
    const expectedTokens = await calculateExpectedTokens(slothFactory, TOKEN_ADDRESS, ethAmount);
    console.log("Expected tokens:", ethers.formatEther(expectedTokens));
    
    // Add 15% slippage tolerance
    const slippageTolerance = 0.15;
    const minTokensOut = expectedTokens * ethers.getBigInt(Math.floor(100 - (slippageTolerance * 100))) / ethers.getBigInt(100);
    console.log("Minimum tokens to receive:", ethers.formatEther(minTokensOut));
    
    // Execute buy transaction
    const tx = await slothFactory.buy(
      TOKEN_ADDRESS,
      minTokensOut,
      {
        value: ethers.parseEther(ethAmount),
        gasLimit: 500000
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the buy function
buyToken(); 