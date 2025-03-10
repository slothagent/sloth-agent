import { Injectable } from '@nestjs/common';
import { MongodbService } from '../database/mongodb.service';
import { Collection, ObjectId } from 'mongodb';

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

@Injectable()
export class TokenService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getCollection(): Promise<Collection> {
    return this.mongodbService.getCollection('tokens');
  }

  async create(data: Omit<Token, '_id' | 'createdAt' | 'updatedAt'>): Promise<any> {
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

  async findById(id: string): Promise<Token | null> {
    const collection = await this.getCollection();
    return collection.findOne<Token>({ _id: new ObjectId(id) });
  }

  async findByTicker(ticker: string): Promise<Token | null> {
    const collection = await this.getCollection();
    return collection.findOne<Token>({ ticker: ticker.toUpperCase() });
  }

  async findByAddress(address: string): Promise<Token | null> {
    const collection = await this.getCollection();
    return collection.findOne<Token>({ address });
  }

  async update(id: string, data: Partial<Token>): Promise<boolean> {
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

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async list(page: number = 1, limit: number = 10): Promise<{ tokens: Token[]; total: number }> {
    const collection = await this.getCollection();
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      collection.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray() as Promise<Token[]>,
      collection.countDocuments()
    ]);

    return { tokens, total };
  }

  async search(query: string): Promise<Token[]> {
    const collection = await this.getCollection();
    return collection.find<Token>({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { ticker: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
  }
} 