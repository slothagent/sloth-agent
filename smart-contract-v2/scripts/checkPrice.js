const { ethers } = require('ethers');
const slothFactoryABI = require('../abi/slothFactoryABI');

const BIN_WIDTH = 2000;
const BASIS = 10000;
const COEF = 2;
const ETHER = ethers.parseEther("1");

// Calculate tokens per SONIC for a specific bin
function calculateTokensPerSonic(initialSupply, binIndex) {
  return (BigInt(initialSupply) * BigInt(COEF)) / BigInt(BASIS + (BIN_WIDTH * binIndex));
}

// Calculate SONIC price for tokens in a specific bin
function calculateSonicPrice(binIndex) {
  return ETHER * BigInt(BASIS + (BIN_WIDTH * binIndex)) / BigInt(BASIS);
}

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

async function main() {
  // Connect to the network
  const provider = new ethers.JsonRpcProvider('https://rpc.blaze.soniclabs.com');

  // Token address you want to check
  const tokenAddress = '0xB187FF57253FeDf77Bf03Cd946E1f82C2d195154';
  const slothFactoryAddress = '0xf485B9489722baca8491f754770b2D4EC6dFe0E6';

  const slothFactory = new ethers.Contract(slothFactoryAddress, slothFactoryABI, provider);
  
  try {
    // First check if the token exists by checking allTokens array length
    const totalTokens = await slothFactory.allTokensLength();
    console.log(`Total tokens in factory: ${totalTokens}`);
    
    // Try to get token info
    const tokenInfo = await slothFactory.tokens(tokenAddress);
    console.log('\nToken exists in factory. Info:');
    console.log(`Creator: ${tokenInfo.creator}`);
    console.log(`Pair: ${tokenInfo.pair}`);
    console.log(`Current Bin: ${tokenInfo.currentIndex}`);
    console.log(`Tokens in Bin: ${ethers.formatEther(tokenInfo.currentValue)} tokens`);
    console.log(`Initial Supply: ${ethers.formatEther(tokenInfo.initialSupply)} tokens`);
    console.log(`Curve Index: ${tokenInfo.curveIndex}`);
    console.log(`Has Launched: ${tokenInfo.hasLaunched}`);

    // Calculate percentage of tokens remaining in bin
    if (tokenInfo.initialSupply > 0) {
      const percentageInBin = (Number(tokenInfo.currentValue) * 100) / Number(tokenInfo.initialSupply);
      console.log(`\nPercentage of tokens in current bin: ${percentageInBin.toFixed(2)}%`);

      // Calculate current bin details
      const currentBin = Number(tokenInfo.currentIndex);
      const tokensPerSonic = calculateTokensPerSonic(tokenInfo.initialSupply, currentBin);
      const sonicPrice = calculateSonicPrice(currentBin);
      
      console.log('\nCurrent Bin Details:');
      console.log(`Tokens per SONIC: ${ethers.formatEther(tokensPerSonic)} tokens`);
      console.log(`SONIC Price: ${ethers.formatEther(sonicPrice)} SONIC`);
      
      // Calculate how many SONIC needed for all tokens in current bin
      const sonicNeeded = tokenInfo.currentValue * ETHER / tokensPerSonic;
      console.log(`SONIC needed to buy all tokens in bin: ${ethers.formatEther(sonicNeeded)} SONIC`);
    }

  } catch (error) {
    if (error.code === 'BAD_DATA' && error.value === '0x') {
      console.error('Error: Token does not exist in the SlothFactory');
    } else {
      console.error('Error:', error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 