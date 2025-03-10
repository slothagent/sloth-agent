import { Injectable } from '@nestjs/common';
import { MongodbService } from '../database/mongodb.service';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getUserByAddress(address: string): Promise<User | null> {
    const collection = this.mongodbService.getCollection('users');
    return collection.findOne<User>({ address: address.toLowerCase() });
  }

  async createUser(address: string): Promise<User> {
    const collection = this.mongodbService.getCollection('users');
    
    const now = new Date();
    const user: User = {
      address: address.toLowerCase(),
      createdAt: now,
      updatedAt: now
    };
    
    await collection.insertOne(user);
    return user;
  }

  async registerUserIfNeeded(address: string): Promise<User> {
    const existingUser = await this.getUserByAddress(address);
    
    if (existingUser) {
      return existingUser;
    }
    
    return this.createUser(address);
  }
} 