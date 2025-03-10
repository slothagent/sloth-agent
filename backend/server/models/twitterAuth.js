import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb.js';

export class TwitterAuthModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection('twitterAuth');
  }

  static async findByAgentId(agentId) {
    const collection = await this.getCollection();
    return collection.findOne({ agentId });
  }

  static async create(data) {
    const collection = await this.getCollection();
    const now = new Date();
    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return result;
  }

  static async update(agentId, data) {
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

  static async delete(agentId) {
    const collection = await this.getCollection();
    return collection.deleteOne({ agentId });
  }
} 