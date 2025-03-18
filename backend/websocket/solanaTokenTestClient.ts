import WebSocket from 'ws';
import { PumpFunToken } from './pumpFunAPI';

// Configuration
const WS_URL = 'ws://localhost:3001/pumpfun';

// Create WebSocket connection
console.log(`Connecting to ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

// Handle connection open
ws.on('open', () => {
  console.log('Connected to Pump.fun WebSocket server');
  
  // We don't need to explicitly subscribe to new token events from Solana
  // Since the solanaTokenWatcher will automatically push them
  console.log('Listening for new token events from Solana...');
  console.log('---------------------------------------------');
});

// Handle incoming messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    switch (message.type) {
      case 'data':
        if (message.dataType === 'newTokens') {
          console.log(`\n[NEW TOKENS] Received ${message.data.length} new tokens:`);
          
          // Display details for each new token
          if (Array.isArray(message.data) && message.data.length > 0) {
            message.data.forEach((token: PumpFunToken, index: number) => {
              console.log(`\n--- New Token #${index + 1} ---`);
              console.log(`Address: ${token.address}`);
              console.log(`Name: ${token.name || 'No name'}`);
              console.log(`Symbol: ${token.symbol || 'No symbol'}`);
              console.log(`Created at: ${token.created_at || 'Unknown'}`);
              console.log(`Holders: ${token.holders || 'Unknown'}`);
              console.log(`Transactions: ${token.transactions || 'Unknown'}`);
              console.log(`Price: ${token.price ? token.price + ' SOL' : 'Unknown'}`);
              console.log(`Volume 24h: ${token.volume_24h ? token.volume_24h + ' SOL' : 'Unknown'}`);
              
              if (token.website || token.twitter || token.telegram || token.discord) {
                console.log('Links:');
                if (token.website) console.log(`- Website: ${token.website}`);
                if (token.twitter) console.log(`- Twitter: ${token.twitter}`);
                if (token.telegram) console.log(`- Telegram: ${token.telegram}`);
                if (token.discord) console.log(`- Discord: ${token.discord}`);
              }
              
              if (token.description) {
                console.log(`Description: ${token.description}`);
              }
            });
          } else {
            console.log('No token data received');
          }
        } else {
          console.log(`\n[DATA] Received ${message.dataType} data`);
        }
        break;
        
      case 'newTokenDetected':
        // This is our custom event from the Solana Token Watcher
        console.log(`\n[NEW TOKEN FROM SOLANA] Token detected:`);
        const token = message.data as PumpFunToken;
        
        console.log(`Address: ${token.address}`);
        console.log(`Name: ${token.name || 'No name'}`);
        console.log(`Symbol: ${token.symbol || 'No symbol'}`);
        console.log(`Created at: ${token.created_at || 'Unknown'}`);
        console.log(`Holders: ${token.holders || 'Unknown'}`);
        console.log(`Transactions: ${token.transactions || 'Unknown'}`);
        console.log(`Price: ${token.price ? token.price + ' SOL' : 'Unknown'}`);
        console.log(`Volume 24h: ${token.volume_24h ? token.volume_24h + ' SOL' : 'Unknown'}`);
        
        if (token.website || token.twitter || token.telegram || token.discord) {
          console.log('Links:');
          if (token.website) console.log(`- Website: ${token.website}`);
          if (token.twitter) console.log(`- Twitter: ${token.twitter}`);
          if (token.telegram) console.log(`- Telegram: ${token.telegram}`);
          if (token.discord) console.log(`- Discord: ${token.discord}`);
        }
        
        if (token.description) {
          console.log(`Description: ${token.description}`);
        }
        break;
        
      case 'subscribed':
        console.log(`\n[SUBSCRIBED] Successfully subscribed to ${message.dataType}`);
        if (message.filters) {
          console.log('With filters:', JSON.stringify(message.filters, null, 2));
        }
        break;
        
      case 'error':
        console.error(`\n[ERROR] ${message.message}`);
        break;
        
      case 'info':
        console.info(`\n[INFO] ${message.message}`);
        if (message.availableDataTypes) {
          console.info('Available data types:', message.availableDataTypes);
        }
        break;
        
      default:
        console.log(`\n[UNKNOWN] Received unknown message type: ${message.type}`);
        console.log(JSON.stringify(message, null, 2));
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    console.error('Original message:', data.toString());
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle connection close
ws.on('close', (code, reason) => {
  console.log(`Disconnected from WebSocket server: ${code} - ${reason.toString()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing WebSocket connection...');
  ws.close();
  process.exit(0);
});

console.log('Solana Token Test Client running. Waiting for new tokens...');
console.log('Press Ctrl+C to exit.'); 