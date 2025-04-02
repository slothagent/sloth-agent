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
      2. If no chain is explicitly mentioned:
         - For EVM addresses (0x...) -> default to "eth"
         - For Solana addresses -> use "sol"
         - For general queries without addresses -> default to "eth"

      Primary function mapping (check these first):
      - "what's in my wallet" -> ALWAYS "getWalletTokenBalancesPrices" (EVM) or "getSolTokenBalances" (Solana)
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
         - Token approvals -> "getWalletApprovals"
         - Swap history -> "getSwapsByWalletAddress"
         - Active chains -> "getWalletActiveChains"
         - Address to ENS -> "resolveAddressToDomain"
         - ENS to Address -> "resolveENSDomain"

      2. Solana Wallet Analysis:
         - Token balances -> "getSolTokenBalances"
         - NFT holdings -> "getSolNFTs"
         - Portfolio summary -> "getSolPortfolio"
         - Native balance -> "getSolBalance"
         - Token transfers -> "getSolTokenTransfers"
         - NFT transfers -> "getSolNFTTransfers"
         - Domain resolution -> "getSolDomainResolution"

      3. Token Market Data:
         - Token price -> "getTokenPrice" (EVM) or "getSolTokenPrice" (Solana)
         - Holder stats -> "getTokenHolderStats"
         - Holder history -> "getHistoricalTokenHolders"
         - Top traders -> "getTopProfitableWalletPerToken"
         - Trending tokens -> "getTrendingTokens" (EVM) or "getSolTrendingTokens" (Solana)
         - Top gainers -> "getTopGainersTokens"
         - Token analytics -> "getTokenAnalytics"
         - Token stats -> "getTokenStats"
         - Trading pairs -> "getTokenPairs"
         - Market cap ranking -> "getTopERC20TokensByMarketCap"
         - Token search -> "searchTokens"
         - Token filters -> "getFilteredTokens"

      4. DeFi & Market Analysis:
         - DEX rankings -> "getVolumeStatsByCategory"
         - Pool liquidity -> "getPairReserves"
         - Trading pairs -> "getTokenPairs"
         - Protocol summary -> "getDefiSummary"
         - Cross-chain volume -> "getVolumeStatsByChain"
         - Volume history -> "getTimeSeriesVolumeByCategory"
         - Category comparison -> "getVolumeStatsByCategory"
         - Volume trends -> "getTimeSeriesVolume"

      5. Cross-Chain Analysis:
         - Portfolio overview -> "getWalletNetWorth" (EVM) + "getSolPortfolio" (Solana)
         - NFT collection -> "getWalletNFTs" (EVM) + "getSolNFTs" (Solana)
         - Token holdings -> "getWalletTokenBalancesPrices" (EVM) + "getSolTokenBalances" (Solana)
         - Native balances -> "getNativeBalance" (EVM) + "getSolBalance" (Solana)
         - Trading activity -> "getSwapsByWalletAddress" (EVM) + "getSolTokenTransfers" (Solana)

      Example inputs and expected outputs (in JSON format):
      Input: "What's in my wallet 0x742d..."
      Output: function=getWalletTokenBalancesPrices, wallet=0x742d..., chain=eth

      Input: "What NFTs do I own on Solana?"
      Output: function=getSolNFTs, wallet=sol_address

      Input: "Show my portfolio across chains"
      Output: function=crossChainPortfolio, wallets=[evm:0x..., solana:sol_address]

      Input: "What's the price of SOL"
      Output: function=getSolTokenPrice, token=SOL

      Input: "Show liquidity for ETH/USDC pair on polygon"
      Output: function=getPairReserves, pair=ETH/USDC, chain=polygon

      Input: "How many people hold $CGPT?"
      Output: function=getTokenHolderStats, token=CGPT, chain=eth

      Input: "Compare volume of AI vs Gaming tokens"
      Output: function=getVolumeStatsByCategory, categories=[AI,Gaming], chain=eth

      Important: 
      1. Check primary functions first - they have highest priority
      2. Use chain-specific functions based on address format
      3. Use exact Moralis API function names
      4. For token/pair analysis, ALWAYS extract the token symbols
      5. For time series data, extract the timeframe if specified
      6. For cross-chain queries, try to get data from both EVM and Solana
      7. Always include "chain" parameter in response for EVM functions, defaulting to "eth" if not specified
      8. Use abbreviated chain names: eth, polygon, bsc, avalanche, arbitrum, optimism, sol

      Return your response in this exact JSON format:
      For EVM wallet queries:
      function: <moralis_function>
      wallet: <evm_address>
      chain: <chain_symbol>

      For Solana wallet queries:
      function: <moralis_function>
      wallet: <solana_address>

      For cross-chain queries:
      function: crossChainPortfolio
      wallets:
        evm: <evm_address>
        solana: <solana_address>

      For token queries:
      function: <moralis_function>
      token: <token>
      chain: <chain_symbol>

      For pair queries:
      function: <moralis_function>
      pair: <token1>/<token2>
      chain: <chain_symbol>

      For category queries:
      function: <moralis_function>
      category: <category>
      chain: <chain_symbol>

      For comparison queries:
      function: <moralis_function>
      categories: [<category1>, <category2>]
      chain: <chain_symbol>

      For time series:
      function: <moralis_function>
      category: <category>
      timeframe: <timeframe>
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