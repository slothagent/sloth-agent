import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { LRUCache } from 'lru-cache';

@Injectable()
export class ActionService {
  private model: ChatOpenAI;
  private promptTemplate: PromptTemplate;
  private outputParser: JsonOutputParser;
  private cache: LRUCache<string, any>;

  constructor() {
    // Initialize the OpenAI model with faster GPT-3.5
    this.model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      maxTokens: 150, // Limit response length
      cache: true, // Enable LangChain's built-in caching
    });

    // Initialize cache with 1 hour TTL
    this.cache = new LRUCache({
      max: 500, // Store up to 500 items
      ttl: 1000 * 60 * 60, // Items expire after 1 hour
    });

    // Create a more specific prompt template
    this.promptTemplate = PromptTemplate.fromTemplate(
      `Given the input: "{input}", identify the blockchain context and extract the appropriate Moralis API function name and parameters.

      Chain Detection Rules:
      1. Look for explicit chain mentions:
         - ETH/ETHEREUM -> eth
         - MATIC/POLYGON -> polygon
         - BNB/BSC -> bsc
         - AVAX/AVALANCHE -> avalanche
         - ARB/ARBITRUM -> arbitrum
         - OP/OPTIMISM -> optimism
         - SOL/SOLANA -> sol
         - SUI -> sui
      2. If no chain is explicitly mentioned:
         - For EVM addresses (0x...) -> default to "eth"
         - For Solana addresses -> use "sol"
         - For Sui addresses (0x...) -> use "sui"
         - For general queries without addresses -> default to "eth"

      Primary function mapping (check these first):
      - "what's in my wallet" -> ALWAYS "getWalletTokenBalancesPrices" (EVM) or "getSolTokenBalances" (Solana) or "sui_getAllBalances" (Sui)
      - "what nfts" or "show nfts" -> "getWalletNFTs" (EVM) or "getSolNFTs" (Solana)
      - "show defi positions" -> "getDefiPositionsSummary"
      - "what is my net worth" -> "getWalletNetWorth" (EVM) or "getSolPortfolio" (Solana)
      - "generate pnl" or "profit loss" -> "getWalletProfitabilitySummary"
      - "search" or "find information" or "tell me about" -> "webSearch"

      Web Search Detection:
      - Look for keywords like "search", "find", "tell me about", "what is", "how to"
      - If the query doesn't match any blockchain-specific functions, treat it as a web search
      - For web searches, extract the search query and return it in the response

      Blockchain-specific functions:
      1. EVM Wallet Analysis:
         - Token balances -> "getWalletTokenBalancesPrices"
         - NFT holdings -> "getWalletNFTs"
         - DeFi positions -> "getDefiPositionsSummary"
         - Portfolio value -> "getWalletNetWorth"
         - PnL summary -> "getWalletProfitabilitySummary"

      2. Token Market Data:
         - Token price -> "getTokenPrice" (EVM) or "getSolTokenPrice" (Solana)
         - Holder stats -> "getTokenHolderStats"
         - Top traders -> "getTopProfitableWalletPerToken"
         - Trending tokens -> "getTrendingTokens"
         - Top gainers -> "getTopGainersTokens"
         - Token analytics -> "getTokenAnalytics"
         - Token stats -> "getTokenStats"
         - Market cap ranking -> "getTopERC20TokensByMarketCap"
         - Token search -> "searchTokens"

      3. Sui Wallet Analysis:
         - Get all balances -> "sui_getAllBalances"
         - Get all coins -> "sui_getAllCoins"
         - Get specific balance (with coin type) -> "sui_getBalance"
         - Get coin metadata -> "sui_getCoinMetadata"
         - Get specific coins -> "sui_getCoins"
         - Get total supply -> "sui_getTotalSupply"
         - Get stakes -> "sui_getStakes"
         - Get validators APY -> "sui_getValidatorsApy"
         - Get paginated coins -> "sui_getCoinsWithPagination"
         - Get coin balance -> "sui_getCoinBalance"

      Example inputs and expected outputs (in JSON format):
      Input: "What's in my wallet 0x742d..."
      Output: function=getWalletTokenBalancesPrices, wallet=0x742d..., chain=eth

      Input: "What NFTs do I own on Solana?"
      Output: function=getSolNFTs, wallet=sol_address

      Input: "Show my Sui wallet balance"
      Output: function=sui_getAllBalances, wallet=sui_address

      Input: "What's my staking info on Sui?"
      Output: function=sui_getStakes, wallet=sui_address

      Input: "What's the validator APY on Sui?"
      Output: function=sui_getValidatorsApy

      Important: 
      1. Check primary functions first - they have highest priority
      2. Use chain-specific functions based on address format
      3. Use exact API function names
      4. For token/pair analysis, ALWAYS extract the token symbols
      5. For Sui functions, validate address format and coin types
      6. Always include chain parameter for appropriate functions
      7. Use abbreviated chain names: eth, polygon, bsc, avalanche, arbitrum, optimism, sol, sui

      Return your response in this exact JSON format:
      For EVM wallet queries:
      function: <moralis_function>
      wallet: <evm_address>
      chain: <chain_symbol>

      For Solana wallet queries:
      function: <moralis_function>
      wallet: <solana_address>

      For Sui wallet queries:
      function: <sui_function>
      wallet: <sui_address>
      coinType: <coin_type> (optional)
      cursor: <cursor> (optional)
      limit: <limit> (optional)
      page: <page> (optional)
      size: <size> (optional)

      For token queries:
      function: <moralis_function>
      token: <token>
      chain: <chain_symbol>

      For web search:
      function: webSearch
      query: <search_query>

      For invalid input:
      error: Unsupported function
      `
    );

    // Initialize JSON output parser with strict validation
    this.outputParser = new JsonOutputParser();
  }

  async parseUserInput(userInput: string) {
    try {
      // Check if it's a conversational query
      const conversationalPatterns = [
        /^hi+\s*$/i,
        /^hello+\s*$/i,
        /^hey+\s*$/i,
        /^how are you/i,
        /^can you help/i,
        /^what can you do/i,
        /^help me/i,
        /^who are you/i,
        /^what are you/i,
        /^tell me about yourself/i
      ];

      // If input matches any conversational pattern, return null
      if (conversationalPatterns.some(pattern => pattern.test(userInput.trim()))) {
        return null;
      }

      // Check cache first
      const cacheKey = userInput.toLowerCase().trim();
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Create the chain
      const chain = this.promptTemplate
        .pipe(this.model)
        .pipe(this.outputParser);

      // Run the chain
      const result = await chain.invoke({
        input: userInput,
      });

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error parsing user input:', error);
      return { error: 'Failed to process input' };
    }
  }
} 