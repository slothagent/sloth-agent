import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

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

  static async findByTicker(ticker: string) {
    const collection = await this.getCollection();
    return collection.findOne({ ticker: ticker.toUpperCase() });
  }

  static async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
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
        .toArray(),
      collection.countDocuments(query)
    ]);

    return {
      agents,
      metadata: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasMore: skip + agents.length < total
      }
    };
  }
} 