import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from 'hono';
import type { Context } from 'hono';
import { AgentModel } from './models/agent';
import { TokenModel } from './models/token';
import { getUserByAddress, registerUserIfNeeded } from './models/user';
import { 
  createTransaction, 
  getTransactionHistory, 
  getLatestTransaction, 
  getPaginatedTransactions, 
  calculateTotalVolume 
} from './models/transactions';
import Replicate from 'replicate';
import {
  cleanup,
  failSpinner,
  logger,
  startSpinner,
  succeedSpinner,
} from "./utils/logger";


// Token Routes
interface CreateTokenData {
  name: string;
  address: string;
  curveAddress: string;
  owner: string;
  description?: string;
  ticker: string;
  imageUrl?: string;
  totalSupply: string;
  twitterUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  categories?: string[];
  network?: string;
}

// Transaction Routes
interface CreateTransactionData {
  from: string;
  to: string;
  amount: number;
  price: number;
  transactionType: string;
  transactionHash: string;
  timestamp: Date;
  totalValue: number;
  supply: string;
  marketCap: number;
  network: string;
  fundingRaised: number;
  amountTokensToReceive: number;
}

interface AppContext {
  twitterService?: any;
  submissionService?: any;
  distributionService?: any;
}

interface AppInstance {
  app: Hono;
  context: AppContext;
}

const PORT = Number(process.env.PORT) || 8080;
let instance: AppInstance | null = null;

async function createApp(): Promise<AppInstance> {
  const app = new Hono().basePath('/api');
  const context: AppContext = {};

  // Middleware
  app.use('*', async (c: Context, next) => {
    await c.res.headers.set('Access-Control-Allow-Origin', '*');
    await c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    await c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return await next();
  });

  // Health check route
  app.get("/health", (c) => {
    const health = {
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        twitter: context.twitterService ? "up" : "down",
        submission: context.submissionService ? "up" : "down",
        distribution: context.distributionService ? "up" : "down",
      },
    };
    return c.json(health);
  });

  // Agent Routes
  app.post('/agent', async (c) => {
    try {
      const body = await c.req.json();

      // Validate required fields
      const requiredFields = ['name','description','owner'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return c.json({ error: `Missing required field: ${field}` }, 400);
        }
      }

      // Prepare the data object with required fields
      const agentData = {
        name: body.name,
        slug: body.slug,
        ticker: body.ticker,
        tokenAddress: body.tokenAddress,
        network: body.network,
        owner: body.owner,
        description: body.description || '',
        imageUrl: body.imageUrl || '',
        agentLore: body.agentLore || '',
        personality: body.personality || '',
        knowledgeAreas: body.knowledgeAreas || '',
        categories: body.categories || [],
        twitterAuth: body.twitterAuth ? {
          accessToken: body.twitterAuth.accessToken || null,
          refreshToken: body.twitterAuth.refreshToken || null,
          expiresAt: body.twitterAuth.expiresAt || null,
          tokenType: body.twitterAuth.tokenType || null,
          scope: body.twitterAuth.scope || null
        } : undefined
      };

      const agentResult = await AgentModel.create(agentData);
      const agent = await AgentModel.findById(agentResult.insertedId.toString());

      if (!agent) {
        throw new Error('Failed to create agent');
      }

      return c.json({ agent }, 201);
    } catch (error) {
      console.error('Error creating agent:', error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          return c.json({ error: 'An agent with this ticker already exists' }, 400);
        }
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  });

  app.get('/agent', async (c) => {
    try {
      const { symbol, id, owner, page = '1', pageSize = '10', search } = c.req.query();
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      console.log('Fetching agents with params:', { symbol, id, owner, page: pageNum, pageSize: pageSizeNum, search });

      // Get agent by ID
      if (id) {
        try {
          const agent = await AgentModel.findById(id);
          if (!agent) {
            return c.json({ error: 'Agent not found' }, 404);
          }
          return c.json({
            data: agent,
            metadata: {
              currentPage: 1,
              pageSize: 1,
              totalPages: 1,
              totalCount: 1
            }
          });
        } catch (error) {
          return c.json({ error: 'Invalid agent ID' }, 400);
        }
      }

      // Get agent by symbol/ticker
      if (symbol) {
        const agent = await AgentModel.findByTicker(symbol);
        if (!agent) {
          return c.json({ error: 'Agent not found' }, 404);
        }
        return c.json({
          data: agent,
          metadata: {
            currentPage: 1,
            pageSize: 1,
            totalPages: 1,
            totalCount: 1
          }
        });
      }

      // Get agents by owner
      if (owner) {
        const collection = await AgentModel.getCollection();
        const skip = (pageNum - 1) * pageSizeNum;

        // Count total agents for this owner
        const totalCount = await collection.countDocuments({ owner });

        if (totalCount === 0) {
          return c.json({
            data: [],
            metadata: {
              currentPage: pageNum,
              pageSize: pageSizeNum,
              totalPages: 0,
              totalCount: 0
            }
          });
        }

        // Validate pagination
        if (skip >= totalCount) {
          return c.json({
            data: [],
            metadata: {
              currentPage: pageNum,
              pageSize: pageSizeNum,
              totalPages: Math.ceil(totalCount / pageSizeNum),
              totalCount
            }
          });
        }

        // Get paginated agents for this owner
        const agents = await collection.find({ owner })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSizeNum)
          .toArray();

        return c.json({
          data: agents,
          metadata: {
            currentPage: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(totalCount / pageSizeNum),
            totalCount
          }
        });
      }

      // Search agents
      if (search) {
        const result = await AgentModel.findAll({
          page: pageNum,
          limit: pageSizeNum,
          search
        });

        return c.json({
          data: result.agents,
          metadata: result.metadata
        });
      }

      // Get all agents with pagination
      const result = await AgentModel.findAll({
        page: pageNum,
        limit: pageSizeNum
      });

      return c.json({
        data: result.agents,
        metadata: result.metadata
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      return c.json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch agents' 
      }, 500);
    }
  });

  // Price Routes
  app.get('/binance-eth-price', async (c) => {
    try {
      let response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
      
      if (!response.ok) {
        console.log('Binance API failed, trying CoinGecko API');
        response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        
        if (response.ok) {
          const geckoData = await response.json();
          return c.json({ 
            success: true, 
            data: {
              symbol: 'ETH',
              price: geckoData.ethereum.usd,
              timestamp: new Date().toISOString(),
              source: 'coingecko'
            }
          });
        }
        throw new Error('All API attempts failed');
      }
      
      const data = await response.json();
      return c.json({ 
        success: true, 
        data: {
          symbol: 'ETH',
          price: parseFloat(data.price),
          timestamp: new Date().toISOString(),
          source: 'binance'
        }
      });
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return c.json({ 
        success: true, 
        data: {
          symbol: 'ETH',
          price: 2500,
          timestamp: new Date().toISOString(),
          source: 'fallback'
        },
        warning: 'Using fallback price data'
      });
    }
  });

  app.get('/sonic-price', async (c) => {
    try {
      // Fetch Sonic price from Binance API
      // The symbol for Sonic on Binance is FTMUSDT (previously FTM, now Sonic)
      let response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=FTMUSDT');
      
      // If the first attempt fails, try alternative symbols
      if (!response.ok) {
        console.log('First attempt failed, trying alternative symbol SONICUSDT');
        response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SONICUSDT');
        
        // If both attempts fail, try to get the price from CoinGecko as a fallback
        if (!response.ok) {
          console.log('Second attempt failed, trying CoinGecko API');
          response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=fantom&vs_currencies=usd');
          
          if (response.ok) {
            const geckoData = await response.json();
            return c.json({ 
              success: true, 
              data: {
                symbol: 'SONIC',
                price: geckoData.fantom.usd,
                timestamp: new Date().toISOString(),
                source: 'coingecko'
              }
            });
          } else {
            throw new Error('All API attempts failed');
          }
        }
      }
      
      const data = await response.json();
      
      return c.json({ 
        success: true, 
        data: {
          symbol: 'SONIC', // Rename to SONIC for clarity in our app
          price: parseFloat(data.price),
          timestamp: new Date().toISOString(),
          source: 'binance'
        }
      });
    } catch (error) {
      console.error('Error fetching Sonic price:', error);
      
      // Last resort fallback - return a hardcoded price from Binance website
      // This is not ideal but prevents the UI from breaking completely
      return c.json({ 
        success: true, 
        data: {
          symbol: 'SONIC',
          price: 0.57709, // Hardcoded from the Binance website as last resort
          timestamp: new Date().toISOString(),
          source: 'fallback'
        },
        warning: 'Using fallback price data'
      });
    }
  });

  // Image Generation Route
  app.post('/generate-image', async (c) => {
    try {
      const { prompt } = await c.req.json();

      if (!prompt) {
        return c.json({ error: 'Prompt is required' }, 400);
      }

      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const prediction = await replicate.predictions.create({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
          refine: "base_image_refiner",
          high_noise_frac: 0.8,
        }
      });

      if (prediction?.error) {
        return c.json({ error: prediction.error }, 500);
      }

      const result = await replicate.wait(prediction);

      if (!result?.output || !Array.isArray(result.output) || result.output.length === 0) {
        return c.json({ error: 'No image generated' }, 500);
      }

      const imageUrl = result.output[0];

      if (!imageUrl || typeof imageUrl !== 'string') {
        return c.json({ error: 'Invalid image URL received' }, 500);
      }

      return c.json({ imageUrl });
    } catch (error) {
      console.error('Error generating image:', error);
      return c.json({ error: 'Failed to generate image' }, 500);
    }
  });

  // User Routes
  app.get('/user/check', async (c) => {
    try {
      const { address } = c.req.query();

      if (!address) {
        console.warn('User check attempt without address');
        return c.json({ error: 'Wallet address is required' }, 400);
      }

      const user = await getUserByAddress(address);
      
      return c.json({ 
        exists: !!user,
        user: user || null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error checking user: ${errorMessage}`, error);
      return c.json({ 
        error: 'Failed to check user',
        message: errorMessage
      }, 500);
    }
  });

  app.post('/user/register', async (c) => {
    try {
      // Parse request body
      const body = await c.req.json().catch(() => ({}));
      const { address } = body;

      // Validate address
      if (!address) {
        console.warn('User registration attempt without address');
        return c.json(
          { error: 'Wallet address is required' },
          400
        );
      }

      // First check if user already exists to avoid duplicate logs
      const existingUser = await getUserByAddress(address);
      if (existingUser) {
        console.log(`User already exists for address: ${address}`);
        return c.json({ 
          success: true,
          user: existingUser,
          message: 'User already registered',
          isNew: false
        });
      }

      console.log(`Registering new user with address: ${address}`);
      
      // Register user if not already registered
      const user = await registerUserIfNeeded(address);
      
      console.log(`User registration successful for address: ${address}`);
      
      return c.json({ 
        success: true,
        user,
        message: 'User registered successfully',
        isNew: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error registering user: ${errorMessage}`, error);
      
      return c.json(
        { 
          success: false,
          error: 'Failed to register user',
          message: errorMessage
        },
        500
      );
    }
  });

  // Twitter Auth Routes
  app.get('/auth/callback/twitter', async (c) => {
    try {
      const { code, state } = c.req.query();
      
      if (!code || !state) {
        return c.json({ 
          error: 'Missing required OAuth parameters' 
        }, 400);
      }

      if (!context.twitterService) {
        return c.json({ 
          error: 'Twitter service is not available' 
        }, 503);
      }

      // Exchange the code for access token
      const tokens = await context.twitterService.handleCallback(code, state);
      
      if (!tokens) {
        return c.json({ 
          error: 'Failed to exchange OAuth code' 
        }, 400);
      }

      // Update agent with Twitter auth
      const agentId = state; // state parameter contains the agent ID
      const agent = await AgentModel.findById(agentId);
      
      if (!agent) {
        return c.json({ 
          error: 'Agent not found' 
        }, 404);
      }

      // Update agent with Twitter tokens
      const collection = await AgentModel.getCollection();
      const updateResult = await collection.updateOne(
        { _id: agent._id },
        { 
          $set: {
            twitterAuth: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              expiresAt: tokens.expiresAt,
              tokenType: tokens.tokenType,
              scope: tokens.scope
            }
          }
        }
      );

      if (!updateResult.modifiedCount) {
        return c.json({ 
          error: 'Failed to update agent with Twitter auth' 
        }, 500);
      }

      // Get updated agent
      const updatedAgent = await AgentModel.findById(agentId);

      return c.json({ 
        success: true,
        message: 'Twitter authentication successful',
        agent: updatedAgent
      });

    } catch (error) {
      console.error('Twitter callback error:', error);
      return c.json({ 
        error: error instanceof Error ? error.message : 'Twitter authentication failed' 
      }, 500);
    }
  });

  app.post('/token', async (c) => {
    try {
      const body = await c.req.json();

      // Validate required fields
      const requiredFields = ['name', 'address', 'owner', 'ticker', 'totalSupply', 'curveAddress'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return c.json({ error: `Missing required field: ${field}` }, 400);
        }
      }

      // Prepare the data object with required fields
      const tokenData: CreateTokenData = {
        name: body.name,
        address: body.address,
        owner: body.owner,
        ticker: body.ticker,
        totalSupply: "800000000",
        curveAddress: body.curveAddress,
        network: body.network,
        // Optional fields
        description: body.description || undefined,
        imageUrl: body.imageUrl || undefined,
        twitterUrl: body.twitterUrl || undefined,
        telegramUrl: body.telegramUrl || undefined,
        websiteUrl: body.websiteUrl || undefined,
        categories: body.categories || [],
      };

      // Create the token
      const tokenResult = await TokenModel.create(tokenData);

      // Get the created token
      const token = await TokenModel.findById(tokenResult.insertedId.toString());

      if (!token) {
        throw new Error('Failed to create token');
      }

      return c.json({ token }, 201);
    } catch (error) {
      console.error('Error creating token:', error);
      
      // Handle MongoDB errors
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          return c.json({ error: 'A token with this ticker already exists' }, 400);
        }
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  });

  app.get('/token', async (c) => {
    try {
      const { address, page = '1', pageSize = '10', search } = c.req.query();
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      console.log('Fetching tokens with params:', { address, page: pageNum, pageSize: pageSizeNum, search });

      const collection = await TokenModel.getCollection();
      
      // First check if we have any tokens at all
      const totalCount = await collection.countDocuments();
      console.log('Total tokens in database:', totalCount);

      if (totalCount === 0) {
        return c.json({
          data: [],
          metadata: {
            currentPage: 1,
            pageSize: pageSizeNum,
            totalPages: 0,
            totalCount: 0
          }
        });
      }

      if (address) {
        // Get token by address
        const token = await TokenModel.findByAddress(address);
        console.log('Found token by address:', token ? 'yes' : 'no');
        
        if (!token) {
          return c.json({ error: 'Token not found' }, 404);
        }
        
        return c.json({ 
          data: token,
          metadata: {
            currentPage: 1,
            pageSize: 1,
            totalPages: 1,
            totalCount: 1
          }
        });
      }

      if (search) {
        // Search tokens by name or ticker
        const tokens = await collection.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { ticker: { $regex: search, $options: 'i' } }
          ]
        }).sort({ createdAt: -1 }).toArray();

        console.log('Found tokens by search:', tokens.length);

        return c.json({ 
          data: tokens,
          metadata: {
            currentPage: 1,
            pageSize: tokens.length,
            totalPages: 1,
            totalCount: tokens.length
          }
        });
      }

      // Get paginated tokens
      const skip = (pageNum - 1) * pageSizeNum;
      
      // Validate pagination
      if (skip >= totalCount) {
        return c.json({
          data: [],
          metadata: {
            currentPage: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(totalCount / pageSizeNum),
            totalCount: totalCount
          }
        });
      }

      const tokens = await collection.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSizeNum)
        .toArray();

      console.log('Found paginated tokens:', tokens.length);

      return c.json({
        data: tokens,
        metadata: {
          currentPage: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(totalCount / pageSizeNum),
          totalCount: totalCount
        }
      });
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return c.json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tokens' 
      }, 500);
    }
  });

  // Transaction Routes
  app.post('/transaction', async (c) => {
    try {
      const body = await c.req.json();
      const { tokenAddress, userAddress, price, amountToken, transactionType, transactionHash, totalSupply, marketCap, network, fundingRaised, amountTokensToReceive } = body;

      if (!tokenAddress || !userAddress || !price || !amountToken || !transactionType || !transactionHash) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      const result = await createTransaction({
        from: tokenAddress,
        to: userAddress,
        amount: amountToken,
        price,
        transactionType,
        transactionHash,
        timestamp: new Date(),
        totalValue: price * amountTokensToReceive,
        supply: totalSupply,
        marketCap: marketCap,
        network: network,
        fundingRaised: fundingRaised,
        amountTokensToReceive: amountTokensToReceive
      });

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error("Error creating transaction:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  app.get('/transaction', async (c) => {
    try {
      const { tokenAddress, timeRange, latest, page = '1', limit = '10', totalVolume } = c.req.query();
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (totalVolume) {
        const allTransactions = await calculateTotalVolume(timeRange || undefined);
        return c.json({ success: true, data: allTransactions });
      }
      
      // If no specific filters are provided, return paginated transactions
      if (!tokenAddress && !timeRange && !latest) {
        const paginatedResult = await getPaginatedTransactions(pageNum, limitNum);
        return c.json({ success: true, ...paginatedResult });
      }

      // Handle existing specific queries
      if (!tokenAddress) {
        return c.json({ error: "Token address is required" }, 400);
      }

      if (latest === "true") {
        const latestTransaction = await getLatestTransaction(tokenAddress);
        return c.json({ success: true, data: latestTransaction });
      }

      const transactions = await getTransactionHistory(tokenAddress, timeRange || undefined);
      return c.json({ success: true, data: transactions });
    } catch (error) {
      console.error("Error getting transactions:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  return { app, context };
}

async function getInstance(): Promise<AppInstance> {
  if (!instance) {
    try {
      instance = await createApp();
    } catch (error) {
      logger.error("Failed to create app instance:", error);
      throw new Error("Failed to initialize application");
    }
  }
  return instance;
}

async function startServer() {
  try {
    startSpinner("server", "Starting server...");
    const { app, context } = await getInstance();

    const server = serve({
      fetch: app.fetch,
      port: PORT,
    });

    succeedSpinner("server", `Server running on port ${PORT}`);

    // Start checking for mentions only if Twitter service is available
    if (context.submissionService) {
      startSpinner("submission-monitor", "Starting submission monitoring...");
      await context.submissionService.startMentionsCheck();
      succeedSpinner("submission-monitor", "Submission monitoring started");
    }

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      startSpinner("shutdown", `Shutting down gracefully (${signal})...`);
      try {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve()));
        });

        const shutdownPromises = [];
        if (context.twitterService)
          shutdownPromises.push(context.twitterService.stop());
        if (context.submissionService)
          shutdownPromises.push(context.submissionService.stop());
        if (context.distributionService)
          shutdownPromises.push(context.distributionService.shutdown());

        await Promise.all(shutdownPromises);
        succeedSpinner("shutdown", "Shutdown complete");

        instance = null;
        process.exit(0);
      } catch (error) {
        failSpinner("shutdown", "Error during shutdown");
        logger.error("Shutdown", error);
        process.exit(1);
      }
    };

    // Handle manual shutdown (Ctrl+C)
    process.once("SIGINT", () => gracefulShutdown("SIGINT"));

    logger.info("🚀 Server is running and ready");
  } catch (error) {
    ["server", "submission-monitor"].forEach((key) => {
      failSpinner(key, `Failed during ${key}`);
    });
    logger.error("Startup", error);
    cleanup();
    process.exit(1);
  }
}

startServer();