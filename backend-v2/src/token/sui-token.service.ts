import { Injectable } from '@nestjs/common';
import { MongodbService } from '../database/mongodb.service';
import { Collection } from 'mongodb';
import { SuiToken } from './interfaces/sui-token.interface';

@Injectable()
export class SuiTokenService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getCollection(): Promise<Collection> {
    return this.mongodbService.getCollection('tokens-sui');
  }

  async createMany(tokens: Omit<SuiToken, 'createdAt' | 'updatedAt'>[]): Promise<any> {
    const collection = await this.getCollection();

    // Create indexes if they don't exist
    await collection.createIndex({ objectId: 1 }, { unique: true });
    await collection.createIndex({ symbol: 1 });
    await collection.createIndex({ name: 1 });

    const now = new Date();
    const tokenData = tokens.map(token => ({
      ...token,
      createdAt: now,
      updatedAt: now,
    }));

    return collection.insertMany(tokenData, { ordered: false });
  }

  async list(page: number = 1, limit: number = 20): Promise<{ tokens: SuiToken[]; total: number }> {
    const collection = await this.getCollection();
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      collection.find<SuiToken>({})
        .sort({ marketCap: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments()
    ]);

    return { tokens, total };
  }

  async findByObjectId(objectId: string): Promise<SuiToken | null> {
    const collection = await this.getCollection();
    return collection.findOne<SuiToken>({ objectId });
  }

  async search(query: string): Promise<SuiToken[]> {
    const collection = await this.getCollection();
    return collection.find<SuiToken>({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { symbol: { $regex: query, $options: 'i' } },
        { objectId: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
  }
} 