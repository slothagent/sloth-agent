import { Card, CardContent } from "../ui/card";
import { useRouter } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { Skeleton } from "../ui/skeleton";
import { formatNumber } from '../../utils/utils';
import { useTokensData, useAgentsData, useAllTransactionsData } from '../../hooks/useWebSocketData';
import { useQuery } from '@tanstack/react-query';
import { useSonicPrice } from '../../hooks/useSonicPrice';
import { useEthPrice } from '../../hooks/useEthPrice';
import { INITIAL_SUPPLY } from '../../lib/contants';
import axios from 'axios';

const Hero: React.FC = () => {
  const router = useRouter();
  const { tokens: tokens, loading: tokensLoading } = useTokensData();
  const { agents: agents, loading: agentsLoading } = useAgentsData();
  const {transactions: transactionsData30d} = useAllTransactionsData('30d');

  const { data: sonicPriceData } = useSonicPrice();
  const { data: ethPriceData } = useEthPrice();

  // Get the ETH price for calculations, fallback to 2500 if not available
  const ethPrice = useMemo(() => {
    return ethPriceData?.price || 2500;
  }, [ethPriceData]);
  
  const sonicPrice = useMemo(() => {
    return sonicPriceData?.price || 0.7;
  }, [sonicPriceData]);

  const fetchTransactions = async (tokenAddress: string) => {
    const response = await axios.get(`${import.meta.env.PUBLIC_API_NEW}/api/transaction?tokenAddress=${tokenAddress}&timeRange=24h`);
    const result = await response.data;
    return result.data;
  }

  const { data: transactionsData24h } = useQuery({
      queryKey: ['transactions', tokens[tokens.length - 1]?.address],
      queryFn: () => fetchTransactions(tokens[tokens.length - 1]?.address),
      enabled: !!tokens[tokens.length - 1]?.address,
      refetchInterval: 10000
  });


  const transactions = useMemo(() => {
    if (!transactionsData24h) return [];
    return transactionsData24h;
  }, [transactionsData24h]); 
  
  const totalVolume30d = useMemo(() => {
    if (!transactionsData30d) return 0;
    const ancient8Transactions = transactionsData30d.filter((tx: any) => tx.network === 'Ancient8');
    const ancient8TotalVolume = ancient8Transactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * ancient8Transactions[ancient8Transactions.length - 1]?.price * ethPrice;
    const sonicTransactions = transactionsData30d.filter((tx: any) => tx.network === 'Sonic');
    const sonicTotalVolume = sonicTransactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * sonicTransactions[sonicTransactions.length - 1]?.price * sonicPrice;
    if(ancient8TotalVolume > 0) {
      return ancient8TotalVolume;
    }
    if(sonicTotalVolume > 0) {
      return sonicTotalVolume;
    }
    return ancient8TotalVolume + sonicTotalVolume;
  }, [transactionsData30d]);

  const totalMarketCapToken = useMemo(() => {
    if (!transactions) return 0;

    const ancient8Transactions = transactions.filter((tx: any) => tx.network === 'Ancient8')
    const ancient8TokenPrice = ancient8Transactions[ancient8Transactions.length - 1]?.price;
    const ancient8MarketCap = ancient8TokenPrice * ethPrice * INITIAL_SUPPLY;
    const sonicTransactions = transactions.filter((tx: any) => tx.network === 'Sonic');
    const sonicTokenPrice = sonicTransactions[sonicTransactions.length - 1]?.price;
    const sonicMarketCap = sonicTokenPrice * sonicPrice * INITIAL_SUPPLY;
    return ancient8MarketCap || sonicMarketCap;
  }, [transactions]);

  const totalVolumeToken = useMemo(() => {
    if (!transactions) return 0;
    const ancient8Transactions = transactions.filter((tx: any) => tx.network === 'Ancient8');
    const ancient8Volume = ancient8Transactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * ancient8Transactions[ancient8Transactions.length - 1]?.price * ethPrice;
    const sonicTransactions = transactions.filter((tx: any) => tx.network === 'Sonic');
    const sonicVolume = sonicTransactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * sonicTransactions[sonicTransactions.length - 1]?.price * sonicPrice;
    return ancient8Volume || sonicVolume;
  }, [transactions]);
  

  const MainCardSkeleton = useCallback(() => (
    <Card className="w-full md:w-[400px] h-[200px] bg-[#161B28] border-none rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="mt-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  ), []);

  return (
    <div className="w-full bg-[#0B0E17] border-y border-[#1F2937]">
      <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Featured Agent Card */}
          {tokensLoading ? (
            <MainCardSkeleton />
          ) : tokens[tokens.length - 1] && (
            <Card 
              onClick={() => router.navigate({to: `/token/${tokens[tokens.length - 1].address}`})}
              className="w-full lg:w-[400px] h-auto min-h-[200px] bg-[#161B28] hover:bg-[#1C2333] transition-colors duration-200 cursor-pointer border-none rounded-none"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {tokens[tokens.length - 1].imageUrl &&(
                    <img
                      src={tokens[tokens.length - 1].imageUrl || ''}
                      alt={tokens[tokens.length - 1].name}
                      width={48}
                      height={48}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className='flex items-start gap-2 justify-between w-full'>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{tokens[tokens.length - 1].name}</h3>
                      <p className="text-gray-400">{tokens[tokens.length - 1].ticker}</p>
                    </div>
                    <img alt="Chain" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" className="w-6" src={ tokens[tokens.length - 1].network == "Sonic" ? "https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" : "/assets/chains/a8.png"} style={{ color: 'transparent' }} />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white">${formatNumber(totalMarketCapToken)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white">${formatNumber(totalVolumeToken)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats and Info */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-[#161B28] border-none rounded-none p-4">
                <h4 className="text-gray-400 mb-2">Total Agents</h4>
                <p className="text-2xl font-semibold text-white">
                  {agentsLoading ? <Skeleton className="h-8 w-20" /> : agents.length}
                </p>
              </Card>
              <Card className="bg-[#161B28] border-none rounded-none p-4">
                <h4 className="text-gray-400 mb-2">Total Tokens</h4>
                <p className="text-2xl font-semibold text-white">
                  {tokensLoading ? <Skeleton className="h-8 w-20" /> : tokens.length}
                </p>
              </Card>
              <Card className="bg-[#161B28] border-none rounded-none p-4">
                <h4 className="text-gray-400 mb-2">Total Volume</h4>
                <p className="text-2xl font-semibold text-white">
                  {!totalVolume30d ? <Skeleton className="h-8 w-20" /> : `$${totalVolume30d ? formatNumber(totalVolume30d) : 0}`}
                </p>
              </Card>
            </div>
            
            <div className='flex gap-4'>
              <button 
                onClick={() => router.navigate({to: '/agent/create'})}
                className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-500  border border-[#1F2937] text-wrap hover:bg-blue-600 text-white hover:text-white"
              >
                Create New Agent
              </button>
              <button
                  onClick={()=>router.navigate({to: '/token/create'})}
                  className={`flex items-center text-wrap gap-2 px-6 py-2 text-sm bg-[#161B28] border border-[#1F2937] text-gray-400 hover:bg-[#1C2333] hover:text-white`}
              >
                  Create New Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 