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

// Calculate token distribution across all bins (19 bins by default)
function calculateAllBinsDistribution(initialSupply, totalBins = 19) {
  let bins = [];
  let totalTokensAccounted = 0n;
  let remainingSupply = BigInt(initialSupply);
  
  // Use the provided curve for distribution percentages
  // This represents the percentage distribution for each bin
  const curveDistribution = [300, 325, 350, 375, 400, 425, 450, 475, 500, 530, 550, 580, 600, 630, 650, 680, 700, 730, 750];
  
  // Calculate total of curve values to determine percentage ratios
  const totalCurveValue = curveDistribution.reduce((acc, val) => acc + val, 0);
  
  for (let i = 0; i < totalBins; i++) {
    const tokensPerSonic = calculateTokensPerSonic(initialSupply, i);
    const sonicPrice = calculateSonicPrice(i);
    
    // Calculate how many tokens are in this bin based on the curve distribution
    const binDistributionRatio = curveDistribution[i] / totalCurveValue;
    const binTokens = BigInt(Math.floor(Number(initialSupply) * binDistributionRatio));
    
    // Calculate how many SONIC needed to purchase all tokens in this bin
    const sonicNeeded = binTokens * ETHER / tokensPerSonic;
    
    // Add the bin data to our array
    bins.push({
      binIndex: i,
      tokensPerSonic: tokensPerSonic,
      sonicPrice: sonicPrice,
      tokensInBin: binTokens,
      sonicNeeded: sonicNeeded,
      percentageOfTotal: (Number(binTokens) * 100) / Number(initialSupply),
      distributionValue: curveDistribution[i]
    });
    
    totalTokensAccounted += binTokens;
    remainingSupply -= binTokens;
  }
  
  return bins;
}

// Calculate price for specific bin based on the formula: price = basePrice * (100 + (i * 20)) / 100
function calculateBinPrice(basePrice, binIndex) {
  // Convert basePrice to number if it's BigInt
  const basePriceNum = typeof basePrice === 'bigint' ? Number(ethers.formatEther(basePrice)) : Number(basePrice);
  return basePriceNum * (100 + (binIndex * 20)) / 100;
}

// Calculate last non-zero bin price: lastNonZeroPrice = basePrice * (1 + (length-1) * 20/100)
function calculateLastNonZeroBinPrice(basePrice, length) {
  // Convert basePrice to number if it's BigInt
  const basePriceNum = typeof basePrice === 'bigint' ? Number(ethers.formatEther(basePrice)) : Number(basePrice);
  return basePriceNum * (1 + ((length - 1) * 20) / 100);
}

// Calculate required market cap for Metropolis migration: requiredMarketCap = totalDistribution * lastNonZeroPrice
function calculateRequiredMarketCap(totalDistribution, lastNonZeroPrice) {
  return totalDistribution * lastNonZeroPrice;
}

// Calculate cumulative value of all bins: sum(list[i] * price[i])
function calculateCumulativeValue(binsList, pricesList) {
  let cumulativeValue = 0;
  for (let i = 0; i < binsList.length; i++) {
    cumulativeValue += binsList[i] * pricesList[i];
  }
  return cumulativeValue;
}

// Calculate fraction: 10,000 * requiredMarketCap / (cumulativeValue + requiredMarketCap)
function calculateFraction(requiredMarketCap, cumulativeValue) {
  return 10000 * requiredMarketCap / (cumulativeValue + requiredMarketCap);
}

// Calculate the current market cap based on token distribution and prices
function calculateMarketCap(bins, currentBinIndex, tokensInCurrentBin) {
  try {
    // Default price of SONIC in USD (can be updated with actual price feed)
    const sonicPriceInUSD = 0.0077; // Example price, replace with actual price if available
    
    // Use the known holder amount from the user's wallet
    const knownHolderAmount = ethers.parseEther("660185.271140186878640128");
    console.log(`Debug: Known holder amount: ${ethers.formatEther(knownHolderAmount)} tokens`);
    
    // Get the original amount of tokens in the current bin
    const currentBin = bins[currentBinIndex];
    if (!currentBin) {
      throw new Error(`Bin index ${currentBinIndex} not found`);
    }
    
    const originalTokensInCurrentBin = currentBin.tokensInBin;
    
    // Parse the remaining tokens in current bin from the input
    let remainingTokensInCurrentBin;
    try {
      if (typeof tokensInCurrentBin === 'string') {
        // Handle string input
        remainingTokensInCurrentBin = ethers.parseEther(tokensInCurrentBin);
      } else if (typeof tokensInCurrentBin === 'bigint') {
        // Handle BigInt input
        remainingTokensInCurrentBin = tokensInCurrentBin;
      } else if (tokensInCurrentBin === undefined) {
        // Default to original amount if not provided
        remainingTokensInCurrentBin = originalTokensInCurrentBin;
      } else {
        // Try to convert to string and parse
        remainingTokensInCurrentBin = ethers.parseEther(tokensInCurrentBin.toString());
      }
    } catch (error) {
      console.error(`Error parsing tokensInCurrentBin: ${tokensInCurrentBin}`, error);
      // Default to original amount if parsing fails
      remainingTokensInCurrentBin = originalTokensInCurrentBin;
    }
    
    console.log(`Debug: Original tokens in bin ${currentBinIndex}: ${ethers.formatEther(originalTokensInCurrentBin)}`);
    console.log(`Debug: Remaining tokens in bin ${currentBinIndex}: ${ethers.formatEther(remainingTokensInCurrentBin)}`);
    
    // Calculate sold tokens in the current bin
    const soldTokensInCurrentBin = originalTokensInCurrentBin - remainingTokensInCurrentBin;
    console.log(`Debug: Sold tokens in bin ${currentBinIndex}: ${ethers.formatEther(soldTokensInCurrentBin)}`);
    
    // Calculate tokens across all bins and prepare data for calculations
    let totalTokens = 0n;
    const binTokenAmounts = [];
    const binPrices = [];
    
    // Base price is the price of bin 0
    const basePrice = Number(ethers.formatEther(bins[0].sonicPrice));
    
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      totalTokens += bin.tokensInBin;
      
      // For bin calculations in numeric format
      const binTokenAmount = Number(ethers.formatEther(bin.tokensInBin));
      binTokenAmounts.push(binTokenAmount);
      
      // Calculate price according to the formula
      const calculatedPrice = calculateBinPrice(basePrice, i);
      binPrices.push(calculatedPrice);
    }
    
    console.log(`Debug: Total tokens across all bins: ${ethers.formatEther(totalTokens)}`);
    
    // Calculate the last non-zero bin price
    const lastNonZeroBinPrice = calculateLastNonZeroBinPrice(basePrice, bins.length);
    console.log(`Debug: Last non-zero bin price: ${lastNonZeroBinPrice}`);
    
    // Calculate total distribution (sum of all token amounts)
    const totalDistribution = binTokenAmounts.reduce((sum, amount) => sum + amount, 0);
    
    // Calculate required market cap for Metropolis migration
    const requiredMarketCap = calculateRequiredMarketCap(totalDistribution, lastNonZeroBinPrice);
    console.log(`Debug: Required market cap for Metropolis: ${requiredMarketCap}`);
    
    // Calculate cumulative value
    const cumulativeValue = calculateCumulativeValue(binTokenAmounts, binPrices);
    console.log(`Debug: Cumulative value: ${cumulativeValue}`);
    
    // Calculate fraction
    const fraction = calculateFraction(requiredMarketCap, cumulativeValue);
    console.log(`Debug: Fraction: ${fraction}`);
    
    // Method 1: Calculate based on bin distribution
    let methodOneCirulatingSupply = 0n;
    let methodOneRemainingSupply = 0n;
    
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      
      if (i < currentBinIndex) {
        // All tokens in earlier bins are considered sold
        methodOneCirulatingSupply += bin.tokensInBin;
      } else if (i === currentBinIndex) {
        // Add the sold tokens from current bin
        methodOneCirulatingSupply += soldTokensInCurrentBin;
        methodOneRemainingSupply += remainingTokensInCurrentBin;
      } else {
        // Future bins are all remaining
        methodOneRemainingSupply += bin.tokensInBin;
      }
    }
    
    console.log(`Debug: Method 1 - Circulating Supply: ${ethers.formatEther(methodOneCirulatingSupply)}`);
    console.log(`Debug: Method 1 - Remaining Supply: ${ethers.formatEther(methodOneRemainingSupply)}`);
    
    // Method 2: Based on known holder amount (if available)
    // Assume the known holder amount is part of the circulating supply
    const methodTwoCirculatingSupply = knownHolderAmount;
    const methodTwoRemainingSupply = totalTokens - methodTwoCirculatingSupply;
    
    console.log(`Debug: Method 2 - Circulating Supply: ${ethers.formatEther(methodTwoCirculatingSupply)}`);
    console.log(`Debug: Method 2 - Remaining Supply: ${ethers.formatEther(methodTwoRemainingSupply)}`);
    
    // Choose which method to use for final calculation
    // For this case, we'll use Method 2 since we have the known holder amount
    const circulatingSupply = methodTwoCirculatingSupply;
    const remainingSupply = methodTwoRemainingSupply;
    
    // Get current bin price from the bins data
    const currentPrice = bins[currentBinIndex].sonicPrice;
    const currentPriceFormatted = Number(ethers.formatEther(currentPrice));
    
    // Calculate market cap based on current circulating supply and current bin price
    const marketCapInSONIC = Number(ethers.formatEther(circulatingSupply)) * currentPriceFormatted;
    const marketCapInUSD = marketCapInSONIC * sonicPriceInUSD;
    
    // Calculate fully diluted market cap
    const totalSupply = circulatingSupply + remainingSupply;
    const fullyDilutedMarketCapInSONIC = Number(ethers.formatEther(totalSupply)) * currentPriceFormatted;
    const fullyDilutedMarketCapInUSD = fullyDilutedMarketCapInSONIC * sonicPriceInUSD;
    
    // Calculate metropolis migration market cap
    const metropolisMarketCapInSONIC = requiredMarketCap;
    const metropolisMarketCapInUSD = metropolisMarketCapInSONIC * sonicPriceInUSD;
    
    return {
      circulatingSupply,
      remainingSupply,
      totalSupply,
      currentBinPrice: currentPrice,
      currentPriceFormatted,
      sonicPriceInUSD,
      marketCapInSONIC,
      marketCapInUSD,
      fullyDilutedMarketCapInSONIC,
      fullyDilutedMarketCapInUSD,
      lastNonZeroBinPrice,
      requiredMarketCap: metropolisMarketCapInSONIC,
      requiredMarketCapUSD: metropolisMarketCapInUSD,
      cumulativeValue,
      fraction
    };
  } catch (error) {
    console.error("Error calculating market cap:", error);
    return {
      circulatingSupply: 0n,
      remainingSupply: 0n,
      totalSupply: 0n,
      currentBinPrice: 0n,
      currentPriceFormatted: 0,
      sonicPriceInUSD: 0,
      marketCapInSONIC: 0,
      marketCapInUSD: 0,
      fullyDilutedMarketCapInSONIC: 0,
      fullyDilutedMarketCapInUSD: 0,
      lastNonZeroBinPrice: 0,
      requiredMarketCap: 0,
      requiredMarketCapUSD: 0,
      cumulativeValue: 0,
      fraction: 0
    };
  }
}

// Function to display all bin details in a readable format
function displayAllBinsData(bins, initialSupply, currentBinIndex = 0, tokensInCurrentBin) {
  console.log('\n==== Token Distribution Across All Bins ====');
  console.log(`Initial Supply: ${ethers.formatEther(initialSupply)} tokens`);
  console.log('----------------------------------------------');
  
  // Calculate total curve value for reference
  const totalCurveValue = bins.reduce((acc, bin) => acc + bin.distributionValue, 0);
  console.log(`Total curve distribution value: ${totalCurveValue}`);
  console.log('----------------------------------------------');
  
  // Calculate and display market cap
  const marketCapInfo = calculateMarketCap(bins, currentBinIndex, tokensInCurrentBin);
  console.log('\n==== Market Cap Information ====');
  console.log(`Current Bin: ${currentBinIndex}`);
  console.log(`Current SONIC Price: ${marketCapInfo.currentPriceFormatted} SONIC (~ $${marketCapInfo.sonicPriceInUSD * marketCapInfo.currentPriceFormatted} USD)`);
  console.log(`Circulating Supply: ${ethers.formatEther(marketCapInfo.circulatingSupply)} tokens`);
  console.log(`Remaining Supply: ${ethers.formatEther(marketCapInfo.remainingSupply)} tokens`);
  console.log(`Total Supply: ${ethers.formatEther(marketCapInfo.totalSupply)} tokens`);
  console.log(`Market Cap: ${formatLargeNumber(marketCapInfo.marketCapInSONIC)} SONIC (~ $${formatLargeNumber(marketCapInfo.marketCapInUSD)} USD)`);
  console.log(`Fully Diluted Market Cap: ${formatLargeNumber(marketCapInfo.fullyDilutedMarketCapInSONIC)} SONIC (~ $${formatLargeNumber(marketCapInfo.fullyDilutedMarketCapInUSD)} USD)`);
  
  console.log('\n==== Metropolis Migration Information ====');
  console.log(`Last Non-Zero Bin Price: ${marketCapInfo.lastNonZeroBinPrice} SONIC`);
  console.log(`Required Market Cap for Metropolis: ${formatLargeNumber(marketCapInfo.requiredMarketCap)} SONIC (~ $${formatLargeNumber(marketCapInfo.requiredMarketCapUSD)} USD)`);
  console.log(`Cumulative Value: ${formatLargeNumber(marketCapInfo.cumulativeValue)} SONIC`);
  console.log(`Fraction: ${marketCapInfo.fraction.toFixed(4)}`);
  console.log('----------------------------------------------');
  
  bins.forEach(bin => {
    // Calculate price according to the formula
    const basePrice = Number(ethers.formatEther(bins[0].sonicPrice));
    const calculatedPrice = calculateBinPrice(basePrice, bin.binIndex);
    
    console.log(`\nBin ${bin.binIndex}:`);
    console.log(`Distribution value: ${bin.distributionValue} (${((bin.distributionValue / totalCurveValue) * 100).toFixed(2)}% of distribution)`);
    console.log(`Tokens in bin: ${ethers.formatEther(bin.tokensInBin)} tokens (${bin.percentageOfTotal.toFixed(2)}% of total supply)`);
    console.log(`Tokens per SONIC: ${ethers.formatEther(bin.tokensPerSonic)} tokens`);
    console.log(`SONIC price (original): ${ethers.formatEther(bin.sonicPrice)} SONIC`);
    console.log(`SONIC price (formula): ${calculatedPrice.toFixed(4)} SONIC`);
    console.log(`SONIC needed to buy all tokens in bin: ${ethers.formatEther(bin.sonicNeeded)} SONIC`);
  });
}

// Helper function to format large numbers with appropriate suffixes (K, M, B, T)
function formatLargeNumber(num) {
  if (num === undefined || isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (absNum >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (absNum >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (absNum >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  
  return num.toFixed(2);
}

async function main() {
  // Connect to the network
  const provider = new ethers.JsonRpcProvider('https://rpc.blaze.soniclabs.com');

  // Token address you want to check
  const tokenAddress = '0x21D0a122e3bF9fFc7E8A7C34F250211B1139306C';
  const slothFactoryAddress = '0x250633708b05F9241B8560c24c3d59F1e8c8a504';

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
      
      // Calculate and display distribution across all 19 bins
      const allBinsData = calculateAllBinsDistribution(tokenInfo.initialSupply);
      displayAllBinsData(allBinsData, tokenInfo.initialSupply, currentBin, ethers.formatEther(tokenInfo.currentValue));
    }

  } catch (error) {
    if (error.code === 'BAD_DATA' && error.value === '0x') {
      console.error('Error: Token does not exist in the SlothFactory');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Alternative function to calculate bin data from direct input (no blockchain call needed)
function calculateBinsFromDirectInput() {
  // Using the data provided by the user
  const tokenData = {
    creator: "0x40550d2C3574c696446663FB911ee9EfDB7bf964",
    pair: "0xDE9bAcAa393AE58F7eA7a4e1472dA8b7476d60fC",
    currentBin: "0",
    tokensInBin: "17554410.665088000003670016",
    initialSupply: "598400000.0",
    curveIndex: "2",
    hasLaunched: false,
    percentageInBin: "2.93%",
    tokensPerSonic: "119680.0",
    sonicPrice: "1.0",
    sonicNeeded: "146.67789660000000003"
  };
  
  // Convert string values to appropriate formats
  const initialSupply = ethers.parseEther(tokenData.initialSupply);
  const currentBin = parseInt(tokenData.currentBin);
  
  console.log(`\nCalculating all bins for provided token data:`);
  console.log(`Initial Supply: ${tokenData.initialSupply} tokens`);
  console.log(`Current Bin: ${tokenData.currentBin}`);
  console.log(`Tokens in Current Bin: ${tokenData.tokensInBin} tokens`);
  
  // Calculate and display distribution across all 19 bins
  const allBinsData = calculateAllBinsDistribution(initialSupply);
  displayAllBinsData(allBinsData, initialSupply, currentBin, tokenData.tokensInBin);
}

// Uncomment the line below to run with the provided data instead of querying the blockchain
calculateBinsFromDirectInput();

// Comment out the main function call to avoid running both
// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// }); 