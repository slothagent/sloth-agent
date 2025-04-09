# Solana Token Watcher for Pump.fun

This project includes a WebSocket server that monitors the Solana blockchain for new tokens listed on [Pump.fun](https://pump.fun/) and notifies subscribers in real-time.

## Features

- Real-time monitoring of the Solana blockchain for new tokens
- WebSocket server for subscribing to new token notifications
- Integration with Pump.fun API to verify and fetch token details
- Support for filtering tokens based on various criteria
- Multiple subscription types (new tokens, trending tokens, token details, token transactions)

## Architecture

The system consists of the following components:

1. **WebSocket Server (index.ts)**: Handles client connections and subscriptions
2. **Pump.fun API Integration (pumpFunAPI.ts)**: Fetches token data from Pump.fun
3. **Solana Token Watcher (solanaTokenWatcher.ts)**: Monitors the Solana blockchain for new tokens
4. **Test Clients**: Simple clients to test the WebSocket server functionality

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime)
- Solana RPC endpoint (you can use public endpoints or set up your own)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment variables (optional):
   ```
   SOLANA_RPC_URL=your-solana-rpc-endpoint
   SOLANA_WS_URL=your-solana-websocket-endpoint
   PORT=3001
   ```

## Running the Server

Start the WebSocket server:

```bash
bun run index.ts
```

Start the Solana token watcher:

```bash
bun run solanaTokenWatcher.ts
```

## Testing

Run the test client to see new tokens as they are created:

```bash
bun run testClient.ts
```

Run the Solana-specific test client:

```bash
bun run solanaTokenTestClient.ts
```

## WebSocket API

### Connection

Connect to the WebSocket server at:

```
ws://localhost:3001/pumpfun
```

### Subscription Types

The server supports several subscription types:

1. **newTokens**: Subscribe to newly created tokens
2. **trendingTokens**: Subscribe to trending tokens
3. **tokenDetails**: Get details for a specific token
4. **tokenTransactions**: Get transactions for a specific token

### Message Format

#### Subscription Request

```json
{
  "type": "subscribe",
  "dataType": "newTokens",
  "filters": {
    "minHolders": 5,
    "minTransactions": 3,
    "minVolume": 100
  }
}
```

#### Token Details Subscription

```json
{
  "type": "subscribe",
  "dataType": "tokenDetails",
  "tokenAddress": "TokenAddressHere"
}
```

#### Data Response

```json
{
  "type": "data",
  "dataType": "newTokens",
  "data": [
    {
      "address": "TokenAddressHere",
      "name": "Token Name",
      "symbol": "TKN",
      "created_at": "2023-06-15T14:30:45Z",
      "holders": 120,
      "transactions": 450,
      "price": 0.05,
      "volume_24h": 15000
    }
  ]
}
```

#### Solana Token Detection

When the Solana token watcher detects a new token:

```json
{
  "type": "newTokenDetected",
  "data": {
    "address": "TokenAddressHere",
    "name": "Token Name",
    "symbol": "TKN",
    "created_at": "2023-06-15T14:30:45Z",
    "holders": 120,
    "transactions": 450,
    "price": 0.05,
    "volume_24h": 15000
  }
}
```

## Solana Integration

The system monitors the Solana blockchain for transactions to the Pump.fun program ID:

```
TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM
```

When a new token is created, the system:

1. Detects the transaction on the Solana blockchain
2. Extracts the token address
3. Verifies the token on Pump.fun API
4. Notifies subscribers about the new token

## Solana Account Watcher

The Solana Account Watcher monitors a specific Solana account for transactions that contain "create" instructions using WebSocket subscriptions.

### Features
- Real-time monitoring of transactions for a specified account
- Filtering for transactions with "create" instructions
- WebSocket-based for efficient updates
- Detailed logging of transaction information

### Usage

```bash
# Run with default account (6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P)
bun run watchSolanaAccount.ts

# Or specify a custom account address
bun run watchSolanaAccount.ts SomeOtherSolanaAccountAddress
```

### Programmatic Usage

```typescript
import { SolanaAccountWatcher } from './solanaAccountWatcher';

// Create a watcher for a specific account
const watcher = new SolanaAccountWatcher('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

// Start watching for transactions with create instructions
await watcher.start();

// Later, when done watching
watcher.stop();
```

## License

MIT 