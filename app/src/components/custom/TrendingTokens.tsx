'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Agent } from "@/types/agent";
import { TokenMetrics } from "@/models/agentMetrics";
import { useQuery } from "@tanstack/react-query";
import TableToken from "./TableToken";


type TokenWithMetrics = Agent & {
  _id: string;
  metrics: TokenMetrics | null;
  createdAt: string | Date;
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
  data: TokenWithMetrics[];
  metadata: PaginationMetadata;
};

const fetchTokens = async (page: number, pageSize: number): Promise<PaginatedResponse<TokenWithMetrics>> => {
  try {
    const response = await fetch(`/api/token?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to fetch tokens:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to fetch tokens: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

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
    console.error('Error in fetchTokens:', error);
    throw error;
  }
};

const TableSkeleton = () => {
  return (
    <Card className="bg-[#161B28] border-none rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-800 hover:bg-transparent">
            <TableHead className="font-mono text-gray-400">Token</TableHead>
            <TableHead className="font-mono text-gray-400">Age</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Liq $/MC</TableHead>
            <TableHead className="text-right font-mono text-gray-400">MindShare</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Holders</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Smart $/KOL</TableHead>
            <TableHead className="text-right font-mono text-gray-400">24h TXs</TableHead>
            <TableHead className="text-right font-mono text-gray-400">24h Vol</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Price</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Δ7D</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Market Cap</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Volume</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Followers</TableHead>
            <TableHead className="text-right font-mono text-gray-400">Top Tweets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index} className="border-b border-gray-800">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg bg-gray-700" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                    <Skeleton className="h-3 w-16 bg-gray-700" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20 bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-700" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto bg-gray-700" /></TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-3 w-12 bg-gray-700" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20 bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-700" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-3 w-20 bg-gray-700" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-700" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-700" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 ml-auto bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 ml-auto bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto bg-gray-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12 mx-auto bg-gray-700" /></TableCell>
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
    queryKey: ['tokens', currentPage, pageSize],
    queryFn: () => fetchTokens(currentPage, pageSize),
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const tokens = data?.data || [];
  const metadata = data?.metadata || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: pageSize
  };



  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl mt-8 font-bold mb-4 text-white">Error Loading Tokens</h2>
        <p className="text-gray-400 mb-4">{error instanceof Error ? error.message : 'An error occurred while loading tokens'}</p>
        <Button
          variant="outline"
          className="border border-gray-600 text-gray-400 hover:bg-gray-800 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl mt-6 font-bold mb-4 text-white">Tokens Index</h2>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Card className="bg-[#161B28] border-none rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b w-auto border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Token</TableHead>
                <TableHead className="text-gray-400">Age</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Liq $/MC</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">MindShare</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Holders</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Smart $/KOL</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">24h TXs</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">24h Vol</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Price</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Δ7D</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Market Cap</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Volume</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Followers</TableHead>
                <TableHead className="text-right text-gray-400 text-nowrap">Top Tweets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableToken key={token._id?.toString() || ''} token={token} />
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <div className="flex-1 text-xs md:text-sm text-gray-400">
              Page {metadata.currentPage} of {metadata.totalPages}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="text-gray-400 hover:bg-[#1C2333] hover:text-white rounded-lg"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="text-gray-400 hover:bg-[#1C2333] hover:text-white rounded-lg"
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