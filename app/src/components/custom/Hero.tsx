import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { formatNumber } from '@/utils/utils';

const Hero: React.FC = () => {
  const router = useRouter();

  const fetchTokens = async () => {
    const response = await fetch('/api/token');
    const result = await response.json();
    return result.data;
  }

  const fetchAgents = async () => {
    const response = await fetch('/api/agent');
    const result = await response.json();
    return result.data;
  }

  const fetchTransactions = async (tokenAddress: string) => {
    const response = await fetch(`/api/transactions?tokenAddress=${tokenAddress}&timeRange=24h`);
    const result = await response.json();
    return result.data;
  }

  const fetchTotalVolume = async () => {
    const response = await fetch(`/api/transactions?totalVolume=true`);
    const result = await response.json();
    return result.data;
  }

  const { data: token, isLoading } = useQuery({
    queryKey: ['token'],
    queryFn: () => fetchTokens(),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 10 * 1000,
    retry: 1,
  });

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ['agent'],
    queryFn: () => fetchAgents(),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 10 * 1000,
    retry: 1,
  });

  const agents = useMemo(() => {
    if (!agent) return [];
    return agent;
  }, [agent]);
  
  const tokens = useMemo(() => {
    if (!token) return [];
    return token;
  }, [token]);

  const {data: transactionsData, isLoading: transactionsLoading} = useQuery({
    queryKey: ['transactions', tokens[0]?.address],
    queryFn: () => fetchTransactions(tokens[0]?.address),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {data: totalVolumeData, isLoading: totalVolumeLoading} = useQuery({
    queryKey: ['totalVolume'],
    queryFn: () => fetchTotalVolume(),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const totalVolume = useMemo(() => {
    if (!totalVolumeData) return 0;
    return totalVolumeData;
  }, [totalVolumeData]);

  const transactions = useMemo(() => {
    if (!transactionsData) return [];
    return transactionsData;
  }, [transactionsData]);
  
  // console.log(transactions);

  const totalMarketCapToken = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc: number, curr: any) => acc + curr.marketCap, 0);
  }, [transactions]);

  const totalVolumeToken = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);
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
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Featured Agent Card */}
          {isLoading ? (
            <MainCardSkeleton />
          ) : tokens[0] && (
            <Card 
              onClick={() => router.push(`/token/${tokens[0].address}`)}
              className="w-full lg:w-[400px] h-auto min-h-[200px] bg-[#161B28] hover:bg-[#1C2333] transition-colors duration-200 cursor-pointer border-none rounded-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {tokens[0].imageUrl &&(
                    <Image
                      src={tokens[0].imageUrl}
                      alt={tokens[0].name}
                      width={48}
                      height={48}
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{tokens[0].name}</h3>
                    <p className="text-gray-400">{tokens[0].ticker}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white">${formatNumber(Number(totalMarketCapToken)/10**18)}</span>
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
              <Card className="bg-[#161B28] border-none rounded-lg p-4">
                <h4 className="text-gray-400 mb-2">Total Agents</h4>
                <p className="text-2xl font-semibold text-white">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : agents.length}
                </p>
              </Card>
              <Card className="bg-[#161B28] border-none rounded-lg p-4">
                <h4 className="text-gray-400 mb-2">Total Tokens</h4>
                <p className="text-2xl font-semibold text-white">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : tokens.length}
                </p>
              </Card>
              <Card className="bg-[#161B28] border-none rounded-lg p-4">
                <h4 className="text-gray-400 mb-2">Total Volume</h4>
                <p className="text-2xl font-semibold text-white">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : `$${totalVolume ? totalVolume.volume.toFixed(2) : 0}`}
                </p>
              </Card>
            </div>
            
            <div className='flex gap-4'>
              <button 
                onClick={() => router.push('/agent/create')}
                className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-500  border border-[#1F2937] text-wrap hover:bg-blue-600 text-white hover:text-white"
              >
                Create New Agent
              </button>
              <button
                  onClick={()=>router.push('/token/create')}
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