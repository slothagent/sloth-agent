import { Injectable } from '@nestjs/common';
import { MongodbService } from '../database/mongodb.service';
import { ObjectId } from 'mongodb';

export interface Transaction {
  _id?: ObjectId;
  from: string;
  to: string;
  amountToken: number;
  amount: number;
  price: number;
  timestamp: Date;
  transactionType: 'BUY' | 'SELL';
  transactionHash: string;
  network: string;
}

@Injectable()
export class TransactionService {
  constructor(private readonly mongodbService: MongodbService) {}

  async createTransaction(transaction: Omit<Transaction, '_id'>): Promise<any> {
    try {
      const collection = this.mongodbService.getCollection('transactions');
      
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

  async getTransactionHistory(tokenAddress: string, timeRange?: string): Promise<Transaction[]> {
    try {
      const collection = this.mongodbService.getCollection('transactions');
      
      let query: any = { from: tokenAddress };
      
      // Add time range filter if specified
      if (timeRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            // Default to 24 hours if invalid range
            startDate.setDate(now.getDate() - 1);
        }
        
        query.timestamp = { $gte: startDate };
      }
      
      return collection.find<Transaction>(query)
        .sort({ timestamp: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  async getLatestTransaction(tokenAddress: string): Promise<Transaction | null> {
    try {
      const collection = this.mongodbService.getCollection('transactions');
      
      return collection.findOne<Transaction>(
        { from: tokenAddress },
        { sort: { timestamp: -1 } }
      );
    } catch (error) {
      console.error('Error getting latest transaction:', error);
      throw error;
    }
  }

  async getPaginatedTransactions(page: number = 1, limit: number = 10): Promise<{ data: Transaction[]; metadata: any }> {
    try {
      const collection = this.mongodbService.getCollection('transactions');
      const skip = (page - 1) * limit;
      
      const [transactions, total] = await Promise.all([
        collection.find<Transaction>({})
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments()
      ]);
      
      return {
        data: transactions,
        metadata: {
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
          totalCount: total
        }
      };
    } catch (error) {
      console.error('Error getting paginated transactions:', error);
      throw error;
    }
  }

  async calculateTotalVolume(timeRange?: string): Promise<any> {
    try {
      const collection = this.mongodbService.getCollection('transactions');
      
      let matchStage: any = {};
      
      // Add time range filter if specified
      if (timeRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (timeRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            // Default to all time if invalid range
            startDate = new Date(0); // Beginning of time
        }
        
        matchStage.timestamp = { $gte: startDate };
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: "$totalValue" },
            totalTransactions: { $sum: 1 },
            avgPrice: { $avg: "$price" }
          }
        }
      ];
      
      const result = await collection.aggregate(pipeline).toArray();
      
      if (result.length === 0) {
        return {
          totalVolume: 0,
          totalTransactions: 0,
          avgPrice: 0
        };
      }
      
      return {
        totalVolume: result[0].totalVolume,
        totalTransactions: result[0].totalTransactions,
        avgPrice: result[0].avgPrice
      };
    } catch (error) {
      console.error('Error calculating total volume:', error);
      throw error;
    }
  }

  async searchTransactions(params: {
    from?: string;
    to?: string;
    transactionHash?: string;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Transaction[]; metadata: any }> {
    try {
      const collection = this.mongodbService.getCollection('transactions');
      const { from, to, transactionHash, query, page = 1, limit = 10 } = params;
      const skip = (page - 1) * limit;

      // Build query based on provided parameters
      const searchQuery: any = {};
      if (from) searchQuery.from = from;
      if (to) searchQuery.to = to;
      if (transactionHash) searchQuery.transactionHash = transactionHash;
      if (query) {
        searchQuery.$or = [
          { from: { $regex: query, $options: 'i' } },
          { to: { $regex: query, $options: 'i' } },
          { transactionHash: { $regex: query, $options: 'i' } }
        ];
      }

      const [transactions, total] = await Promise.all([
        collection.find<Transaction>(searchQuery)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(searchQuery)
      ]);

      return {
        data: transactions,
        metadata: {
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
          totalCount: total
        }
      };
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  }
} 