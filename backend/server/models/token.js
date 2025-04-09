import { Collection, ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb.js';

export class TokenModel {
  static async getDb() {
    const client = await clientPromise;
    return client.db();
  }

  static async getCollection() {
    const db = await this.getDb();
    return db.collection('tokens');
  }

  static async create(data) {
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

  static async findById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByTicker(ticker) {
    const collection = await this.getCollection();
    return collection.findOne({ ticker: ticker.toUpperCase() });
  }

  static async findByAddress(address) {
    const collection = await this.getCollection();
    return collection.findOne({ address });
  }

  static async update(id, data) {
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

  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async list(page = 1, limit = 10) {
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

  static async search(query) {
    const collection = await this.getCollection();
    return collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { ticker: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
  }
} 