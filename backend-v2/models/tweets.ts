import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';

export interface Tweet {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  tweetId: string;
  text: string;
  authorId: string;
  tweetCreatedAt: Date;
  metrics?: {
    retweets: number;
    replies: number;
    likes: number;
    views: number;
  };
}

export class TweetModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Tweet>('tweets');
  }

  static async findByAgentId(agentId: string) {
    const collection = await this.getCollection();
    return collection.find({ agentId }).sort({ tweetCreatedAt: -1 }).toArray();
  }

  static async create(data: Omit<Tweet, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    const now = new Date();
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Tweet);
    return result;
  }

  static async bulkCreate(tweets: Omit<Tweet, '_id' | 'createdAt' | 'updatedAt'>[]) {
    const collection = await this.getCollection();
    const now = new Date();
    const tweetsToInsert = tweets.map(tweet => ({
      ...tweet,
      createdAt: now,
      updatedAt: now,
    }));
    return collection.insertMany(tweetsToInsert as Tweet[]);
  }

  static async update(agentId: string, tweetId: string, data: Partial<Tweet>) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { agentId, tweetId },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );
    return result;
  }

  static async deleteByAgentId(agentId: string) {
    const collection = await this.getCollection();
    return collection.deleteMany({ agentId });
  }
} 