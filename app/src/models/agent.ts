import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export interface Agent {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  ticker: string;
  address: string;
  curveAddress: string;
  owner: string;
  systemType?: string;
  imageUrl?: string;
  agentLore?: string;
  personality?: string;
  communicationStyle?: string;
  knowledgeAreas?: string;
  tools: string[];
  examples?: string;
}

export class AgentModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Agent>('agents');
  }

  static async findById(id: string) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async create(data: Omit<Agent, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    const now = new Date();
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
      tools: data.tools || [],
    } as Agent);
    return result;
  }

  static async update(id: string, data: Partial<Agent>) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );
    return result;
  }

  static async delete(id: string) {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: new ObjectId(id) });
  }

  static async findAll() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }
} 