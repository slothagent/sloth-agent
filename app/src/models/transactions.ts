import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Transaction {
  _id?: ObjectId;
  tokenAddress: string;
  userAddress: string;
  price: number;
  amountToken: number;
  timestamp: Date;
  transactionType: 'BUY' | 'SELL';
  transactionHash: string;
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