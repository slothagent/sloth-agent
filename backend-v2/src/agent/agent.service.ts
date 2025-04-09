import { Injectable } from '@nestjs/common';
import { MongodbService } from '../database/mongodb.service';
import { Collection, ObjectId } from 'mongodb';

export interface TwitterAuthData {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  tokenType: string | null;
  scope: string | null;
}

export interface Agent {
  _id?: ObjectId;
  name: string;
  slug: string;
  ticker: string;
  tokenAddress?: string;
  owner: string;
  description?: string;
  imageUrl?: string;
  agentLore?: string;
  personality?: string;
  knowledgeAreas?: string;
  categories?: string[];
  twitterAuth?: TwitterAuthData;
  network?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class AgentService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getCollection(): Promise<Collection> {
    return this.mongodbService.getCollection('agents');
  }

  async findById(id: string): Promise<Agent | null> {
    const collection = await this.getCollection();
    return collection.findOne<Agent>({ _id: new ObjectId(id) });
  }

  async create(data: Omit<Agent, '_id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    const collection = await this.getCollection();
    const now = new Date();

    // Set default values for optional fields
    const agentData = {
      ...data,
      network: data.network || '',
      slug: data.slug || '',
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      agentLore: data.agentLore || '',
      personality: data.personality || '',
      knowledgeAreas: data.knowledgeAreas || '',
      categories: data.categories || [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(agentData as Agent);
    return result;
  }

  async update(id: string, data: Partial<Agent>): Promise<any> {
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

  async delete(id: string): Promise<any> {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: new ObjectId(id) });
  }

  async findByTicker(ticker: string): Promise<Agent | null> {
    const collection = await this.getCollection();
    return collection.findOne<Agent>({ ticker: ticker.toUpperCase() });
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ agents: Agent[]; metadata: any }> {
    const collection = await this.getCollection();
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { ticker: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [agents, total] = await Promise.all([
      collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray() as Promise<Agent[]>,
      collection.countDocuments(query)
    ]);

    return {
      agents,
      metadata: {
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasMore: skip + agents.length < total
      }
    };
  }
} 