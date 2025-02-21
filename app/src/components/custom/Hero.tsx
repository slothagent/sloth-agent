import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Agent } from '@/types/agent';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agent');
      const result = await response.json();
      setAgents(result.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

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
          {loading ? (
            <MainCardSkeleton />
          ) : agents[0] && (
            <Card 
              onClick={() => router.push(`/agent/${agents[0].ticker.toLowerCase()}`)}
              className="w-full lg:w-[400px] h-auto min-h-[200px] bg-[#161B28] hover:bg-[#1C2333] transition-colors duration-200 cursor-pointer border-none rounded-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={agents[0].imageUrl || ''}
                    alt={agents[0].name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{agents[0].name}</h3>
                    <p className="text-gray-400">{agents[0].ticker}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white">$100,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white">$50,000</span>
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
                  {loading ? <Skeleton className="h-8 w-20" /> : agents.length}
                </p>
              </Card>
              <Card className="bg-[#161B28] border-none rounded-lg p-4">
                <h4 className="text-gray-400 mb-2">Total Volume</h4>
                <p className="text-2xl font-semibold text-white">
                  {loading ? <Skeleton className="h-8 w-20" /> : "$1.2M"}
                </p>
              </Card>
              <Card className="bg-[#161B28] border-none rounded-lg p-4">
                <h4 className="text-gray-400 mb-2">Active Traders</h4>
                <p className="text-2xl font-semibold text-white">
                  {loading ? <Skeleton className="h-8 w-20" /> : "2.5K"}
                </p>
              </Card>
            </div>
            
            <div className='flex gap-4'>
              <Button 
                onClick={() => router.push('/agent/create')}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2"
              >
                Create New Agent
              </Button>
              <button
                  onClick={()=>router.push('/token/create')}
                  className={`flex items-center gap-2 px-6 py-2 text-sm bg-[#161B28] border border-[#1F2937] text-gray-400 hover:bg-[#1C2333] hover:text-white`}
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