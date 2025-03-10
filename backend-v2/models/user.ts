import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';

export interface User {
  _id?: ObjectId;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserByAddress(address: string): Promise<User | null> {
  const client = await clientPromise;
  const collection = client.db().collection('users');
  
  return collection.findOne<User>({ address: address.toLowerCase() });
}

export async function createUser(address: string): Promise<User> {
  const client = await clientPromise;
  const collection = client.db().collection('users');
  
  const now = new Date();
  const user: User = {
    address: address.toLowerCase(),
    createdAt: now,
    updatedAt: now
  };
  
  await collection.insertOne(user);
  return user;
}

export async function registerUserIfNeeded(address: string): Promise<User> {
  const existingUser = await getUserByAddress(address);
  
  if (existingUser) {
    return existingUser;
  }
  
  return createUser(address);
} 