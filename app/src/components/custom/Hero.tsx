import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  systemType: string;
  ticker: string;
}

const Hero: React.FC = () => {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agent');
      const result = await response.json();
      if (result.success) {
        setAgents(result.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateAgent = useCallback(() => {
    router.push('/agent/create');
  }, [router]);

  const MainCardSkeleton = useCallback(() => (
    <Card className="w-full md:w-[400px] max-h-[700px] border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
      <CardContent className="p-0">
        <div className="w-full h-[600px] relative">
          <Skeleton className="w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#93E905]/50 to-transparent">
            <div className="flex flex-col">
              <Skeleton className="h-8 w-48 mb-1" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  ), []);

  const AgentCardSkeleton = useCallback(() => (
    <Card className="bg-[#93E905]/10 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
      <CardContent className="p-1">
        <div className="aspect-square relative">
          <Skeleton className="w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  ), []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div className="flex max-h-[700px] bg-gradient-to-b from-[#93E905]/10 to-white">
      <div className="container mx-auto relative flex items-center gap-4 py-8 pt-16">
        {loading ? (
          <MainCardSkeleton />
        ) : (
          <Card className="w-full md:w-[400px] max-h-[700px] border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
            <CardContent className="p-0">
              <div className="w-full h-[600px] relative">
                <div className="w-full h-full relative overflow-hidden">
                  <Image
                    src={agents[0]?.imageUrl || 'https://pbs.twimg.com/profile_images/1881065252776767488/IeGmkIiT_400x400.jpg'}
                    alt={agents[0]?.name||''}
                    fill
                    className="object-cover" 
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#93E905]/50 to-transparent">
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-bold text-white mb-1 font-mono">{agents[0]?.name||'Agent Name'}</h2>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white text-lg font-mono">
                          <span>Total Market Cap</span>
                          <span className="text-2xl">•</span>
                          <span>$100,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>              
            
              <Button variant="outline" className="text-white py-3 rounded-none w-full font-mono border-2 border-white hover:bg-[#93E905] hover:text-black">
                BUY NOW
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Right Content */}
        <div className="flex-1 flex flex-col justify-between p-10">
          {/* Timer */}
          <div className="mb-12">
            <div className="flex gap-4 text-2xl font-bold font-mono text-black">
              <div className="border-2 border-black px-4 py-2 bg-[#93E905]/10">12 D</div>
              <div className="border-2 border-black px-4 py-2 bg-[#93E905]/10">08 H</div>
              <div className="border-2 border-black px-4 py-2 bg-[#93E905]/10">53 M</div>
            </div>
          </div>

          {/* Featured Print */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 font-mono text-black">SLOTH AGENT</h1>
            <p className="text-black/80 mb-8 font-mono">
              A pioneering platform designed to revolutionize the meme coin and decentralized finance (DeFi) space by providing an intuitive, AI-powered ecosystem for token creation and automated trading.
            </p>
            
            <div className="flex gap-4">
              <Button 
                className="bg-[#93E905] text-black hover:bg-[#93E905]/90 rounded-none font-mono border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)]" 
                onClick={handleCreateAgent}
              >
                Create Agent
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-[#93E905] hover:text-black rounded-none font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
                Explore Agents
              </Button>
            </div>
          </div>

          {/* Agents Grid*/}
          <div className="mt-auto">
            <div className="grid grid-cols-4 gap-6">
              {loading ? (
                <>
                  <AgentCardSkeleton />
                  <AgentCardSkeleton />
                  <AgentCardSkeleton />
                  <AgentCardSkeleton />
                </>
              ) : (
                agents.map((agent) => (
                  <Card key={agent.id} className="bg-[#93E905]/10 hover:bg-[#93E905]/20 transition-colors cursor-pointer border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
                    <CardContent className="p-1">
                      <div className="aspect-square relative">
                        <Image
                          src={agent.imageUrl}
                          alt={agent.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                          <h3 className="font-bold text-white text-sm font-mono">{agent.name}</h3>
                          <p className="text-white/80 text-xs font-mono">{agent.ticker}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 