import { ObjectId } from 'mongodb';

export interface TokenMetrics {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  
  // Liquidity metrics
  liquidityAmount: number;
  liquidityValue: number;
  
  // Holdings and holders
  blueChipHolding: number;
  holdersCount: number;
  holdersChange24h: number;
  
  // Smart money metrics
  smartMoneyValue: number;
  smartMoneyKol: number;
  
  // Transaction metrics
  totalTransactions: number;
  buyTransactions: number;
  sellTransactions: number;
  
  // Volume metrics
  volumeLastHour: number;
  totalVolume: number;
  
  // Price metrics
  currentPrice: number;
  priceChange1m: number;
  
  // Market metrics
  marketCap: number;
  
  // Social metrics
  followersCount: number;
  topTweetsCount: number;
}
