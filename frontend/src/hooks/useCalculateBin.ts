import { ethers } from 'ethers';
import { factoryAbi } from '../abi/factoryAbi';

export const useCalculateBin = () => {
  // Constants
  const BIN_WIDTH = BigInt(2000);
  const BASIS = BigInt(10000);
  const COEF = BigInt(2);
  const ETHER = ethers.parseEther("1");

  // Helper function to round a number to specific decimal places
  const roundToDecimal = (num: string, decimals: number = 2): string => {
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return "0";
    
    // Check if the number is very close to an integer
    const rounded = Math.round(parsed);
    if (Math.abs(parsed - rounded) < 0.000001) {
      return rounded.toString();
    }
    
    return parsed.toFixed(decimals);
  };

  // Calculate tokens per SONIC for a specific bin
  const calculateTokensPerSonic = (initialSupply: bigint, binIndex: number) => {
    return (initialSupply * COEF) / (BASIS + (BIN_WIDTH * BigInt(binIndex)));
  };

  // Calculate SONIC price for tokens in a specific bin
  const calculateSonicPrice = (binIndex: number) => {
    return ETHER * (BASIS + (BIN_WIDTH * BigInt(binIndex))) / BASIS;
  };

  // Calculate percentage of tokens remaining in bin
  const calculatePercentageInBin = (currentValue: bigint, initialSupply: bigint) => {
    if (initialSupply === BigInt(0)) return 0;
    return (Number(currentValue) * 100) / Number(initialSupply);
  };

  // Calculate how many SONIC needed for all tokens in current bin
  const calculateSonicNeeded = (currentValue: bigint, tokensPerSonic: bigint) => {
    return currentValue * ETHER / tokensPerSonic;
  };

  // Calculate token distribution across all bins (19 bins by default)
  const calculateAllBinsDistribution = (initialSupply: bigint, totalBins = 19) => {
    let bins = [];
    let remainingSupply = initialSupply;
    
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
      
      // Calculate percentage of total
      const percentageOfTotal = (Number(binTokens) * 100) / Number(initialSupply);
      
      // Format the sonicNeeded value with appropriate rounding
      const formattedSonicNeeded = roundToDecimal(ethers.formatEther(sonicNeeded), 2);
      
      bins.push({
        binIndex: i,
        tokensPerSonic,
        sonicPrice,
        tokensInBin: binTokens,
        sonicNeeded,
        percentageOfTotal: percentageOfTotal.toFixed(2),
        distributionValue: curveDistribution[i],
        formattedData: {
          tokensPerSonic: ethers.formatEther(tokensPerSonic),
          sonicPrice: ethers.formatEther(sonicPrice),
          tokensInBin: ethers.formatEther(binTokens),
          sonicNeeded: formattedSonicNeeded,
          percentageOfTotal: percentageOfTotal.toFixed(2) + '%',
          distributionValue: curveDistribution[i].toString()
        }
      });
      
      remainingSupply -= binTokens;
    }
    
    return bins;
  };

  // Get bin details for a specific token
  const getBinDetails = async (tokenAddress: string, rpcUrl: string, address: string) => {
    try {
      // Connect to the network
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // console.log("provider", provider);
      const slothFactory = new ethers.Contract(address, factoryAbi, provider);
      
      // Get token info
      const tokenInfo = await slothFactory.tokens(tokenAddress);
      // console.log("tokenInfo", tokenInfo);
      // Current bin details
      const currentBin = Number(tokenInfo[3]);
      // console.log("currentBin", currentBin);
      const tokensPerSonic = calculateTokensPerSonic(tokenInfo[5], currentBin);
      const sonicPrice = calculateSonicPrice(currentBin);
      const percentageInBin = calculatePercentageInBin(tokenInfo[4], tokenInfo[5]);
      const sonicNeeded = calculateSonicNeeded(tokenInfo[4], tokensPerSonic);
      
      // Format the sonicNeeded value with appropriate rounding
      const formattedSonicNeeded = roundToDecimal(ethers.formatEther(sonicNeeded), 2);
      
      // Calculate distribution across all bins
      const allBinsDistribution = calculateAllBinsDistribution(tokenInfo[5]);
      // console.log("allBinsDistribution", allBinsDistribution);
      return {
        tokenInfo,
        currentBin,
        tokensPerSonic,
        sonicPrice,
        percentageInBin,
        sonicNeeded,
        allBinsDistribution,
        formattedData: {
          creator: tokenInfo.creator,
          pair: tokenInfo.pair,
          currentBin: currentBin.toString(),
          tokensInBin: ethers.formatEther(tokenInfo.currentValue),
          initialSupply: ethers.formatEther(tokenInfo.initialSupply),
          curveIndex: tokenInfo.curveIndex.toString(),
          hasLaunched: tokenInfo.hasLaunched,
          percentageInBin: percentageInBin.toFixed(2) + '%',
          tokensPerSonic: ethers.formatEther(tokensPerSonic),
          sonicPrice: ethers.formatEther(sonicPrice),
          sonicNeeded: formattedSonicNeeded
        }
      };
    } catch (error) {
      console.error('Error getting bin details:', error);
      throw error;
    }
  };

  // Calculate market cap based on bin price formula
  const calculateMarketCap = (
    initialSupply: bigint | number, 
    basePrice: number, 
    totalBins: number = 19, 
    binWidthPercent: number = 20
  ) => {
    // Convert initialSupply to number if it's bigint
    const totalSupply = typeof initialSupply === 'bigint' ? Number(initialSupply) : initialSupply;
    
    // Calculate the price for each bin
    const binPrices = [];
    for (let i = 0; i < totalBins; i++) {
      const price = basePrice * (100 + (i * binWidthPercent)) / 100;
      binPrices.push(price);
    }
    
    // Calculate the last non-zero bin price
    const lastNonZeroPrice = basePrice * (1 + ((totalBins - 1) * binWidthPercent) / 100);
    
    // Calculate the market cap at the last bin (for Metropolis migration)
    const requiredMarketCap = totalSupply * lastNonZeroPrice;
    
    // For formatting purposes, also calculate the fully diluted valuation
    const fdv = totalSupply * binPrices[0]; // Initial price valuation
    
    return {
      binPrices,
      lastNonZeroPrice,
      requiredMarketCap,
      fdv,
      formattedData: {
        binPrices: binPrices.map(price => price.toFixed(6)),
        lastNonZeroPrice: lastNonZeroPrice.toFixed(6),
        requiredMarketCap: requiredMarketCap.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        fdv: fdv.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }
    };
  };

  return {
    calculateTokensPerSonic,
    calculateSonicPrice,
    calculatePercentageInBin,
    calculateSonicNeeded,
    calculateAllBinsDistribution,
    getBinDetails,
    calculateMarketCap
  };
};
