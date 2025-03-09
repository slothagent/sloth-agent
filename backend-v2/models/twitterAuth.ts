import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';

export interface TwitterAuth {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export class TwitterAuthModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<TwitterAuth>('twitterAuth');
  }

  static async findByAgentId(agentId: string) {
    const collection = await this.getCollection();
    return collection.findOne({ agentId });
  }

  static async create(data: Omit<TwitterAuth, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    const now = new Date();
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as TwitterAuth);
    return result;
  }

  static async update(agentId: string, data: Partial<TwitterAuth>) {
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