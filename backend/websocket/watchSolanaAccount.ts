import { SolanaAccountWatcher } from './solanaAccountWatcher';
import clientPromise from './mongodb';
import { Db, MongoClient } from 'mongodb';

interface TokenData {
  signature: string;
  mint: string;
  metadata: any;
  timestamp: string | null;
  instruction: any;
  createdAt: Date;
}

async function storeTokenData(db: Db, tokenData: TokenData) {
  try {
    const collection = db.collection('solanaTokens');
    
    // Check if token already exists
    const existingToken = await collection.findOne({ mint: tokenData.mint });
    if (!existingToken) {
      await collection.insertOne({
        ...tokenData,
        createdAt: new Date()
      });
      console.log(`Stored new token data for mint: ${tokenData.mint}`);
    }
  } catch (error) {
    console.error('Error storing token data:', error);
  }
}

/**
 * This is a simple example demonstrating how to use the SolanaAccountWatcher
 * to monitor a Solana account for transactions with "create" instructions.
 */

async function main() {
  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  console.log('Connected to MongoDB');

  // The account address you want to monitor
  // Default is the account from the requested URL: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
  // For Pump.fun program ID: TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM
  const accountAddress = process.argv[2] || 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM';
  
  console.log('=================================================');
  console.log(`Solana WebSocket Account Watcher - Monitoring for "create" instructions`);
  console.log(`Target Account/Program: ${accountAddress}`);
  console.log('=================================================');
  
  // Create a new account watcher instance
  const watcher = new SolanaAccountWatcher(accountAddress);

  // Handle token creation events
  watcher.on('tokenCreated', async (tokenData: TokenData) => {
    console.log('New token created:', tokenData.mint);
    await storeTokenData(db, tokenData);
  });
  
  try {
    // Start monitoring
    await watcher.start();
    
    console.log('Watcher is now running using WebSocket for real-time notifications.');
    console.log('Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Error starting account watcher:', error);
    process.exit(1);
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nStopping account watcher...');
    watcher.stop();
    await client.close();
    console.log('Watcher and MongoDB connection stopped successfully.');
    process.exit(0);
  });
}

// Run the main function
main().catch(console.error); 