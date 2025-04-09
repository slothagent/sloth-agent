import { MongoClient, MongoClientOptions } from 'mongodb';

// Add Bun types
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
// Define proper options for MongoDB connection
const options: MongoClientOptions = {
  // Add connection options for better error handling and monitoring
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  waitQueueTimeoutMS: 10000, // 10 seconds
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  heartbeatFrequencyMS: 10000, // 10 seconds
  maxPoolSize: 10,
  minPoolSize: 0
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.BUN_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
}

// Add connection status check
clientPromise.then(client => {
  console.log('MongoDB connection established successfully');
  client.on('error', (err) => {
    console.error('MongoDB client error:', err);
  });
  client.on('timeout', () => {
    console.error('MongoDB operation timeout');
  });
  client.on('close', () => {
    console.log('MongoDB connection closed');
  });
}).catch(err => {
  console.error('Failed to establish MongoDB connection:', err);
});

export default clientPromise; 