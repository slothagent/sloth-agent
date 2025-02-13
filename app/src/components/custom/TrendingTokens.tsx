'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Agent, AgentMetrics } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

type AgentWithMetrics = Agent & {
  metrics: AgentMetrics | null;
};

type PaginationMetadata = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

type PaginatedResponse<T> = {
  data: T[];
  metadata: PaginationMetadata;
};

const getPaginatedAgents = async (
  page: number,
  pageSize: number
): Promise<PaginatedResponse<AgentWithMetrics>> => {
  try {
    const response = await fetch(`/api/agent?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching paginated agents:', error);
    return {
      data: [],
      metadata: {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        pageSize: pageSize
      }
    };
  }
};

const TableSkeleton = () => {
  return (
    <Card className="border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black hover:bg-[#93E905]/10">
            <TableHead className="font-mono">Token</TableHead>
            <TableHead className="font-mono">Age</TableHead>
            <TableHead className="text-right font-mono">Liq $/MC</TableHead>
            <TableHead className="text-right font-mono">MindShare</TableHead>
            <TableHead className="text-right font-mono">Holders</TableHead>
            <TableHead className="text-right font-mono">Smart $/KOL</TableHead>
            <TableHead className="text-right font-mono">1h TXs</TableHead>
            <TableHead className="text-right font-mono">1h Vol</TableHead>
            <TableHead className="text-right font-mono">Price</TableHead>
            <TableHead className="text-right font-mono">Δ7D</TableHead>
            <TableHead className="text-right font-mono">Market Cap</TableHead>
            <TableHead className="text-right font-mono">Volume</TableHead>
            <TableHead className="text-right font-mono">Followers</TableHead>
            <TableHead className="text-right font-mono">Top Tweets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index} className="border-b border-black">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-none" />
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
  const [loading, setLoading] = useState(true);
  const pageSize = 5;
  const [agents, setAgents] = useState<AgentWithMetrics[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: pageSize
  });

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

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const result = await getPaginatedAgents(currentPage, pageSize);
        setAgents(result.data);
        setMetadata(result.metadata);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [currentPage, pageSize]);

  return (
    <div>
      <h2 className="text-2xl mt-8 font-bold mb-4 font-mono text-black">AI Agent Index</h2>
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black hover:bg-[#93E905]/10">
                <TableHead className="font-mono">Token</TableHead>
                <TableHead className="font-mono">Age</TableHead>
                <TableHead className="text-right font-mono">Liq $/MC</TableHead>
                <TableHead className="text-right font-mono">MindShare</TableHead>
                <TableHead className="text-right font-mono">Holders</TableHead>
                <TableHead className="text-right font-mono">Smart $/KOL</TableHead>
                <TableHead className="text-right font-mono">1h TXs</TableHead>
                <TableHead className="text-right font-mono">1h Vol</TableHead>
                <TableHead className="text-right font-mono">Price</TableHead>
                <TableHead className="text-right font-mono">Δ7D</TableHead>
                <TableHead className="text-right font-mono">Market Cap</TableHead>
                <TableHead className="text-right font-mono">Volume</TableHead>
                <TableHead className="text-right font-mono">Followers</TableHead>
                <TableHead className="text-right font-mono">Top Tweets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="border-b border-black text-black hover:bg-[#93E905]/10 cursor-pointer" onClick={() => router.push(`/agent/${agent.ticker.toLowerCase()}`)}>
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      <Image 
                        src={agent.imageUrl || ''} 
                        alt={agent.name} 
                        width={32} 
                        height={32} 
                        className="rounded-none"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-black">{agent.name}</span>
                        <span className="text-sm text-black/60 truncate">{agent.address.slice(0, 6)}...{agent.address.slice(-4)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{timeAgo(agent.createdAt)}</TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.liquidityAmount||"-"} 🔥</div>
                    <div className="text-sm text-black/60">{agent.metrics?.liquidityValue||"-"}</div>
                  </TableCell>
                  <TableCell className="text-right text-black font-mono">{agent.metrics?.blueChipHolding||"-"}</TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.holdersCount||"-"}</div>
                    <div className="text-sm text-black/60">+{agent.metrics?.holdersChange24h||"-"}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.smartMoneyValue||"-"}</div>
                    <div className="text-sm text-black/60">{agent.metrics?.smartMoneyKol||"-"} KOL</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div>{agent.metrics?.totalTransactions||"-"}</div>
                    <div className="text-sm text-black/60">{agent.metrics?.buyTransactions||"-"}/{agent.metrics?.sellTransactions||"-"}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{agent.metrics?.volumeLastHour||"-"}</TableCell>
                  <TableCell className="text-right font-mono">{agent.metrics?.currentPrice||"-"}</TableCell>
                  <TableCell className={`text-right font-mono text-[#93E905]`}>
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
          
          <div className="flex items-center justify-between px-4 py-4 border-t border-black">
            <div className="flex-1 text-sm text-black">
              Page {metadata.currentPage} of {metadata.totalPages}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-2 border-black rounded-none font-mono"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {'<'}
                </Button>
                <div className="flex w-[100px] justify-center font-mono text-black">
                  {currentPage} / {metadata.totalPages}
                </div>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-2 border-black rounded-none font-mono"
                  onClick={() => setCurrentPage(prev => Math.min(metadata.totalPages, prev + 1))}
                  disabled={currentPage === metadata.totalPages}
                >
                  {'>'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TrendingTokens; 