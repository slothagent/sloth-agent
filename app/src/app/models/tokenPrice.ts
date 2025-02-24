import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface TokenPrice {
  _id?: ObjectId;
  tokenAddress: string;
  price: number;
  timestamp: Date;
  transactionType: 'BUY' | 'SELL';
  transactionHash: string;
}

export async function createTokenPrice(tokenPrice: Omit<TokenPrice, '_id'>) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('tokenPrices');
    
    const result = await collection.insertOne({
      ...tokenPrice,
      timestamp: new Date(),
    });
    
    return result;
  } catch (error) {
    console.error('Error creating token price:', error);
    throw error;
  }
}

export async function getTokenPriceHistory(tokenAddress: string, timeRange?: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('tokenPrices');
    
    let query: any = { tokenAddress };
    
    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '3d':
          startDate.setDate(now.getDate() - 3);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '14d':
          startDate.setDate(now.getDate() - 14);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }
      
      query.timestamp = { $gte: startDate };
    }
    
    const prices = await collection
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();
    
    return prices;
  } catch (error) {
    console.error('Error getting token price history:', error);
    throw error;
  }
}

export async function getLatestTokenPrice(tokenAddress: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('tokenPrices');
    
    const latestPrice = await collection
      .find({ tokenAddress })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    
    return latestPrice[0] || null;
  } catch (error) {
    console.error('Error getting latest token price:', error);
    throw error;
  }
} 