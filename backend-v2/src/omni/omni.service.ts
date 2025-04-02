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

  private readonly systemPrompts = {
    default: `You are a friendly and knowledgeable AI assistant specializing in cryptocurrency and blockchain technology.
      - Be conversational and engaging
      - Keep responses concise but informative
      - If you don't know something, be honest about it
      - Use a friendly, helpful tone
      - Feel free to use appropriate emojis occasionally
      - Stay focused on crypto/blockchain topics when relevant`,
    getTokenPrice: `You are a cryptocurrency price analyst. Provide clear and concise price information.
      - Focus on the current price and recent changes
      - Use precise numerical values
      - Highlight significant price movements
      - Keep the tone professional and factual`,
    getWalletTokenBalancesPrices: `You are a wallet portfolio analyst. Present wallet holdings in a clear, organized format.
      - Start with a concise summary of total holdings
      - Present data in a well-formatted table
      - Highlight key metrics (balance, value, changes)
      - Keep information accurate and precise`,
    getTrendingTokens: `You are a market trend analyst. Present trending tokens in a clear, organized format.
      - List tokens with their key metrics
      - Include price, market cap, and price changes
      - Display token images using proper Markdown
      - Maintain professional presentation`,
    getWalletNFTs: `You are an NFT portfolio analyst. Summarize NFT collections clearly.
      - Focus on collection diversity
      - Highlight total NFT count
      - Group by collections when relevant
      - Present information in an organized manner`,
    getWalletNetWorth: `You are a portfolio value analyst. Present net worth information clearly.
      - Focus on total portfolio value
      - Break down by token types
      - Highlight significant holdings
      - Keep information precise and professional`,
    getDefiPositionsSummary: `You are a DeFi analyst. Present DeFi positions clearly.
      - Break down positions by protocol
      - Show total value locked
      - Highlight key metrics
      - Keep information organized and precise`,
    webSearch: `You are a web search summarizer. Analyze and summarize search results clearly.
      - Focus on the most relevant information
      - Organize information logically
      - Include key facts and data
      - Use markdown formatting for better readability
      - Cite sources when available
      - Keep summaries concise but informative`
  };

  private async createErrorStream(error: any): Promise<any> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    return openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are an error message formatter. Present the error message in a clear and helpful way."
        },
        {
          role: "user",
          content: '❌ Agent is currently experiencing issues. Please try again later.'
        }
      ],
      stream: true
    });
  }

  private async performWebSearch(query: string): Promise<any> {
    try {
      const url = new URL('https://api.search.brave.com/res/v1/web/search');
      url.searchParams.append('q', query);
      url.searchParams.append('count', '5');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Web search error:', error);
      throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
    }
  }

  async resolveAction(message: string) {
    try {
      const parsedAction = await this.actionService.parseUserInput(message);
      console.log(parsedAction);

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
              content: this.systemPrompts.default
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
      
      // Check if response indicates an error
      if (!response.success) {
        const errorStream = await this.createErrorStream(response.error);
        return {
          success: false,
          stream: true,
          streamResponse: errorStream
        };
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      let prompt = '';
      const functionName = parsedAction.function;

      // Create appropriate prompt based on action type and response
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
          const totalValue = response.result.reduce((sum, token) => sum + token.usdValue, 0).toFixed(2);
          const change24h = response.result[0].usdPrice24hrPercentChange;

          prompt = `**Summary of Total Holdings:**
• Total ETH balance: ${response.result[0].balanceFormatted} • Total value: $${totalValue} • 24-hour change: ${change24h.toFixed(2)}% format list based on the data provided. Only summarize the data, don't add any other text.`;
          break;

        case 'getTrendingTokens':
          // console.log(response);
          const marketSummary = response.result.map(coin => ({
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
            console.log(response.result);
            const chain = response.result.chains[0];
            const totalValue = (parseFloat(chain.nativeBalanceUsd) + parseFloat(chain.tokenBalanceUsd)).toFixed(2);
            
            prompt = `Summary of Total Holdings:

• Total ETH balance: ${chain.nativeBalanceFormatted}
• Total value: $${totalValue}
• 24-hour change: -0.36% 📉 only summarize the data, don't add any other text.`;
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
          const tokens = response.result.map(token => ({
            symbol: token.symbol,
            name: token.name,
            price: token.quotes.USD.price.toFixed(2),
            change24h: token.quotes.USD.percent_change_24h.toFixed(2),
            volume24h: (token.quotes.USD.volume_24h / 1e6).toFixed(2),
            marketCap: (token.quotes.USD.market_cap / 1e9).toFixed(2),
            rank: token.rank
          }));

          prompt = `Top Gainers Today:

${tokens.map((token, index) => 
`${index + 1}. ${token.name} (${token.symbol}) #${token.rank}
• Price: $${token.price}
• 24h Change: ${token.change24h}%
• Volume 24h: $${token.volume24h}
• Market Cap: $${token.marketCap}`).join('\n\n')} don't thanks for sharing or anything else, just return the data`;
          break;

        case 'webSearch':
          const searchData = response.result;
          if (!searchData || !searchData.web) {
            throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
          }

          const results = searchData.web.results.map(result => ({
            title: result.title,
            description: result.description,
            url: result.url
          }));

          prompt = `## Search Results for: "${parsedAction.query}"

${results.map((result, index) => `
### ${index + 1}. ${result.title}
${result.description}
Source: [${result.url}](${result.url})`).join('\n\n')}

Analyze and summarize these search results in a clear, concise way. Do not include any prefix like 'Summary:' - just provide the information directly.`;
          break;

        // Add more cases as needed...
        default:
          prompt = `Summarize this data in a natural way:
${JSON.stringify(response, null, 2)}`;
      }

      // Use the appropriate system prompt based on function name
      const systemPrompt = this.systemPrompts[functionName] || this.systemPrompts.default;

      // console.log(prompt);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt+"all response format markdown"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true
      });

      return {
        success: true,
        stream: true,
        streamResponse: completion
      };

    } catch (error) {
      console.error('Error executing action:', error);
      const errorStream = await this.createErrorStream(error);
      return {
        success: false,
        stream: true,
        streamResponse: errorStream
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
      const functionName = parsedAction.function;
      console.log(parsedAction);

      // Add web search case
      if (functionName === 'webSearch') {
        try {
          const searchResults = await this.performWebSearch(parsedAction.query);
          return {
            success: true,
            result: searchResults
          };
        } catch (error) {
          return {
            success: false,
            error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
          };
        }
      }

      // Execute the appropriate Moralis API call based on the action
      let selectedChain: string;
      try {
        selectedChain = this.getChainId(parsedAction.chain);
      } catch (error) {
        return {
          success: false,
          error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
        };
      }

      switch (functionName) {
        case 'getTokenPrice':
          const response = await this.priceService.getTokenPrice(parsedAction.token);
          if (!response.success) {
            return {
              success: false,
              error: new Error(response.message || 'Failed to get token price')
            };
          }
          return response;
        
        case 'getWalletTokenBalancesPrices':
          try {
            const res = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
              "chain": selectedChain,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: res.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        case 'getSolTokenPrice':
          return {
            success: false,
            error: new Error('Solana token price feature not implemented')
          };
        
        case 'getDefiPositionsSummary':
          try {
            const resDefi = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
              "chain": selectedChain,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: resDefi.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        // Wallet Analysis Functions
        case 'getWalletNFTs':
          try {
            const resNFTs = await Moralis.EvmApi.nft.getWalletNFTs({
              "chain": selectedChain,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: resNFTs.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

        case 'getWalletNetWorth':
          try {
            const resNetWorth = await Moralis.EvmApi.wallets.getWalletNetWorth({
              "excludeSpam": true,
              "excludeUnverifiedContracts": true,
              "maxTokenInactivity": 1,
              "address": parsedAction.wallet
            });
            return {
              success: true,
              result: resNetWorth.result
            };
          } catch (error) {
            return {
              success: false,
              error: error
            };
          }

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
          try {
            const resTrending = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
            const data = await resTrending.json();
            if (!data) {
              throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
            }
            return {
              success: true,
              result: data.slice(0,10)
            };
          } catch (error) {
            return {
              success: false,
              error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
            };
          }

        case 'getTopProfitableWalletPerToken':
          const resTopTraders = await Moralis.EvmApi.token.getTopProfitableWalletPerToken({
            "chain": selectedChain,
            "address": parsedAction.tokenAddress
          });
          return resTopTraders.result;

        case 'getTopGainersTokens':
          try {
            const resGainers = await fetch(`https://api.coinpaprika.com/v1/tickers`);
            const data = await resGainers.json();
            // console.log(data);
            if (!data) {
              throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
            }
            
            return {
              success: true,
              result: data.slice(0,10)
            };
          } catch (error) {
            return {
              success: false,
              error: new Error('❌ Agent is currently experiencing issues. Please try again later.')
            };
          }

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
            error: new Error(`Unsupported function: ${functionName}`)
          };
      }

    } catch (error) {
      console.error('Error executing action:', error);
      const errorStream = await this.createErrorStream(error);
      return {
        success: false,
        stream: true,
        streamResponse: errorStream
      };
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
        const step = this.actionSteps[parsedAction.function] || 'Searching for information';
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