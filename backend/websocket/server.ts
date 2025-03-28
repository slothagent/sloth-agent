import { serve, ServerWebSocket } from "bun";
import { ChangeStream } from 'mongodb';
import clientPromise from './mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { SolanaAccountWatcher } from './solanaAccountWatcher';

// Load all models from the models directory
const modelsPath = path.join(import.meta.dir, 'models');
const modelFiles = fs.readdirSync(modelsPath)
  .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

// Store model names for later use
const modelNames: string[] = [];
modelFiles.forEach(file => {
  const modelName = path.basename(file, path.extname(file));
  modelNames.push(modelName);
});

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
                if (!modelNames.includes(collection)) {
                  ws.send(JSON.stringify({ 
                    type: 'error', 
                    message: `Invalid collection: ${collection}` 
                  }));
                  return;
                }
                
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
