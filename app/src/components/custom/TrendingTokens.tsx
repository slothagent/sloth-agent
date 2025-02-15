'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Agent, AgentMetrics } from "@/types/agent";
import { useQuery } from "@tanstack/react-query";

type AgentWithMetrics = Agent & {
  _id: string;
  metrics: AgentMetrics | null;
};

type PaginationMetadata = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
};

type PaginatedResponse<T> = {
  data: T[];
  metadata: PaginationMetadata;
};

type ApiResponse = {
  data: AgentWithMetrics[];
  metadata: PaginationMetadata;
};

const fetchAgents = async (page: number, pageSize: number): Promise<PaginatedResponse<AgentWithMetrics>> => {
  try {
    const response = await fetch(`/api/agent?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to fetch agents:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();


    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format: not an object', data);
      throw new Error('Invalid response format from server');
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format: data is not an array', data);
      throw new Error('Invalid response format from server');
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      console.error('Invalid response format: missing metadata', data);
      throw new Error('Invalid response format from server');
    }

    const { currentPage, pageSize: responsePageSize, totalPages, totalCount } = data.metadata;
    
    if (typeof currentPage !== 'number' || 
        typeof responsePageSize !== 'number' || 
        typeof totalPages !== 'number' || 
        typeof totalCount !== 'number') {
      console.error('Invalid metadata format', data.metadata);
      throw new Error('Invalid metadata format from server');
    }

    return {
      data: data.data,
      metadata: {
        currentPage,
        pageSize: responsePageSize,
        totalPages,
        totalCount
      }
    };
  } catch (error) {
    console.error('Error in fetchAgents:', error);
    throw error;
  }
};

const TableSkeleton = () => {
  return (
    <Card className="border-2 border-[#8b7355] rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-[#8b7355] hover:bg-[#8b7355]/5">
            <TableHead className="font-mono text-[#8b7355]">Token</TableHead>
            <TableHead className="font-mono text-[#8b7355]">Age</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Liq $/MC</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">MindShare</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Holders</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Smart $/KOL</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">1h TXs</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">1h Vol</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Price</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Δ7D</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Market Cap</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Volume</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Followers</TableHead>
            <TableHead className="text-right font-mono text-[#8b7355]">Top Tweets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index} className="border-b border-[#8b7355]/20">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

const TrendingTokens: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['agents', currentPage, pageSize],
    queryFn: () => fetchAgents(currentPage, pageSize),
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const agents = data?.data || [];
  const metadata = data?.metadata || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: pageSize
  };

  const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl mt-8 font-bold mb-4 font-mono text-[#8b7355]">Error Loading Agents</h2>
        <p className="text-[#8b7355] mb-4">{error instanceof Error ? error.message : 'An error occurred while loading agents'}</p>
        <Button
          variant="outline"
          className="border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355]/10 rounded-lg font-mono transition-all duration-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl mt-8 font-bold mb-4 font-mono text-[#8b7355]">AI Agent Index</h2>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Card className="border-2 border-[#8b7355] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-[#8b7355] hover:bg-[#8b7355]/5">
                <TableHead className="font-mono text-[#8b7355]">Token</TableHead>
                <TableHead className="font-mono text-[#8b7355]">Age</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Liq $/MC</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">MindShare</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Holders</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Smart $/KOL</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">1h TXs</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">1h Vol</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Price</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Δ7D</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Market Cap</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Volume</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Followers</TableHead>
                <TableHead className="text-right font-mono text-[#8b7355]">Top Tweets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow 
                  key={agent._id.toString()} 
                  className="border-b border-[#8b7355]/20 text-[#8b7355] hover:bg-[#8b7355]/5 cursor-pointer transition-colors duration-200" 
                  onClick={() => router.push(`/agent/${agent.ticker.toLowerCase()}`)}
                >
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      <Image 
                        src={agent.imageUrl || ''} 
                        alt={agent.name} 
                        width={32} 
                        height={32} 
                        className="rounded-lg border border-[#8b7355]/20"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-[#8b7355]">{agent.name}</span>
                        <span className="text-sm text-[#8b7355]/60 truncate">{agent.address.slice(0, 6)}...{agent.address.slice(-4)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{timeAgo(agent.createdAt)}</TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.liquidityAmount||"-"} 🔥</div>
                    <div className="text-sm text-[#8b7355]/60">{agent.metrics?.liquidityValue||"-"}</div>
                  </TableCell>
                  <TableCell className="text-right text-[#8b7355] font-mono">{agent.metrics?.blueChipHolding||"-"}</TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.holdersCount||"-"}</div>
                    <div className="text-sm text-[#8b7355]/60">+{agent.metrics?.holdersChange24h||"-"}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.smartMoneyValue||"-"}</div>
                    <div className="text-sm text-[#8b7355]/60">{agent.metrics?.smartMoneyKol||"-"} KOL</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.totalTransactions||"-"}</div>
                    <div className="text-sm text-[#8b7355]/60">{agent.metrics?.buyTransactions||"-"}/{agent.metrics?.sellTransactions||"-"}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{agent.metrics?.volumeLastHour||"-"}</TableCell>
                  <TableCell className="text-right font-mono">{agent.metrics?.currentPrice||"-"}</TableCell>
                  <TableCell className="text-right font-mono text-[#8b7355]">
                    {agent.metrics?.priceChange1m||"-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {agent.metrics?.marketCap||"-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {agent.metrics?.totalVolume||"-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {agent.metrics?.followersCount||"-"}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {agent.metrics?.topTweetsCount||"-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#8b7355]/20">
            <div className="flex-1 text-sm text-[#8b7355]">
              Page {metadata.currentPage} of {metadata.totalPages}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355]/10 rounded-lg font-mono transition-all duration-200"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355]/10 rounded-lg font-mono transition-all duration-200"
                onClick={() => setCurrentPage(prev => Math.min(metadata.totalPages, prev + 1))}
                disabled={currentPage === metadata.totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TrendingTokens; 