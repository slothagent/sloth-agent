import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import OpenAI from "openai";
import { PromptTemplate } from '@langchain/core/prompts';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ActionService } from '../action/action.service';
import { PriceService } from '../price/price.service';
import Moralis from 'moralis';

@Injectable()
export class OmniService {
  private openai: ChatOpenAI;
  private intentPrompt: PromptTemplate;
  private searchPrompt: PromptTemplate;
  private agentPrompt: PromptTemplate;
  private messageHistory: Map<string, Array<HumanMessage | AIMessage>>;

  // Add chain mapping
  private readonly chainIdMap = {
    'eth': '0x1',
    'ethereum': '0x1',
    'sepolia': '0xaa36a7',
    'holesky': '0x4268',
    'polygon': '0x89',
    'polygon_amoy': '0x13882',
    'bsc': '0x38',
    'bsc_testnet': '0x61',
    'arbitrum': '0xa4b1',
    'arbitrum_sepolia': '0x66eee',
    'base': '0x2105',
    'base_sepolia': '0x14a34',
    'optimism': '0xa',
    'optimism_sepolia': '0xaa37dc',
    'linea': '0xe708',
    'linea_sepolia': '0xe705',
    'avalanche': '0xa86a',
    'fantom': '0xfa',
    'fantom_testnet': '0xfa2',
    'cronos': '0x19',
    'gnosis': '0x64',
    'gnosis_testnet': '0x27d8'
  };

  private getChainId(chain: string): string {
    const chainLower = chain.toLowerCase();
    const chainId = this.chainIdMap[chainLower];
    if (!chainId) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    return chainId;
  }

  private getDefaultDates(): { fromDate: string; toDate: string } {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    return {
      fromDate: fromDate.toISOString().split('.')[0] + '.000',
      toDate: toDate.toISOString().split('.')[0] + '.000'
    };
  }

  constructor(
    private actionService: ActionService,
    private priceService: PriceService
  ) {
    // Initialize Moralis
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY
    });

    this.messageHistory = new Map();

    this.intentPrompt = PromptTemplate.fromTemplate(`
      Analyze if the following message is about creating/deploying/minting a new token or cryptocurrency.
      Consider various ways users might express this intent, including natural language requests.

      Message: {message}

      Respond with only "true" or "false".
      Consider it true if the message:
      1. Directly mentions token/coin creation:
         - Creating/deploying/minting/launching a token/coin
         - Making/generating a new token/coin
         - Starting/initiating a token/coin
         - Setting up a token/coin
      
      2. Uses natural language patterns like:
         - "I want a token named/called X"
         - "Can you create a token that..."
         - "Help me with a token..."
         - "I need a token for..."
         - "Make a token with..."

      3. Provides token details without explicit creation words:
         - "Token name X with description Y"
         - "A community token called X"
         - "Token X for my project"

      Examples that should return true:
      - "I want to make a new coin"
      - "Can you help me create a token?"
      - "Token name X with description Y"
      - "Create a token named TokenX with description This is a community token"
      - "I need a token for my community"
      - "Help me launch a new cryptocurrency"

      Examples that should return false:
      - "What's the price of Bitcoin?"
      - "How do I buy tokens?"
      - "Tell me about tokens"
      - "What is a token?"
      - "Show me my tokens"
      - "Token balance"

      Response (true/false):
    `);

    this.searchPrompt = PromptTemplate.fromTemplate(`
      Search for information about: {query}
      
      Please provide:
      1. Relevant and accurate information
      2. Sources if available
      3. Context about the search results
      4. Any additional related information that might be helpful

      Use web search to find the most up-to-date information.
    `);
  }

  async checkIntent(message: string): Promise<boolean> {
    try {
      const formattedPrompt = await this.intentPrompt.format({
        message,
      });
      
      const response = await this.openai.invoke([
        new SystemMessage(formattedPrompt),
        new HumanMessage(message)
      ]);

      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);

      return content.toLowerCase() === 'true';
    } catch (error) {
      console.error('Error checking intent:', error);
      throw error;
    }
  }

  async resolveAction(message: string) {
    try {
      // Parse user input to determine action
      const parsedAction = await this.actionService.parseUserInput(message);
      console.log(parsedAction);
      // If no function is parsed, use AI to generate a human-like response
      if (!parsedAction || !parsedAction.function) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `You are a friendly and knowledgeable AI assistant specializing in cryptocurrency and blockchain technology.
              - Be conversational and engaging
              - Keep responses concise but informative
              - If you don't know something, be honest about it
              - Use a friendly, helpful tone
              - Feel free to use appropriate emojis occasionally
              - Stay focused on crypto/blockchain topics when relevant`
            },
            {
              role: "user",
              content: message
            }
          ],
          stream: true
        });

        return {
          success: true,
          stream: true,
          streamResponse: stream
        };
      }

      const response = await this.execute(parsedAction);

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create appropriate prompt based on action type and response
      let prompt = '';
      const functionName = parsedAction.function;

      switch (functionName) {
        case 'getTokenPrice':
          if (response.success) {
            prompt = `Given this token price data:
Token: ${response.data.symbol}
Price: $${response.data.price}

Provide a natural one-sentence summary of the current price.`;
          }
          break;

        case 'getWalletTokenBalancesPrices':
          if (response.result) {
            prompt = `Given these wallet token balances:
${response.result.map(token => `${token.token.name || token.token.symbol}: ${token.value}`).join('\n')}

Provide a natural one-sentence summary of the wallet's holdings.`;
          }
          break;

        case 'getTrendingTokens':
          const marketSummary = response.slice(0, 10).map(coin => ({
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            price: coin.current_price,
            market_cap: coin.market_cap,
            market_cap_change_24h: coin.market_cap_change_24h,
            change_24h: coin.price_change_percentage_24h
          }));

          prompt = `Here are the current trending tokens with their details:
${marketSummary.map((coin, index) => `
${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})
   - Price: $${coin.price.toLocaleString()}
   - Market Cap: $${(coin.market_cap / 1e9).toFixed(2)} billion
   - 24h Price Change: ${coin.change_24h.toFixed(2)}%
   - 24h Volume: $${(coin.volume / 1e9).toFixed(2)} billion
   ![${coin.name}](${coin.image})`).join('\n')}

Please format this information into a clear, readable list. Include all the details for each token, and make sure to display the image using Markdown image syntax: ![TokenName](ImageURL). Use the exact numbers and image URLs provided.`;
          break;

        case 'getWalletNFTs':
          if (response.result) {
            prompt = `Analyze this NFT collection data:
Total NFTs: ${response.result.length}
Collections: ${[...new Set(response.result.map(nft => nft.name))].join(', ')}

Provide a brief summary of the wallet's NFT holdings.`;
          }
          break;

        case 'getWalletNetWorth':
          if (response.result) {
            prompt = `Given this wallet net worth data:
Total Value: $${response.result.total_usd?.toFixed(2)}
Total Tokens: ${response.result.tokens?.length}

Provide a brief summary of the wallet's total value.`;
          }
          break;

        case 'getDefiPositionsSummary':
          if (response.result) {
            prompt = `Analyze these DeFi positions:
${response.result.map(pos => `${pos.protocol_name}: $${pos.total_value_usd}`).join('\n')}

Provide a brief summary of the DeFi positions.`;
          }
          break;

        case 'getTokenHolderStats':
          if (response.holders) {
            prompt = `Given these token holder statistics:
Total Holders: ${response.holders.length}
Top Holders: ${response.holders.slice(0, 5).map(h => `${h.address}: ${h.balance}`).join('\n')}

Provide a brief summary of the token holder distribution.`;
          }
          break;

        case 'getTopGainersTokens':
          if (response.tokens) {
            prompt = `Analyze these top gaining tokens:
${response.tokens.map(token => 
  `${token.name}: ${token.price_change_24h}% (24h)`
).join('\n')}

Provide a brief summary of the top gaining tokens.`;
          }
          break;

        // Add more cases as needed...
        default:
          prompt = `Summarize this data in a natural way:
${JSON.stringify(response, null, 2)}`;
      }

      // Get natural language summary from OpenAI with streaming
      if (prompt) {
        const stream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "You are a cryptocurrency analyst. Provide a concise summary of trending tokens in a clear, list-based format. Make sure to include all provided information and display images using Markdown syntax. Format the output as follows:\n\nHere are the currently trending tokens:\n1. [Token Name] ([Symbol])\n   - Price: $[Price]\n   - Market Cap: $[Market Cap]\n   - 24h Price Change: [Change]%\n   - ![TokenName](ImageURL)"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          stream: true // Enable streaming
        });

        // Return stream response
        return {
          success: true,
          stream: true,
          streamResponse: stream
        };
      }

      // If no prompt was generated, return original response in standardized format
      return {
        success: true,
        stream: false,
        message: "Operation completed successfully",
        data: response
      };

    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        message: 'Error executing action',
        data: null,
        error: error
      };
    }
  }

  async search(query: string) {
    try {
      const formattedPrompt = await this.searchPrompt.format({
        query,
      });
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.responses.create({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }],
        input: formattedPrompt,
    });

      return {
        success: true,
        query,
        results: response,
      };
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  async chat(userId: string, message: string) {
    try {
      // Get or initialize conversation history
      let history = this.messageHistory.get(userId) || [];
      
      // Add user message to history
      const userMessage = new HumanMessage(message);
      history.push(userMessage);

      // Format prompt with context
      const context = history
        .map(msg => `${msg._getType()}: ${msg.content}`)
        .join('\n');

      const formattedPrompt = await this.agentPrompt.format({
        context,
        query: message,
      });

      // Get AI response
      const response = await this.openai.invoke([
        new SystemMessage(formattedPrompt),
        ...history
      ]);

      // Convert response content to string if it's not already
      const responseContent = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);

      // Add AI response to history
      const aiMessage = new AIMessage({ content: responseContent });
      history.push(aiMessage);

      // Limit history to last 10 messages
      if (history.length > 10) {
        history = history.slice(-10);
      }

      // Update conversation history
      this.messageHistory.set(userId, history);

      return {
        success: true,
        message: responseContent,
        history: history.map(msg => ({
          role: msg._getType(),
          content: msg.content
        }))
      };
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async clearChat(userId: string) {
    this.messageHistory.delete(userId);
    return {
      success: true,
      message: 'Chat history cleared'
    };
  }

  fetchOptions() {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY
      },
    }
    return options;
  }

  async execute(parsedAction: any) {
    try {
      // Execute the appropriate Moralis API call based on the action
      const functionName = parsedAction.function;
      console.log(parsedAction);
      const selectedChain = this.getChainId(parsedAction.chain);

      switch (functionName) {
        case 'getTokenPrice':
          const response = await this.priceService.getTokenPrice(parsedAction.token);
          return response;
        
        case 'getWalletTokenBalancesPrices':
          const res = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
            "chain": selectedChain,
            "address": parsedAction.wallet
          });
          return res.result;

        case 'getSolTokenPrice':
          return null;
        
        case 'getDefiPositionsSummary':
          const resDefi = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
            "chain": selectedChain,
            "address": parsedAction.wallet
          });
          return resDefi.result;

        // Wallet Analysis Functions
        case 'getWalletNFTs':
          const resNFTs = await Moralis.EvmApi.nft.getWalletNFTs({
            "chain": selectedChain,
            "address": parsedAction.wallet
          });
          return resNFTs.result;

        case 'getWalletNetWorth':
          const resNetWorth = await Moralis.EvmApi.wallets.getWalletNetWorth({
            "excludeSpam": true,
            "excludeUnverifiedContracts": true,
            "maxTokenInactivity": 1,
            "address": parsedAction.wallet
          });
          return resNetWorth.result;

        case 'getWalletProfitabilitySummary':
          const resProfitability = await Moralis.EvmApi.wallets.getWalletProfitabilitySummary({
            "chain": selectedChain,
            "address": parsedAction.wallet
          });
          return resProfitability.result;

        case 'getSwapsByWalletAddress':
          const resSwaps = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${parsedAction.wallet}/swaps?chain=${selectedChain}&order=DESC`, this.fetchOptions());
          return resSwaps.json();

        case 'resolveAddressToDomain':
          const resDomain = await fetch(`https://deep-index.moralis.io/api/v2.2/resolve/${parsedAction.wallet}/domain`, this.fetchOptions());
          return resDomain.json();

        case 'resolveENSDomain':
          const resENS = await Moralis.EvmApi.resolve.resolveENSDomain({
            "domain": parsedAction.domain
          });
          return resENS.result;

        // Token Analysis Functions
        case 'getTokenHolderStats':
          const resHolderStats = await fetch(`https://deep-index.moralis.io/api/v2.2/erc20/${parsedAction.tokenAddress}/holders?chain=${selectedChain}`, this.fetchOptions());
          return resHolderStats.json();

        case 'getHistoricalTokenHolders':
          const dates = this.getDefaultDates();
          const resHistoricalHolders = await fetch(
            `https://deep-index.moralis.io/api/v2.2/erc20/${parsedAction.tokenAddress}/holders/historical?chain=${selectedChain}&fromDate=${parsedAction.fromDate || dates.fromDate}&toDate=${parsedAction.toDate || dates.toDate}&timeFrame=1d`, 
            this.fetchOptions()
          );
          return resHistoricalHolders.json();

        case 'getTrendingTokens':
          const resTrending = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
          return resTrending.json();

        case 'getTopProfitableWalletPerToken':
          const resTopTraders = await Moralis.EvmApi.token.getTopProfitableWalletPerToken({
            "chain": selectedChain,
            "address": parsedAction.tokenAddress
          });
          return resTopTraders.result;

        case 'getTopGainersTokens':
          const resGainers = await fetch(`https://deep-index.moralis.io/api/v2.2/discovery/tokens/top-gainers?chain=${selectedChain}&time_frame=1d`, this.fetchOptions());
          return resGainers.json();

        case 'getTokenAnalytics':
          const resAnalytics = await fetch(`https://deep-index.moralis.io/api/v2.2/tokens/${parsedAction.tokenAddress}/analytics?chain=${selectedChain}`, this.fetchOptions());
          return resAnalytics.json();

        case 'getTokenStats':
          const resStats = await Moralis.EvmApi.token.getTokenStats({
            "chain": selectedChain,
            "address": parsedAction.tokenAddress
          });
          return resStats.result;

        case 'getPairCandlesticks':
          const candleDates = this.getDefaultDates();
          const resCandles = await fetch(
            `https://deep-index.moralis.io/api/v2.2/pairs/${parsedAction.pairAddress}/ohlcv?chain=${selectedChain}&timeframe=${parsedAction.interval || '1h'}&currency=usd&fromDate=${parsedAction.fromDate || candleDates.fromDate}&toDate=${parsedAction.toDate || candleDates.toDate}`, 
            this.fetchOptions()
          );
          return resCandles.json();

        case 'getTopERC20TokensByMarketCap':
          const resTopTokens = await Moralis.EvmApi.marketData.getTopERC20TokensByMarketCap();
          return resTopTokens.result;

        case 'searchTokens':
          const resSearch = await fetch(`https://deep-index.moralis.io/api/v2.2/tokens/search?query=${parsedAction.query}&chains=${selectedChain}`, this.fetchOptions());
          return resSearch.json();

        default:
          return {
            success: false,
            message: 'Unsupported function',
            data: null
          }
      }

    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        message: 'Error executing action',
        data: null,
        error: error
      }
    }
  }

  private readonly actionSteps = {
    'getTrendingTokens': 'Getting trending tokens',
    'getTokenPrice': 'Fetching token price',
    'getWalletTokenBalancesPrices': 'Getting wallet token balances',
    'getWalletNFTs': 'Fetching wallet NFTs',
    'getWalletNetWorth': 'Calculating wallet net worth',
    'getDefiPositionsSummary': 'Analyzing DeFi positions',
    'getTokenHolderStats': 'Getting token holder statistics',
    'getTopGainersTokens': 'Finding top gaining tokens',
    'getSwapsByWalletAddress': 'Fetching wallet swap history',
    'resolveAddressToDomain': 'Resolving address to domain',
    'resolveENSDomain': 'Resolving ENS domain',
    'getHistoricalTokenHolders': 'Getting historical token holders',
    'getTopProfitableWalletPerToken': 'Finding top traders for token',
    'getTokenAnalytics': 'Analyzing token metrics',
    'getTokenStats': 'Getting token statistics',
    'getPairCandlesticks': 'Fetching token price history',
    'getTopERC20TokensByMarketCap': 'Getting top tokens by market cap',
    'searchTokens': 'Searching for tokens'
  };

  private readonly commonQuestionSteps = {
    greetings: {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      steps: ['Initializing conversation', 'Preparing personalized greeting']
    },
    help: {
      patterns: ['help', 'what can you do', 'how can you help', 'capabilities', 'features'],
      steps: ['Analyzing available features', 'Preparing capability summary', 'Generating help information']
    },
    crypto_info: {
      patterns: ['what is crypto', 'explain cryptocurrency', 'how does blockchain work', 'what is bitcoin'],
      steps: ['Gathering educational resources', 'Preparing simplified explanation', 'Compiling relevant examples']
    },
    market_overview: {
      patterns: ['how is the market', 'market overview', 'crypto market status', 'market condition'],
      steps: ['Analyzing market data', 'Gathering trend information', 'Preparing market summary']
    },
    investment_advice: {
      patterns: ['should i invest', 'investment strategy', 'portfolio advice', 'how to invest'],
      steps: ['Analyzing query context', 'Preparing educational information', 'Gathering general guidelines']
    },
    security: {
      patterns: ['how to secure', 'wallet security', 'protect crypto', 'security tips'],
      steps: ['Analyzing security context', 'Gathering best practices', 'Preparing security recommendations']
    }
  };

  private identifyCommonQuestion(message: string): { type: string; steps: string[] } | null {
    const normalizedMessage = message.toLowerCase();
    
    for (const [type, data] of Object.entries(this.commonQuestionSteps)) {
      if (data.patterns.some(pattern => normalizedMessage.includes(pattern))) {
        return { type, steps: data.steps };
      }
    }
    
    // Default steps for unrecognized questions
    return {
      type: 'general',
      steps: [
        'Understanding your question',
        'Analyzing available information',
        'Preparing comprehensive response'
      ]
    };
  }

  async checkAction(message: string) {
    try {
      // Use actionService to parse the action
      const parsedAction = await this.actionService.parseUserInput(message);

      if (parsedAction && parsedAction.function) {
        const step = this.actionSteps[parsedAction.function] || 'Processing request';
        return {
          success: true,
          step: step
        };
      }

      // Handle common questions if no specific action is found
      const commonQuestion = this.identifyCommonQuestion(message);
      return {
        success: true,
        step: commonQuestion.steps[0]
      };

    } catch (error) {
      console.error('Error checking action:', error);
      return {
        success: false,
        message: 'Error checking action',
        error: error
      };
    }
  }
} 