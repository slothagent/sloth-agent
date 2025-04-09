import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb.js';

export async function getUserByAddress(address) {
  const client = await clientPromise;
  const collection = client.db().collection('users');
  
  return collection.findOne({ address: address.toLowerCase() });
}

export async function createUser(address) {
  const client = await clientPromise;
  const collection = client.db().collection('users');
  
  const now = new Date();
  const user = {
    address: address.toLowerCase(),
    createdAt: now,
    updatedAt: now
  };
  
  await collection.insertOne(user);
  return user;
}

export async function registerUserIfNeeded(address) {
  const existingUser = await getUserByAddress(address);
  
  if (existingUser) {
    return existingUser;
  }
  
  return createUser(address);
} 