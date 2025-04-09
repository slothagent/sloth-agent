import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTokensData } from "../../hooks/useWebSocketData";
import { Card, CardContent } from "../ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "../../utils/utils";

// Add chain logos mapping
const chainLogos: { [key: string]: string } = {
  ethereum: "/assets/chains/ethereum.png",
  bsc: "/assets/chains/bnb.png",
  movement: "/assets/chains/movement.png",
  solana: "/assets/chains/solana.png",
  polygon: "/assets/chains/polygon.png",
  arb: "/assets/chains/arbitrum.png",
  ton: "/assets/chains/ton.png",
  base: "/assets/chains/base.svg",
  sonic: "https://sonicscan.org/assets/sonic/images/svg/logos/chain-dim.svg?v=25.3.2.1",
  ancient8: "/assets/chains/a8.png",
};

interface TrendingItem {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  price: number;
  price_change_24h: number;
  sparkline?: string;
  pair?: string;
  market_cap_rank: number;
  url?: string;
  chainId?: string;
}

interface DexScreenerProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  description: string;
}

interface CoinGeckoTrendingResponse {
  coins: Array<{
    item: {
      id: string;
      name: string;
      symbol: string;
      thumb: string;
      market_cap_rank: number;
      data: {
        price: number;
        price_change_percentage_24h: {
          usd: number;
        };
        sparkline: string;
      };
    };
  }>;
}

const fetchTrendingCoins = async (): Promise<TrendingItem[]> => {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  if (!response.ok) {
    throw new Error('Failed to fetch trending coins');
  }
  const data: CoinGeckoTrendingResponse = await response.json();
  
  return data.coins
    .filter(coin => coin.item.market_cap_rank >= 1)
    .sort((a, b) => a.item.market_cap_rank - b.item.market_cap_rank)
    .map(coin => ({
      id: coin.item.id,
      name: coin.item.name,
      symbol: coin.item.symbol.toUpperCase(),
      thumb: coin.item.thumb,
      price: coin.item.data.price,
      price_change_24h: coin.item.data.price_change_percentage_24h.usd,
      sparkline: coin.item.data.sparkline,
      market_cap_rank: coin.item.market_cap_rank
    }));
};

const fetchTrendingDex = async (): Promise<TrendingItem[]> => {
  // Fetch token profiles
  const profilesResponse = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
  if (!profilesResponse.ok) {
    throw new Error('Failed to fetch token profiles');
  }
  const profiles: DexScreenerProfile[] = await profilesResponse.json();

  // Process only the first 5 profiles
  const topProfiles = profiles.slice(0, 5);
  
  // Fetch pair data for each token
  const trendingItems = await Promise.all(
    topProfiles.map(async (profile, index) => {
      try {
        const pairResponse = await fetch(`https://api.dexscreener.com/token-pairs/v1/${profile.chainId}/${profile.tokenAddress}`);
        if (!pairResponse.ok) {
          console.error(`Failed to fetch pair data for ${profile.tokenAddress}`);
          return null;
        }
        
        const pairData = await pairResponse.json();
        const pair = pairData[0];

        const item: TrendingItem = {
          id: profile.tokenAddress,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          thumb: profile.icon || pair.info.imageUrl,
          price: parseFloat(pair.priceUsd || '0'),
          price_change_24h: pair.priceChange?.h24 || 0,
          pair: pair.quoteToken.symbol,
          market_cap_rank: index + 1,
          url: profile.url,
          chainId: profile.chainId
        };
        return item;
      } catch (error) {
        console.error(`Error processing token ${profile.tokenAddress}:`, error);
        return null;
      }
    })
  );

  // Filter out null values and ensure type safety
  return trendingItems.filter((item): item is TrendingItem => item !== null);
};

const TrendingCards = () => {

    const { tokens, loading: tokensLoading } = useTokensData();
    const navigate = useNavigate();
  
  
    const sortedTokens = useMemo(() => {
      if (!tokens) return [];
      return [...tokens].sort((a, b) => {
        // Sort by creation date in descending order (most recent first)
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    }, [tokens]);
  const { 
    data: trendingCoins, 
    isLoading: isLoadingCoins,
    isError: isErrorCoins,
    error: errorCoins
  } = useQuery<TrendingItem[], Error>({
    queryKey: ['trendingCoins'],
    queryFn: fetchTrendingCoins,
    refetchInterval: 10000,
    staleTime: 20000,
    gcTime: 1800000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const {
    data: trendingDex,
    isLoading: isLoadingDex,
    isError: isErrorDex,
    error: errorDex
  } = useQuery<TrendingItem[], Error>({
    queryKey: ['trendingDex'],
    queryFn: fetchTrendingDex,
    refetchInterval: 10000,
    staleTime: 20000,
    gcTime: 1800000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

//   console.log(trendingDex);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent Tokens Card */}
        <Card className="bg-[#161B28] border border-[#1F2937] rounded-lg h-auto min-h-[200px] w-full">
            <CardContent className="p-4">
              <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                Recent Tokens
              </h2>
              {tokensLoading ? (
                <div className="text-white text-left flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTokens.slice(0, 5).map((token, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between cursor-pointer group" 
                      onClick={() => navigate({to: `/token/${token.address}`})}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">{index+1}</span>
                        <div className="relative w-8 h-8">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img 
                              src={token.imageUrl} 
                              alt={token.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#161B28] flex items-center justify-center p-0.5">
                            <img 
                              src={chainLogos[token.network?.toLowerCase() || 'sonic']} 
                              alt="chain" 
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white group-hover:underline transition-colors">{token.name}</span>
                          <span className="text-gray-400 text-sm group-hover:underline transition-colors">{token.ticker}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-white">{formatNumber(Number(token.totalSupply)/10**18)} {token.ticker}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
        </Card>
      {/* Trending Coins Card */}
      <Card className="bg-[#161B28] border border-[#1F2937] rounded-lg h-auto min-h-[200px]">
        <CardContent className="p-4">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            Trending Coins
          </h2>
          {isLoadingCoins ? (
            <div className="text-white text-center">Loading...</div>
          ) : isErrorCoins ? (
            <div className="text-red-500 text-center">
              Error: {errorCoins instanceof Error ? errorCoins.message : 'Failed to fetch data'}
            </div>
          ) : (
            <div className="space-y-4">
              {trendingCoins?.slice(0, 5).map((coin, index) => (
                <div key={coin.id} className="flex items-center justify-between cursor-pointer group" onClick={() => window.open(`https://coinmarketcap.com/currencies/${coin.id}`, '_blank')}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">{index+1}</span>
                    <img src={coin.thumb} alt={coin.name} className="w-7 h-7 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-white group-hover:underline">{coin.name}</span>
                      <span className="text-gray-400 text-sm group-hover:underline">{coin.symbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <img src={coin.sparkline} alt="sparkline" className="h-8 w-24" />
                    <div className="flex flex-col items-end w-20">
                      <span className="text-white">${coin.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending on DexScan Card */}
      <Card className="bg-[#161B28] border border-[#1F2937] rounded-lg h-auto min-h-[200px]">
        <CardContent className="p-4">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            Trending on DexScan
          </h2>
          {isLoadingDex ? (
            <div className="text-white text-center">Loading...</div>
          ) : isErrorDex ? (
            <div className="text-red-500 text-center">
              Error: {errorDex instanceof Error ? errorDex.message : 'Failed to fetch data'}
            </div>
          ) : (
            <div className="space-y-4">
              {trendingDex?.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between cursor-pointer group" 
                  onClick={() => item.chainId == "solana" ? navigate({to: `/sol/${item.id}`}) : window.open(item.url, '_blank')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">{item.market_cap_rank}</span>
                    <div className="relative w-8 h-8">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={item.thumb} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#161B28] flex items-center justify-center p-0.5">
                        <img 
                          src={chainLogos[item.chainId?.toLowerCase() || 'bsc']} 
                          alt="chain" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white group-hover:underline">{item.name}</span>
                      <span className="text-gray-400 text-sm group-hover:underline">{item.symbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-white">${item.price.toFixed(8)}</span>
                      <span className={`text-sm ${item.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.price_change_24h >= 0 ? '↑' : '↓'} {Math.abs(item.price_change_24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingCards; 