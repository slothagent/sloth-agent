import Moralis from 'moralis';

const chainIdMap = {
  'eth': '0x1',
  'ethereum': '0x1',
  'polygon': '0x89',
  'bsc': '0x38',
  'arbitrum': '0xa4b1',
  'base': '0x2105',
  'optimism': '0xa',
  'linea': '0xe708',
  'avalanche': '0xa86a',
  'fantom': '0xfa',
  'cronos': '0x19',
  'gnosis': '0x64',
};


const webSearchTool = async (query: string): Promise<any> => {
  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.append('q', query);
    url.searchParams.append('count', '10');

    const headers = {
      'Accept': 'application/json',
      'X-Subscription-Token': process.env.BRAVE_API_KEY || ''
    };

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      return '❌ Agent is currently experiencing issues. Please try again later.';
    }

    const data = await response.json();
    // Format web search results
    const formattedResults = data.web?.results
      .map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        description: result.description || '',
        familyFriendly: result.family_friendly || true
      }))
      .filter((result: any, index: number, self: any[]) => 
        // Remove duplicate results based on URLs
        index === self.findIndex((t) => t.url === result.url)
      );

    return formattedResults;

  } catch (error) {
    console.error('Web search error:', error);
    return '❌ Agent is currently experiencing issues. Please try again later.';
  }
}

const getTrendingTokens = async (): Promise<any> => {
  try {
    const resTrending = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
    const data = await resTrending.json();
    if (!data) {
      return '❌ Agent is currently experiencing issues. Please try again later.';
    }
    return data.slice(0,5);
  } catch (error) {
    return error;
  }
}

const getWalletTokenBalancesPrices = async (chain: string, wallet: string): Promise<any> => {
  try {
    const res = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: chainIdMap[chain],
      address: wallet,
      limit: 5
    });
    return res.result.slice(0,5);
  } catch (error) {
    return error;
  }
}


const getWalletNFTs = async (chain: string, wallet: string): Promise<any> => {
  try {
    const resNFTs = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: chainIdMap[chain],
      address: wallet,
      format: "decimal",
      limit: 5,
      mediaItems: false,
    });
    return resNFTs.result;
  } catch (error) {
    return error;
  }
}

const getWalletNetWorth = async (wallet: string): Promise<any> => {
  try {
    const resNetWorth = await Moralis.EvmApi.wallets.getWalletNetWorth({
      excludeSpam: true,
      excludeUnverifiedContracts: true,
      maxTokenInactivity: 1,
      address: wallet
    });
    return resNetWorth.result;
  } catch (error) {
    return error;
  }
}

const getWalletProfitabilitySummary = async (chain: string, wallet: string): Promise<any> => {
  try {
    const resProfitability = await Moralis.EvmApi.wallets.getWalletProfitabilitySummary({
      chain: chainIdMap[chain],
      address: wallet
    });
    return resProfitability.result;
  } catch (error) {
    return error;
  }
}

const getTokenHolderStats = async (chain: string, tokenAddress: string): Promise<any> => {
  try {
    const resHolderStats = await fetch(
      `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/holders?chain=${chain}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': process.env.MORALIS_API_KEY || ''
        }
      }
    );
    if (!resHolderStats.ok) {
      return '❌ Agent is currently experiencing issues. Please try again later.';
    }
    const data = await resHolderStats.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error
    };
  }
}

const getTopGainersTokens = async (): Promise<any> => {
  try {
    const resGainers = await fetch(`https://api.coinpaprika.com/v1/tickers`);
    const data = await resGainers.json();
    if (!data) {
      return '❌ Agent is currently experiencing issues. Please try again later.';
    }
    return data.slice(0,10);
  } catch (error) {
    return error;
  }
}

const getTokenAnalytics = async (chain: string, tokenAddress: string): Promise<any> => {
  try {
    const resAnalytics = await fetch(
      `https://deep-index.moralis.io/api/v2.2/tokens/${tokenAddress}/analytics?chain=${chain}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': process.env.MORALIS_API_KEY || ''
        }
      }
    );
    if (!resAnalytics.ok) {
      return '❌ Agent is currently experiencing issues. Please try again later.';
    }
    const data = await resAnalytics.json();
    return data;
  } catch (error) {
    return error;
  }
}

const suiGetAllBalances = async (suiService: any, wallet: string): Promise<any> => {
  try {
    const balances = await suiService.getAllBalances(wallet);
    const balancesWithMetadata = await Promise.all(
      balances.slice(0, 5).map(async (balance: any) => {
        const metadata = await suiService.getCoinMetadata(balance.coinType);
        return {
          coinType: balance.coinType,
          totalBalance: balance.totalBalance,
          metadata: metadata
        };
      })
    );

    return {
      balancesWithMetadata,
      totalToken: balances.length,
      urlPortfolio: `https://suiscan.xyz/mainnet/account/${wallet}/portfolio`
    };
  } catch (error) {
    return error;
  }
}

const suiGetAllCoins = async (suiService: any, wallet: string, cursor?: string, limit = 10): Promise<any> => {
  try {
    const coins = await suiService.getAllCoins(wallet, cursor, limit);
    return {
      result: coins.data,
      urlPortfolio: `https://suiscan.xyz/mainnet/account/${wallet}/portfolio`
    };
  } catch (error) {
    return error;
  }
}

const suiGetBalance = async (suiService: any, wallet: string, coinType: string): Promise<any> => {
  try {
    const balance = await suiService.getBalance(wallet, coinType);
    return {
      result: balance,
      urlPortfolio: `https://suiscan.xyz/mainnet/account/${wallet}/portfolio`
    };
  } catch (error) {
    return error;
  }
}

const suiGetCoinMetadata = async (suiService: any, coinType: string): Promise<any> => {
  try {
    const metadata = await suiService.getCoinMetadata(coinType);
    return metadata;
  } catch (error) {
    return error;
  }
}

const suiGetCoins = async (suiService: any, wallet: string, coinType: string, cursor?: string, limit?: number): Promise<any> => {
  try {
    const specificCoins = await suiService.getCoins(wallet, coinType, cursor, limit);
    return specificCoins;
  } catch (error) {
    return error;
  }
}

const suiGetTotalSupply = async (suiService: any, coinType: string): Promise<any> => {
  try {
    const supply = await suiService.getTotalSupply(coinType);
    return {
      result: supply,
      urlCoins: `https://suiscan.xyz/mainnet/coin/${coinType}/txs`
    };
  } catch (error) {
    return error;
  }
}

const suiGetStakes = async (suiService: any, wallet: string): Promise<any> => {
  try {
    const stakes = await suiService.getStakes(wallet);
    return {
      result: stakes,
      urlPortfolio: `https://suiscan.xyz/mainnet/account/${wallet}/portfolio`
    };
  } catch (error) {
    return error;
  }
}

const suiGetValidatorsApy = async (suiService: any): Promise<any> => {
  try {
    const apy = await suiService.getValidatorsApy();
    return {
      result: apy,
      urlValidators: `https://suiscan.xyz/mainnet/validators`
    };
  } catch (error) {
    return error;
  }
}

const suiGetCoinsWithPagination = async (suiService: any, wallet: string, page: number, size = 10): Promise<any> => {
  try {
    const paginatedCoins = await suiService.getCoinsWithPagination(wallet, page, size);
    return {
      result: paginatedCoins,
      urlPortfolio: `https://suiscan.xyz/mainnet/account/${wallet}/portfolio`
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
}

const suiGetCoinBalance = async (suiService: any, wallet: string, coinType: string): Promise<any> => {
  try {
    const coinBalance = await suiService.getCoinBalance(wallet, coinType);
    return {
      success: true,
      result: coinBalance
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
}

export { 
  webSearchTool,
  getTrendingTokens,
  getWalletTokenBalancesPrices,
  getWalletNFTs,
  getWalletNetWorth,
  getWalletProfitabilitySummary,
  getTokenHolderStats,
  getTopGainersTokens,
  getTokenAnalytics,
  // Sui functions
  suiGetAllBalances,
  suiGetAllCoins,
  suiGetBalance,
  suiGetCoinMetadata,
  suiGetCoins,
  suiGetTotalSupply,
  suiGetStakes,
  suiGetValidatorsApy,
  suiGetCoinsWithPagination,
  suiGetCoinBalance
};
