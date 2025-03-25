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
      const response = await this.execute(parsedAction);
      return response;
    } catch (error) {
      console.error('Error executing action:', error);
      throw error;
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

        case 'getTopProfitableWalletPerToken':
          const resTopTraders = await Moralis.EvmApi.token.getTopProfitableWalletPerToken({
            "chain": selectedChain,
            "address": parsedAction.tokenAddress
          });
          return resTopTraders.result;

        case 'getTrendingTokens':
          const resTrending = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
          const trending = await resTrending.json();
          return trending.slice(0, 10);

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
            message: 'Unsupported function'
          }
      }
      
    } catch (error) {
      // console.error('Error executing action:', error);
      return {
        message: 'Error executing action',
        error: error
      }
    }
  }
} 