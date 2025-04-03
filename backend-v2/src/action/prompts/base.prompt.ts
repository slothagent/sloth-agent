export const BASE_PROMPT = `Chain Detection Rules:
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
     - Get all token balances -> "sui_getAllBalances"
     - Get specific token balance (when token type is mentioned) -> "sui_getBalance"
     - Get all coins -> "sui_getAllCoins"
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

  Input: "Get balance of SUI token in my Sui wallet"
  Output: function=sui_getBalance, wallet=sui_address, coinType=0x2::sui::SUI

  Input: "What's my staking info on Sui?"
  Output: function=sui_getStakes, wallet=sui_address

  Input: "What's the validator APY on Sui?"
  Output: function=sui_getValidatorsApy

  Important: 
  1. Check primary functions first - they have highest priority
  2. Use chain-specific functions based on address format
  3. Use exact API function names
  4. For token/pair analysis, ALWAYS extract the token symbols
  5. For Sui functions:
     - Use sui_getBalance when a specific token/coin type is mentioned
     - Use sui_getAllBalances for general balance queries
     - Validate address format and coin types
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
  coinType: <coin_type> (required for sui_getBalance)
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
  error: Unsupported function`; 