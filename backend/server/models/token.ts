import { Collection, ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';

export interface Token {
  _id?: ObjectId;
  name: string;
  address: string;
  curveAddress: string;
  owner: string;
  description?: string;
  ticker: string;
  imageUrl?: string;
  totalSupply: string;
  twitterUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  categories?: string[];
  network?: string;
}

export class TokenModel {
  private static async getDb() {
    const client = await clientPromise;
    return client.db();
  }

  static async getCollection(): Promise<Collection<Token>> {
    const db = await this.getDb();
    return db.collection('tokens');
  }

  static async create(data: Omit<Token, '_id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    const collection = await this.getCollection();

    // Create indexes if they don't exist
    await collection.createIndex({ ticker: 1 });
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ address: 1 });

    const now = new Date();
    const tokenData = {
      ...data,
      ticker: data.ticker.toUpperCase(), // Ensure ticker is uppercase
      createdAt: now,
      updatedAt: now,
    };

    return collection.insertOne(tokenData);
  }

  static async findById(id: string): Promise<Token | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByTicker(ticker: string): Promise<Token | null> {
    const collection = await this.getCollection();
    return collection.findOne({ ticker: ticker.toUpperCase() });
  }

  static async findByAddress(address: string): Promise<Token | null> {
    const collection = await this.getCollection();
    return collection.findOne({ address });
  }

  static async update(id: string, data: Partial<Token>): Promise<boolean> {
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
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async list(page: number = 1, limit: number = 10): Promise<{ tokens: Token[]; total: number }> {
    const collection = await this.getCollection();
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      collection.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments()
    ]);

    return { tokens, total };
  }

  static async search(query: string): Promise<Token[]> {
    const collection = await this.getCollection();
    return collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { ticker: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
  }
} 