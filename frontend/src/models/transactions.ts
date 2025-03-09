import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Transaction {
  _id?: ObjectId;
  from: string;
  to: string;
  amount: number;
  price: number;
  timestamp: Date;
  transactionType: 'BUY' | 'SELL';
  transactionHash: string;
  totalValue: number;
  supply: number;
  marketCap: number;
  network: string;
  fundingRaised: number;
  amountTokensToReceive: number;
}

export async function createTransaction(transaction: Omit<Transaction, '_id'>) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    
    const result = await collection.insertOne({
      ...transaction,
      timestamp: new Date(),
    });
    
    return result;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function getTransactionHistory(tokenAddress: string, timeRange?: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    
    let query: any = { from: tokenAddress };
    
    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '1m':
          startDate.setMinutes(now.getMinutes() - 1);
          break;
        case '5m':
          startDate.setMinutes(now.getMinutes() - 5);
          break;
        case '10m':
          startDate.setMinutes(now.getMinutes() - 10);
          break;
        case '30m':
          startDate.setMinutes(now.getMinutes() - 30);
          break;
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '3h':
          startDate.setHours(now.getHours() - 3);
          break;
        case '5h':
          startDate.setHours(now.getHours() - 5);
          break;
        case '12h':
          startDate.setHours(now.getHours() - 12);
          break;
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
    
    const transactions = await collection
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();
    
    return transactions;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
}

export async function getLatestTransaction(tokenAddress: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    
    const latestTransaction = await collection
      .find({ tokenAddress })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    
    return latestTransaction[0] || null;
  } catch (error) {
    console.error('Error getting latest transaction:', error);
    throw error;
  }
}

export async function getPaginatedTransactions(page: number = 1, limit: number = 10) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      collection
        .find({})
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({})
    ]);
    
    return {
      data: transactions,
      total,
      page,
      limit
    };
  } catch (error) {
    console.error('Error getting paginated transactions:', error);
    throw error;
  }
}

export async function calculateVolumeInRange(tokenAddress: string, timeRange?: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    
    let query: any = { from: tokenAddress };
    
    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '1m':
          startDate.setMinutes(now.getMinutes() - 1);
          break;
        case '5m':
          startDate.setMinutes(now.getMinutes() - 5);
          break;
        case '10m':
          startDate.setMinutes(now.getMinutes() - 10);
          break;
        case '30m':
          startDate.setMinutes(now.getMinutes() - 30);
          break;
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '3h':
          startDate.setHours(now.getHours() - 3);
          break;
        case '5h':
          startDate.setHours(now.getHours() - 5);
          break;
        case '12h':
          startDate.setHours(now.getHours() - 12);
          break;
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

    const result = await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$totalValue" },
          transactionCount: { $sum: 1 }
        }
      }
    ]).toArray();

    return {
      volume: result[0]?.totalVolume || 0,
      transactionCount: result[0]?.transactionCount || 0
    };
  } catch (error) {
    console.error('Error calculating volume:', error);
    throw error;
  }
}

export async function calculateTotalVolume(timeRange?: string) {
  try {
    const client = await clientPromise;
    const collection = client.db().collection('transactions');
    
    let query: any = {};
    
    // Add time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '1m':
          startDate.setMinutes(now.getMinutes() - 1);
          break;
        case '5m':
          startDate.setMinutes(now.getMinutes() - 5);
          break;
        case '10m':
          startDate.setMinutes(now.getMinutes() - 10);
          break;
        case '30m':
          startDate.setMinutes(now.getMinutes() - 30);
          break;
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '3h':
          startDate.setHours(now.getHours() - 3);
          break;
        case '5h':
          startDate.setHours(now.getHours() - 5);
          break;
        case '12h':
          startDate.setHours(now.getHours() - 12);
          break;
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

    const result = await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$totalValue" },
          transactionCount: { $sum: 1 },
          buyVolume: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "BUY"] }, "$totalValue", 0]
            }
          },
          sellVolume: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "SELL"] }, "$totalValue", 0]
            }
          }
        }
      }
    ]).toArray();

    return {
      volume: result[0]?.totalVolume || 0,
      transactionCount: result[0]?.transactionCount || 0,
      buyVolume: result[0]?.buyVolume || 0,
      sellVolume: result[0]?.sellVolume || 0
    };
  } catch (error) {
    console.error('Error calculating total volume:', error);
    throw error;
  }
} 