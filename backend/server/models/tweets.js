import clientPromise from '../lib/mongodb.js';

export class TweetModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection('tweets');
  }

  static async findByAgentId(agentId) {
    const collection = await this.getCollection();
    return collection.find({ agentId }).sort({ tweetCreatedAt: -1 }).toArray();
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

  static async bulkCreate(tweets) {
    const collection = await this.getCollection();
    const now = new Date();
    const tweetsToInsert = tweets.map(tweet => ({
      ...tweet,
      createdAt: now,
      updatedAt: now,
    }));
    return collection.insertMany(tweetsToInsert);
  }

  static async update(agentId, tweetId, data) {
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

  static async deleteByAgentId(agentId) {
    const collection = await this.getCollection();
    return collection.deleteMany({ agentId });
  }
} 