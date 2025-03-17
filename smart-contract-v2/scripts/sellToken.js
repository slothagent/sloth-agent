const ethers = require('ethers');
require('dotenv').config();

// Contract addresses
const SLOTH_FACTORY_ADDRESS = process.env.SLOTH_FACTORY_ADDRESS;
const TOKEN_ADDRESS = "0xB187FF57253FeDf77Bf03Cd946E1f82C2d195154";

// ABI for SlothFactory and ERC20
const SLOTH_FACTORY_ABI = [
  "function sell(address token, uint256 amount0In, uint256 amount1OutMin) external",
  "function tokens(address) external view returns (address creator, address pair, uint8 curveIndex, uint256 currentIndex, uint256 currentValue, uint256 initialSupply, bool hasLaunched)"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function calculateMinimumEthOut(slothFactory, tokenAddress, tokenAmount) {
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
  
  // Calculate expected ETH based on contract's sell logic
  const amountPerAVAX = (initialSupply * COEF) / (BASIS + (BIN_WIDTH * currentIndex));
  const expectedEth = (tokenAmount * ethers.parseEther("1")) / amountPerAVAX;
  
  // Apply trading fee (1%)
  const tradingFee = ethers.getBigInt(100);
  const fee = (expectedEth * tradingFee) / BASIS;
  const finalEth = expectedEth - fee;
  
  return finalEth;
}

async function sellToken() {
  try {
    // Connect to provider
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    // Connect wallet using private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Create contract instances
    const slothFactory = new ethers.Contract(SLOTH_FACTORY_ADDRESS, SLOTH_FACTORY_ABI, wallet);
    const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
    
    // Get token balance
    const balance = await token.balanceOf(wallet.address);
    console.log("Current token balance:", ethers.formatEther(balance));
    
    // Calculate 20% of balance
    const amountToSell = (balance * ethers.getBigInt(20)) / ethers.getBigInt(100);
    console.log("Amount to sell (20%):", ethers.formatEther(amountToSell));
    
    // Calculate minimum ETH to receive
    const expectedEth = await calculateMinimumEthOut(slothFactory, TOKEN_ADDRESS, amountToSell);
    
    // Add 15% slippage tolerance
    const slippageTolerance = 0.15;
    const minEthOut = expectedEth * ethers.getBigInt(Math.floor(100 - (slippageTolerance * 100))) / ethers.getBigInt(100);
    console.log("Minimum ETH to receive:", ethers.formatEther(minEthOut));
    
    // Check allowance
    const allowance = await token.allowance(wallet.address, SLOTH_FACTORY_ADDRESS);
    if (allowance < amountToSell) {
      console.log("Approving tokens...");
      const approveTx = await token.approve(SLOTH_FACTORY_ADDRESS, amountToSell);
      await approveTx.wait();
      console.log("Approval confirmed");
    }
    
    // Execute sell transaction
    console.log("Executing sell...");
    const tx = await slothFactory.sell(
      TOKEN_ADDRESS,
      amountToSell,
      minEthOut
    );
    
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Get new balance
    const newBalance = await token.balanceOf(wallet.address);
    console.log("New token balance:", ethers.formatEther(newBalance));
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the sell function
sellToken(); 