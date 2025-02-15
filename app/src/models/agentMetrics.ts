import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export interface AgentMetrics {
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

export class AgentMetricsModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<AgentMetrics>('agentMetrics');
  }

  static async findByAgentId(agentId: string) {
    const collection = await this.getCollection();
    return collection.findOne({ agentId });
  }

  static async create(data: Omit<AgentMetrics, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    const now = new Date();
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as AgentMetrics);
    return result;
  }

  static async update(agentId: string, data: Partial<AgentMetrics>) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { agentId },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );
    return result;
  }

  static async delete(agentId: string) {
    const collection = await this.getCollection();
    return collection.deleteOne({ agentId });
  }
} 