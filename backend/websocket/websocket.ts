import { serve, ServerWebSocket } from "bun";
import { MongoClient, MongoClientOptions, ChangeStream } from 'mongodb';
import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import { programs } from '@metaplex/js';
import { EventEmitter } from 'events';

dotenv.config();

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

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



/**
 * SolanaAccountWatcher - Monitors a specific Solana account for transactions
 * with "create" instructions using WebSocket subscriptions.
 */
export class SolanaAccountWatcher extends EventEmitter {
  private connection: Connection;
  private programSubscriptionId: number | null = null;
  private logsSubscriptionId: number | null = null;
  private signatureSubscriptionId: number | null = null;
  private ws: WebSocket | null = null;
  private targetAccount: PublicKey;
  private processedSignatures = new Set<string>();
  private pendingSignatures: TransactionSignature[] = [];
  private isProcessingSignatures = false;
  
  // New properties for managing multiple endpoints
  private rpcUrls: string[];
  private wsUrls: string[];
  private currentRpcIndex: number = 0;
  private currentWsIndex: number = 0;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 1000;

  /**
   * Constructor for SolanaAccountWatcher
   * @param accountAddress The Solana account address to monitor
   */
  constructor(accountAddress: string) {
    super();
    
    // Initialize RPC URLs array
    this.rpcUrls = [
      process.env.SOLANA_RPC_URL || 'https://convincing-ultra-scion.solana-mainnet.quiknode.pro/b763e225ec3e3708115b223ca270c55e0129b34a/',
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://mainnet.helius-rpc.com/?api-key=5fd03be1-0b73-418b-baca-16a8304a3199',
      'https://solana-mainnet.api.syndica.io/api-key/3BoYR8BN62XmrneuCtWBwS5nps2qrnRB9qZJ2cxwPdii2tyPFN1ubTRnLstvXj9nzUwAFhmRsUoNJCALjHRAdfHFPvJTWLDK2Ad'
    ];

    // Initialize WebSocket URLs array
    this.wsUrls = [
      process.env.SOLANA_WS_URL || 'wss://convincing-ultra-scion.solana-mainnet.quiknode.pro/b763e225ec3e3708115b223ca270c55e0129b34a/',
      'wss://api.mainnet-beta.solana.com',
      'wss://solana-api.projectserum.com',
      'wss://mainnet.helius-rpc.com/?api-key=5fd03be1-0b73-418b-baca-16a8304a3199',
      'wss://solana-mainnet.api.syndica.io/api-key/3BoYR8BN62XmrneuCtWBwS5nps2qrnRB9qZJ2cxwPdii2tyPFN1ubTRnLstvXj9nzUwAFhmRsUoNJCALjHRAdfHFPvJTWLDK2Ad'
    ];
    
    // Initialize the connection with the first RPC URL
    this.connection = new Connection(this.rpcUrls[this.currentRpcIndex], 'confirmed');
    this.targetAccount = new PublicKey(accountAddress);
    
    // Setup initial WebSocket connection
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    this.ws = new WebSocket(this.wsUrls[this.currentWsIndex]);
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleConnectionError(error);
    });
  }

  /**
   * Handle connection errors and switch endpoints if needed
   */
  private async handleConnectionError(error: Error): Promise<void> {
    const errorMessage = error.toString().toLowerCase();
    const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('too many requests');
    
    if (isRateLimitError) {
      console.log('Rate limit reached, switching to next endpoint...');
      await this.switchEndpoints();
    } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.reconnect(), this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', new Error('Unable to establish connection after multiple attempts'));
    }
  }

  /**
   * Switch to next available endpoints
   */
  private async switchEndpoints(): Promise<void> {
    // Switch RPC endpoint
    this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
    this.connection = new Connection(this.rpcUrls[this.currentRpcIndex], 'confirmed');
    console.log(`Switched to RPC endpoint: ${this.rpcUrls[this.currentRpcIndex]}`);

    // Switch WebSocket endpoint
    this.currentWsIndex = (this.currentWsIndex + 1) % this.wsUrls.length;
    await this.reconnect();
    console.log(`Switched to WebSocket endpoint: ${this.wsUrls[this.currentWsIndex]}`);
    
    // Reset reconnect attempts after successful switch
    this.reconnectAttempts = 0;
  }

  /**
   * Reconnect WebSocket
   */
  private async reconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
    }
    
    // Initialize new WebSocket connection
    this.initializeWebSocket();
    
    // Wait for connection to establish
    await new Promise<void>((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket not initialized'));
      
      this.ws.once('open', () => {
        console.log('WebSocket reconnected successfully');
        // Resubscribe to all active subscriptions
        this.subscribeToProgramNotifications();
        this.subscribeToLogs();
        resolve();
      });
      
      this.ws.once('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Start monitoring the account
   */
  public async start(): Promise<void> {
    if (!this.ws) {
      throw new Error('WebSocket not initialized');
    }

    console.log("Starting account watcher using WebSocket...");

    this.ws.on('open', () => {
      console.log('WebSocket connection established');
      
      // Subscribe to program notifications (better for program IDs)
      this.subscribeToProgramNotifications();
      
      // Subscribe to logs (for more detailed transaction info)
      this.subscribeToLogs();
    });

    this.ws.on('message', async (data: WebSocket.Data) => {
      try {
        const response = JSON.parse(data.toString());
        
        // Handle different subscription responses
        if (response.method === 'logsNotification') {
          await this.handleLogsNotification(response.params);
        } else if (response.method === 'programNotification') {
          await this.handleProgramNotification(response.params);
        } else if (response.method === 'signatureNotification') {
          await this.handleSignatureNotification(response.params);
        } else if (response.result !== undefined) {
          // Store subscription IDs
          if (this.programSubscriptionId === null && response.id === 1) {
            this.programSubscriptionId = response.result;
            console.log(`Program subscription established with id: ${this.programSubscriptionId}`);
          } else if (this.logsSubscriptionId === null && response.id === 2) {
            this.logsSubscriptionId = response.result;
            console.log(`Logs subscription established with id: ${this.logsSubscriptionId}`);
          } else if (response.id >= 100 && response.id < 1000) {
            // For signature subscriptions
            this.signatureSubscriptionId = response.result;
            console.log(`Signature subscription established with id: ${this.signatureSubscriptionId}`);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('WebSocket connection closed');
      this.programSubscriptionId = null;
      this.logsSubscriptionId = null;
      this.signatureSubscriptionId = null;
    });

    // Start processing signatures periodically
    this.processNextBatchOfSignatures();
  }

  /**
   * Subscribe to program notifications (when the target is a program ID)
   */
  private subscribeToProgramNotifications(): void {
    if (!this.ws) return;

    const subscribeMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'programSubscribe',
      params: [
        this.targetAccount.toBase58(),
        {
          encoding: 'jsonParsed',
          commitment: 'confirmed'
        }
      ]
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log(`Subscribed to program: ${this.targetAccount.toBase58()}`);
  }

  /**
   * Subscribe to logs for the target account
   */
  private subscribeToLogs(): void {
    if (!this.ws) return;

    const subscribeMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'logsSubscribe',
      params: [
        {
          mentions: [this.targetAccount.toBase58()]
        },
        {
          commitment: 'confirmed'
        }
      ]
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log(`Subscribed to logs mentioning: ${this.targetAccount.toBase58()}`);
  }

  /**
   * Subscribe to a specific transaction signature
   */
  private subscribeToSignature(signature: string): void {
    if (!this.ws) return;
    
    const id = 100 + (Math.floor(Math.random() * 900)); // Generate id between 100-999
    
    const subscribeMessage = {
      jsonrpc: '2.0',
      id: id,
      method: 'signatureSubscribe',
      params: [
        signature,
        {
          commitment: 'confirmed'
        }
      ]
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  /**
   * Handle program notification
   */
  private async handleProgramNotification(params: any): Promise<void> {
    if (!params || !params.result || !params.result.value) return;
    
    const signature = params.result.value.signature;
    if (signature && !this.processedSignatures.has(signature)) {
      console.log(`Program notification: ${signature}`);
      this.processedSignatures.add(signature);
      this.pendingSignatures.push(signature);
      this.subscribeToSignature(signature);
    }
  }

  /**
   * Handle logs notification
   */
  private async handleLogsNotification(params: any): Promise<void> {
    if (!params || !params.result || !params.result.value) return;
    
    const value = params.result.value;
    const signature = value.signature;
    const logs = value.logs || [];
    
    if (signature && !this.processedSignatures.has(signature)) {
      console.log(`Log notification for signature: ${signature}`);
      
      // Check if any log contains "create" word
      const hasCreateLog = logs.some((log: string) => 
        log.toLowerCase().includes('create')
      );
      
      if (hasCreateLog) {
        console.log('-----------------------------------');
        console.log('Found CREATE in logs:');
        console.log('Signature:', signature);
        logs.forEach((log: string) => {
          if (log.toLowerCase().includes('create')) {
            console.log('Log:', log);
          }
        });
        console.log('-----------------------------------');
        
        // Subscribe to this signature to get more details
        this.subscribeToSignature(signature);
        this.processedSignatures.add(signature);
        this.pendingSignatures.push(signature);
      }
    }
  }

  /**
   * Handle signature notification
   */
  private async handleSignatureNotification(params: any): Promise<void> {
    if (!params || !params.result || !params.result.value) return;
    
    const signature = params.result.value.signature || '';
    if (signature) {
      console.log(`Signature confirmed: ${signature}`);
      
      // Get transaction details using WebSocket jsonParsed format
      await this.getTransactionDetailsViaWebSocket(signature);
    }
  }

  /**
   * Get transaction details via WebSocket instead of RPC
   */
  private async getTransactionDetailsViaWebSocket(signature: string): Promise<void> {
    if (!this.ws) return;
    
    const requestId = `tx_${Date.now()}`;
    
    const request = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'getTransaction',
      params: [
        signature,
        {
          encoding: 'jsonParsed',
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        }
      ]
    };
    
    try {
      // Register one-time handler for this specific response
      const messageHandler = async (data: WebSocket.Data) => {
        try {
          const response = JSON.parse(data.toString());
          
          // Check for rate limit error
          if (response.error && (response.error.code === 429 || response.error.message?.toLowerCase().includes('too many requests'))) {
            this.ws?.removeListener('message', messageHandler);
            await this.handleConnectionError(new Error('429 Rate limit exceeded'));
            // Retry the request with new endpoint
            await this.getTransactionDetailsViaWebSocket(signature);
            return;
          }
          
          if (response.id === requestId && response.result) {
            // We got our transaction, remove this handler
            this.ws?.removeListener('message', messageHandler);
            
            const transaction = response.result;
            if (transaction) {
              await this.processTransaction(transaction, signature);
            }
          }
        } catch (error) {
          // Remove handler on error
          this.ws?.removeListener('message', messageHandler);
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      // Add temporary listener
      this.ws.on('message', messageHandler);
      
      // Send the request
      this.ws.send(JSON.stringify(request));
      
      // Set a timeout to remove the handler if no response
      setTimeout(() => {
        this.ws?.removeListener('message', messageHandler);
      }, 10000);
      
    } catch (error) {
      console.error('Error getting transaction details:', error);
      // Handle potential WebSocket errors
      if (error instanceof Error) {
        await this.handleConnectionError(error);
      }
    }
  }

  /**
   * Process transaction data looking for create instructions
   */
  private async processTransaction(transaction: any, signature: string): Promise<void> {
    try {
      if (!transaction || !transaction.transaction || !transaction.transaction.message) {
        return;
      }
      
      let foundCreate = false;
      
      // Check instructions
      const instructions = transaction.transaction.message.instructions || [];
      for (const instruction of instructions) {
        if (instruction.parsed && instruction.parsed.type && 
            instruction.parsed.type.toLowerCase().includes('create')) {
          
          foundCreate = true;
          
          if (instruction.parsed.info) {
            console.log('Info:', JSON.stringify(instruction.parsed.info, null, 2));
            
            const tokenData = {
              signature,
              account: instruction.parsed.info.account || '',
              mint: instruction.parsed.info.mint || '',
              source: instruction.parsed.info.source || '',
              systemProgram: instruction.parsed.info.systemProgram || '11111111111111111111111111111111',
              tokenProgram: instruction.parsed.info.tokenProgram || 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              wallet: instruction.parsed.info.wallet || instruction.parsed.info.source || '',
              timestamp: transaction.blockTime ? new Date(transaction.blockTime * 1000).toISOString() : null,
            };
  
            this.emit('tokenCreated', tokenData);
  
            if (instruction.parsed.info.mint) {
              try {
                const metadata = await this.getTokenMetadataWithRetry(instruction.parsed.info.mint);
                if (metadata) {
                  console.log('Token metadata:', metadata);
                  this.emit('tokenMetadata', {
                    ...tokenData,
                    metadata: {
                      name: metadata.offChain?.name || '',
                      symbol: metadata.offChain?.symbol || '',
                      description: metadata.offChain?.description || '',
                      image: metadata.offChain?.image || '',
                      createdOn: tokenData.timestamp,
                      twitter: metadata.offChain?.twitter || '',
                      website: metadata.offChain?.website || ''
                    }
                  });
                }
              } catch (error) {
                console.error('Error fetching token metadata:', error);
                // If it's a rate limit error, switch endpoints and retry
                if (error instanceof Error && 
                    (error.toString().includes('429') || 
                     error.toString().toLowerCase().includes('too many requests'))) {
                  await this.handleConnectionError(error);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      if (error instanceof Error) {
        await this.handleConnectionError(error);
      }
    }
  }

  /**
   * Get token metadata with retry logic and endpoint switching
   */
  private async getTokenMetadataWithRetry(mint: string, maxRetries = 5): Promise<any> {
    let retryCount = 0;
    let lastError: any;

    while (retryCount < maxRetries) {
      try {
        if (retryCount > 0) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 16000);
          console.log(`Retrying metadata fetch after ${delay}ms delay...`);
          await sleep(delay);
        }

        const mintPubkey = new PublicKey(mint);
        const metadataAddress = await getMetadataAddress(mintPubkey);
        
        const accountInfo = await this.connection.getAccountInfo(metadataAddress);
        if (!accountInfo) {
          console.log(`No metadata found for token: ${mint}`);
          return null;
        }

        // Decode metadata manually
        const metadata = await programs.metadata.Metadata.load(this.connection, metadataAddress);

        if (metadata.data.data.uri) {
          try {
            await sleep(500);
            const response = await fetch(metadata.data.data.uri);
            
            if (response.status === 429) {
              throw new Error('429 Rate limit exceeded');
            }
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonMetadata = await response.json();
            return {
              onChain: metadata.data.data,
              offChain: jsonMetadata
            };
          } catch (error) {
            console.error('Error fetching off-chain metadata:', error);
            
            if (error instanceof Error && 
                (error.toString().includes('429') || 
                 error.toString().toLowerCase().includes('too many requests'))) {
              throw error;
            }
            
            return {
              onChain: metadata.data.data,
              offChain: null
            };
          }
        }

        return {
          onChain: metadata.data.data,
          offChain: null
        };
      } catch (error: any) {
        lastError = error;
        
        if (error.toString().includes('429') || error.toString().toLowerCase().includes('too many requests')) {
          retryCount++;
          if (retryCount === maxRetries) {
            console.error(`Max retries (${maxRetries}) reached for token ${mint}`);
            break;
          }
          
          await this.handleConnectionError(error);
          continue;
        }
        
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Process signatures in batches to avoid overwhelming the connection
   */
  private async processNextBatchOfSignatures(): Promise<void> {
    if (this.isProcessingSignatures) return;
    
    this.isProcessingSignatures = true;
    
    try {
      // Process up to 5 signatures at a time
      const batch = this.pendingSignatures.splice(0, 5);
      
      for (const signature of batch) {
        await this.getTransactionDetailsViaWebSocket(signature);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      this.isProcessingSignatures = false;
      
      // Schedule next batch
      setTimeout(() => this.processNextBatchOfSignatures(), 5000);
    }
  }

  /**
   * Stop monitoring the account
   */
  public stop(): void {
    if (this.ws) {
      if (this.programSubscriptionId !== null) {
        // Unsubscribe from the program
        const unsubscribeMessage = {
          jsonrpc: '2.0',
          id: 3,
          method: 'programUnsubscribe',
          params: [this.programSubscriptionId]
        };
        
        try {
          this.ws.send(JSON.stringify(unsubscribeMessage));
        } catch (e) {
          // Ignore errors when unsubscribing during shutdown
        }
      }
      
      if (this.logsSubscriptionId !== null) {
        // Unsubscribe from logs
        const unsubscribeMessage = {
          jsonrpc: '2.0',
          id: 4,
          method: 'logsUnsubscribe',
          params: [this.logsSubscriptionId]
        };
        
        try {
          this.ws.send(JSON.stringify(unsubscribeMessage));
        } catch (e) {
          // Ignore errors when unsubscribing during shutdown
        }
      }
      
      this.ws.close();
      this.ws = null;
      this.programSubscriptionId = null;
      this.logsSubscriptionId = null;
      console.log('Account watcher stopped');
    }
  }
}

// Example usage
if (require.main === module) {
  // Use the account address from the command line or default to the one provided
  const accountAddress = process.argv[2] || '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
  
  console.log(`Starting to watch account: ${accountAddress}`);
  
  const watcher = new SolanaAccountWatcher(accountAddress);
  watcher.start()
    .catch(error => {
      console.error('Error starting account watcher:', error);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Stopping account watcher...');
    watcher.stop();
    process.exit(0);
  });
}

// Helper function to get metadata address
const getMetadataAddress = async (mint: PublicKey): Promise<PublicKey> => {
  const {
    metadata: { MetadataProgram }
  } = programs;
  
  const [metadataAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  
  return metadataAddress;
};

// Helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



// Create a map to store active change streams for each WebSocket
const wsChangeStreams = new WeakMap<ServerWebSocket, ChangeStream[]>();
const solanaWatchers = new WeakMap<ServerWebSocket, SolanaAccountWatcher>();

// Define message types for better type safety
interface SubscribeMessage {
  type: 'subscribe';
  dataType: 'tokens' | 'agents' | 'transactions' | 'totalVolume' | 'tokenByAddress' | 'allTransactions' | 'solanaTokens';
  tokenAddress?: string;
  timeRange?: string;
  collection?: string;
  filter?: Record<string, any>;
  sort?: Record<string, any>;
  limit?: number;
  address?: string;
  accountAddress?: string;
}

type ClientMessage = SubscribeMessage;

// Create WebSocket server with Bun
const server = serve({
  port: process.env.PORT || 3001,
  fetch(req, server) {
    // Handle WebSocket upgrade
    if (server.upgrade(req)) {
      return; // Return if upgrade was successful
    }
    
    return new Response("WebSocket server running", { status: 200 });
  },
  websocket: {
    open: async (ws: ServerWebSocket) => {
      console.log("Client connected");
      
      try {
        // Get MongoDB client
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        
        // Send available data types to client
        ws.send(JSON.stringify({ 
          type: 'availableDataTypes', 
          data: ['tokens', 'agents', 'transactions', 'totalVolume', 'solanaTokens'] 
        }));
        
        // Store change streams for this connection
        wsChangeStreams.set(ws, []);
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to connect to database' 
        }));
        ws.close();
      }
    },
    message: async (ws: ServerWebSocket, message: string | Buffer) => {
      try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        
        const parsedMessage = JSON.parse(message.toString()) as ClientMessage;
        
        if (parsedMessage.type === 'subscribe') {
          const { dataType, tokenAddress, timeRange, collection, filter = {}, sort = {}, limit = 100, address, accountAddress } = parsedMessage;
          
          // Handle different data types
          switch (dataType) {
            case 'tokens':
              // Fetch tokens data
              const tokens = await db.collection('tokens').find().toArray();
              ws.send(JSON.stringify({ 
                type: 'data', 
                dataType: 'tokens', 
                data: tokens 
              }));
              
              // Set up change stream for tokens
              const tokensChangeStream = db.collection('tokens').watch();
              tokensChangeStream.on('change', (change) => {
                ws.send(JSON.stringify({ 
                  type: 'update', 
                  dataType: 'tokens', 
                  change 
                }));
              });
              
              // Store change stream
              const tokensStreams = wsChangeStreams.get(ws) || [];
              tokensStreams.push(tokensChangeStream);
              wsChangeStreams.set(ws, tokensStreams);
              break;
              
            case 'agents':
              // Fetch agents data
              const agents = await db.collection('agents').find().toArray();
              ws.send(JSON.stringify({ 
                type: 'data', 
                dataType: 'agents', 
                data: agents 
              }));
              
              // Set up change stream for agents
              const agentsChangeStream = db.collection('agents').watch();
              agentsChangeStream.on('change', (change) => {
                ws.send(JSON.stringify({ 
                  type: 'update', 
                  dataType: 'agents', 
                  change 
                }));
              });
              
              // Store change stream
              const agentsStreams = wsChangeStreams.get(ws) || [];
              agentsStreams.push(agentsChangeStream);
              wsChangeStreams.set(ws, agentsStreams);
              break;
              
            case 'transactions':
              if (!tokenAddress) {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: 'tokenAddress is required for transactions' 
                }));
                return;
              }
              
              // Create filter for transactions - check both from and to fields
              const transactionFilter: Record<string, any> = { 
                $or: [
                  { from: tokenAddress },
                  { to: tokenAddress },
                  { tokenAddress: tokenAddress } // Also check if tokenAddress field exists
                ]
              };
              
              if (timeRange === '24h') {
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                transactionFilter.timestamp = { $gte: oneDayAgo };
              } else if (timeRange === '7d') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                transactionFilter.timestamp = { $gte: sevenDaysAgo };
              } else if (timeRange === '30d') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                transactionFilter.timestamp = { $gte: thirtyDaysAgo };
              }
              
              console.log('Fetching transactions with filter:', JSON.stringify(transactionFilter));
              
              // Fetch transactions data
              const transactions = await db.collection('transactions')
                .find(transactionFilter)
                .sort({ timestamp: -1 })
                .limit(limit || 100)
                .toArray();
                
              console.log(`Found ${transactions.length} transactions for address ${tokenAddress}`);
                
              ws.send(JSON.stringify({ 
                type: 'data', 
                dataType: 'transactions', 
                tokenAddress,
                timeRange,
                data: transactions 
              }));
              
              // Set up change stream for transactions with improved pipeline
              const transactionsChangeStream = db.collection('transactions').watch();
              
              transactionsChangeStream.on('change', (change) => {
                // Kiểm tra xem change có liên quan đến tokenAddress không
                let isRelevant = false;
                
                if (change.operationType === 'insert' && change.fullDocument) {
                  isRelevant = change.fullDocument.from === tokenAddress || 
                              change.fullDocument.to === tokenAddress || 
                              change.fullDocument.tokenAddress === tokenAddress;
                } else if (change.operationType === 'update') {
                  // Đối với cập nhật, chúng ta cần kiểm tra ID của document
                  // Lấy transaction hiện tại để kiểm tra
                  db.collection('transactions').findOne({ _id: change.documentKey._id })
                    .then(tx => {
                      if (tx && (tx.from === tokenAddress || tx.to === tokenAddress || tx.tokenAddress === tokenAddress)) {
                        // Gửi cập nhật nếu transaction liên quan đến token của chúng ta
                        ws.send(JSON.stringify({ 
                          type: 'update', 
                          dataType: 'transactions', 
                          tokenAddress,
                          timeRange,
                          change 
                        }));
                      }
                    })
                    .catch(err => console.error('Error checking transaction relevance:', err));
                  
                  // Không tiếp tục xử lý ở đây vì chúng ta đã xử lý bất đồng bộ ở trên
                  return;
                } else if (change.operationType === 'delete') {
                  // Đối với xóa, chúng ta không thể biết liệu document đã xóa có liên quan không
                  // Nên gửi thông báo để client có thể quyết định
                  isRelevant = true;
                }
                
                // Chỉ gửi cập nhật nếu liên quan đến token của chúng ta
                if (isRelevant) {
                  // Kiểm tra thêm điều kiện thời gian nếu cần
                  let meetTimeFilter = true;
                  
                  if (timeRange === '24h' && change.operationType === 'insert') {
                    const oneDayAgo = new Date();
                    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                    meetTimeFilter = change.fullDocument.timestamp >= oneDayAgo;
                  } else if (timeRange === '7d' && change.operationType === 'insert') {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    meetTimeFilter = change.fullDocument.timestamp >= sevenDaysAgo;
                  } else if (timeRange === '30d' && change.operationType === 'insert') {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    meetTimeFilter = change.fullDocument.timestamp >= thirtyDaysAgo;
                  }
                  
                  if (meetTimeFilter) {
                    ws.send(JSON.stringify({ 
                      type: 'update', 
                      dataType: 'transactions', 
                      tokenAddress,
                      timeRange,
                      change 
                    }));
                  }
                }
              });
              
              // Store change stream
              const transactionsStreams = wsChangeStreams.get(ws) || [];
              transactionsStreams.push(transactionsChangeStream);
              wsChangeStreams.set(ws, transactionsStreams);
              break;
              
            case 'totalVolume':
              // Get time range parameter if provided
              const volumeTimeRange = parsedMessage.timeRange;
              
              // Prepare aggregation pipeline
              let matchStage = {};
              if (volumeTimeRange === '24h') {
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                matchStage = { timestamp: { $gte: oneDayAgo } };
              } else if (volumeTimeRange === '7d') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                matchStage = { timestamp: { $gte: sevenDaysAgo } };
              } else if (volumeTimeRange === '30d') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                matchStage = { timestamp: { $gte: thirtyDaysAgo } };
              }
              
              // Aggregate total volume
              const pipeline = [
                ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
                { $group: { _id: null, totalVolume: { $sum: '$totalValue' } } }
              ];
              
              const volumeResult = await db.collection('transactions').aggregate(pipeline).toArray();
              
              const totalVolume = volumeResult.length > 0 ? volumeResult[0].totalVolume : 0;
              
              ws.send(JSON.stringify({ 
                type: 'data', 
                dataType: 'totalVolume', 
                timeRange: volumeTimeRange,
                data: { totalVolume } 
              }));
              
              // Set up change stream for transactions that will update total volume
              const volumeChangeStream = db.collection('transactions').watch();
              
              volumeChangeStream.on('change', async () => {
                // Recalculate total volume on any transaction change
                const newVolumeResult = await db.collection('transactions').aggregate(pipeline).toArray();
                
                const newTotalVolume = newVolumeResult.length > 0 ? newVolumeResult[0].totalVolume : 0;
                
                ws.send(JSON.stringify({ 
                  type: 'update', 
                  dataType: 'totalVolume', 
                  timeRange: volumeTimeRange,
                  data: { totalVolume: newTotalVolume } 
                }));
              });
              
              // Store change stream
              const volumeStreams = wsChangeStreams.get(ws) || [];
              volumeStreams.push(volumeChangeStream);
              wsChangeStreams.set(ws, volumeStreams);
              break;
              
            case 'tokenByAddress':
              if (!address) {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: 'address is required for tokenByAddress' 
                }));
                return;
              }
              
              // Fetch token by address
              const token = await db.collection('tokens').findOne({ 
                address: { $regex: new RegExp(`^${address}$`, 'i') } // Case insensitive match
              });
              
              if (token) {
                ws.send(JSON.stringify({ 
                  type: 'data', 
                  dataType: 'tokenByAddress', 
                  address,
                  data: token 
                }));
              } else {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  dataType: 'tokenByAddress',
                  address,
                  message: 'Token not found' 
                }));
              }
              
              // Set up change stream for tokens with filter for this address
              const tokenByAddressChangeStream = db.collection('tokens').watch([
                { 
                  $match: { 
                    $or: [
                      { 'fullDocument.address': { $regex: new RegExp(`^${address}$`, 'i') } },
                      { 'documentKey._id': token ? token._id : null }
                    ]
                  } 
                }
              ]);
              
              tokenByAddressChangeStream.on('change', (change) => {
                ws.send(JSON.stringify({ 
                  type: 'update', 
                  dataType: 'tokenByAddress', 
                  address,
                  change 
                }));
              });
              
              // Store change stream
              const tokenByAddressStreams = wsChangeStreams.get(ws) || [];
              tokenByAddressStreams.push(tokenByAddressChangeStream);
              wsChangeStreams.set(ws, tokenByAddressStreams);
              break;
              
            case 'allTransactions':
              // Tạo filter dựa trên timeRange
              const allTransactionsFilter: Record<string, any> = {};
              
              if (timeRange === '24h') {
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                allTransactionsFilter.timestamp = { $gte: oneDayAgo };
              } else if (timeRange === '7d') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                allTransactionsFilter.timestamp = { $gte: sevenDaysAgo };
              } else if (timeRange === '30d') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                allTransactionsFilter.timestamp = { $gte: thirtyDaysAgo };
              }
              
              console.log('Fetching all transactions with filter:', JSON.stringify(allTransactionsFilter));
              
              // Fetch all transactions data
              const allTransactions = await db.collection('transactions')
                .find(allTransactionsFilter)
                .sort({ timestamp: -1 })
                .limit(limit || 100)
                .toArray();
                
              console.log(`Found ${allTransactions.length} transactions`);
                
              ws.send(JSON.stringify({ 
                type: 'data', 
                dataType: 'allTransactions', 
                timeRange,
                data: allTransactions 
              }));
              
              // Set up change stream for all transactions
              const allTransactionsChangeStream = db.collection('transactions').watch();
              
              allTransactionsChangeStream.on('change', (change) => {
                // Kiểm tra điều kiện thời gian
                let meetTimeFilter = true;
                
                if (timeRange === '24h' && change.operationType === 'insert' && change.fullDocument) {
                  const oneDayAgo = new Date();
                  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                  meetTimeFilter = change.fullDocument.timestamp >= oneDayAgo;
                } else if (timeRange === '7d' && change.operationType === 'insert' && change.fullDocument) {
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  meetTimeFilter = change.fullDocument.timestamp >= sevenDaysAgo;
                } else if (timeRange === '30d' && change.operationType === 'insert' && change.fullDocument) {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  meetTimeFilter = change.fullDocument.timestamp >= thirtyDaysAgo;
                }
                
                if (meetTimeFilter) {
                  ws.send(JSON.stringify({ 
                    type: 'update', 
                    dataType: 'allTransactions', 
                    timeRange,
                    change 
                  }));
                }
              });
              
              // Store change stream
              const allTransactionsStreams = wsChangeStreams.get(ws) || [];
              allTransactionsStreams.push(allTransactionsChangeStream);
              wsChangeStreams.set(ws, allTransactionsStreams);
              break;
              
            case 'solanaTokens':

              const accountAddress = 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM'
              console.log('Creating SolanaAccountWatcher for address:', accountAddress);
            
              // Create new SolanaAccountWatcher instance
              const watcher = new SolanaAccountWatcher(accountAddress);
              
              // Store watcher instance
              solanaWatchers.set(ws, watcher);
            
              // Handle token metadata events
              watcher.on('tokenMetadata', (tokenData: any) => {
                console.log('Token with metadata:', tokenData);
                ws.send(JSON.stringify({
                  type: 'update',
                  dataType: 'solanaTokens',
                  data: tokenData
                }));
              });
            
              // Handle errors
              watcher.on('error', (error: any) => {
                console.error('Watcher error:', error);
                ws.send(JSON.stringify({
                  type: 'error',
                  dataType: 'solanaTokens',
                  message: error.message
                }));
              });
            
              // Start watching
              console.log('Starting watcher...');
              await watcher.start();
              console.log('Watcher started successfully');
              break;
              
            default:
              // If dataType is not recognized, try to use collection parameter
              if (collection) {
                
                // Initial data fetch
                const initialData = await db.collection(collection)
                  .find(filter)
                  .sort(sort)
                  .limit(limit)
                  .toArray();
                  
                ws.send(JSON.stringify({ 
                  type: 'data', 
                  collection, 
                  data: initialData 
                }));
                
                // Set up change stream for real-time updates
                const changeStream = db.collection(collection).watch();
                
                changeStream.on('change', (change) => {
                  ws.send(JSON.stringify({ 
                    type: 'update', 
                    collection, 
                    change 
                  }));
                });
                
                // Store change stream to close it when connection closes
                const streams = wsChangeStreams.get(ws) || [];
                streams.push(changeStream);
                wsChangeStreams.set(ws, streams);
              } else {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: `Invalid dataType: ${dataType}` 
                }));
              }
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Error processing request' 
        }));
      }
    },
    close: (ws: ServerWebSocket) => {
      console.log("Client disconnected");
      // Close any active change streams
      const streams = wsChangeStreams.get(ws) || [];
      streams.forEach(stream => stream.close());
      wsChangeStreams.delete(ws);

      // Stop Solana watcher if exists
      const watcher = solanaWatchers.get(ws);
      if (watcher) {
        watcher.stop();
        solanaWatchers.delete(ws);
      }
    },
  }
});

console.log(`WebSocket server running on port ${server.port}`);
