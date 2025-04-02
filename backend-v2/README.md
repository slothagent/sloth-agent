# Sloth Agent Backend

This is the backend API for the Sloth Agent application, built with NestJS and MongoDB.

## Prerequisites

- Node.js (v20.0.0 or higher)
- npm (v10.0.0 or higher)
- Bun (latest version)
- MongoDB

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/slothagent
MONGODB_DB=slothagent
REPLICATE_API_TOKEN=your_replicate_api_token
OPENAI_API_KEY=your_openai_api_key
MORALIS_API_KEY=your_moralis_api_key
BRAVE_API_KEY=your_brave_api_key
```

## Installation

```bash
# Install dependencies
npm install

# Or with Bun
bun install
```

## Quick Setup

We've provided setup scripts to make it easy to get started:

```bash
# Using Node.js
./setup.sh

# Using Bun
./setup-bun.sh
```

## Running the Application

```bash
# Development mode with Node.js
npm run start:dev

# Development mode with Bun
npm run start:bun:dev

# Production mode with Node.js
npm run build
npm run start:prod

# Production mode with Bun
npm run build
npm run start:bun
```

## API Endpoints

### Health Check
- `GET /api/health` - Check the health of the API and its services

### User
- `GET /api/user/check?address={address}` - Check if a user exists
- `POST /api/user/register` - Register a new user

### Agent
- `GET /api/agent` - Get all agents with pagination
- `GET /api/agent?id={id}` - Get an agent by ID
- `GET /api/agent?symbol={symbol}` - Get an agent by ticker symbol
- `GET /api/agent?owner={owner}` - Get agents by owner
- `GET /api/agent?search={search}` - Search agents
- `POST /api/agent` - Create a new agent

### Token
- `GET /api/token` - Get all tokens with pagination
- `GET /api/token?address={address}` - Get a token by address
- `GET /api/token?search={search}` - Search tokens
- `POST /api/token` - Create a new token

### Transaction
- `GET /api/transaction` - Get all transactions with pagination
- `GET /api/transaction?tokenAddress={tokenAddress}` - Get transactions by token address
- `GET /api/transaction?tokenAddress={tokenAddress}&latest=true` - Get the latest transaction for a token
- `GET /api/transaction?tokenAddress={tokenAddress}&timeRange={1h|24h|7d|30d|1y}` - Get transactions for a time range
- `GET /api/transaction?totalVolume=true` - Get total transaction volume
- `POST /api/transaction` - Create a new transaction

### Omni Service API

#### Chat and Search
- `POST /api/omni/chat` - Chat with AI assistant
  - Body: `{ "userId": string, "message": string }`
- `DELETE /api/omni/chat` - Clear chat history
  - Query params: `userId`
- `GET /api/omni/search` - Web search functionality
  - Query params: `query`

### Price
- `GET /api/binance-eth-price` - Get the current ETH price
- `GET /api/sonic-price` - Get the current Sonic price

### Image Generation
- `POST /api/generate-image` - Generate an image using Replicate API

### Twitter Auth
- `GET /api/auth/callback/twitter` - Handle Twitter OAuth callback

## Troubleshooting

### Replicate Package Issues
If you encounter issues with the Replicate package, make sure you're using version 0.25.2 (without the caret ^ in package.json) and that you're importing it correctly in your code.

### CORS Issues
If you encounter CORS issues when making requests from your frontend application, check the CORS configuration in `src/main.ts`. The current configuration allows requests from:
- http://localhost:3000
- http://localhost:5173
- https://www.slothai.xyz
- https://slothai.xyz

And allows the following headers:
- Content-Type
- Authorization
- Cache-Control
- X-Requested-With
- Accept

If you need to add more origins or headers, update the CORS configuration in `src/main.ts`.

## License

MIT
