import { ethers } from 'ethers';

export const useCalculateTokens = () => {
  const calculateExpectedTokens = async (tokenInfo: any, ethAmount: string) => {
    try {
      // Constants from contract
      const BASIS = ethers.getBigInt(10000);
      const BIN_WIDTH = ethers.getBigInt(2000);
      const COEF = ethers.getBigInt(2);
      
      // Current state
      const currentIndex = ethers.getBigInt(tokenInfo[3]);
      const initialSupply = ethers.getBigInt(tokenInfo[5]);
      
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
    } catch (error) {
      console.error("Error calculating expected tokens:", error);
      throw error;
    }
  };

  async function calculateMinimumEthOut(tokenInfo: any, tokenAmount: string) {
    // Get token info
    // console.log("Token Info:", tokenInfo);
    
    // Constants from contract
    const BASIS = ethers.getBigInt(10000);
    const BIN_WIDTH = ethers.getBigInt(2000);
    const COEF = ethers.getBigInt(2);
    
    // Current state
    const currentIndex = ethers.getBigInt(tokenInfo[3]);
    const initialSupply = ethers.getBigInt(tokenInfo[5]);
    
    // Calculate expected ETH based on contract's sell logic
    const amountPerAVAX = (initialSupply * COEF) / (BASIS + (BIN_WIDTH * currentIndex));
    const expectedEth = (BigInt(tokenAmount) * ethers.parseEther("1")) / amountPerAVAX;
    
    // Apply trading fee (1%)
    const tradingFee = ethers.getBigInt(100);
    const fee = (expectedEth * tradingFee) / BASIS;
    const finalEth = expectedEth - fee;
    
    return finalEth;
  }

  return {
    calculateExpectedTokens,
    calculateMinimumEthOut
  };
}; 