'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TableToken from "./TableToken";
import { useTokensData } from "@/hooks/useWebSocketData";


const TableSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-2xl mt-6 font-bold mb-4 text-white">Tokens Index</h2>
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
    </div>
  );
};

const TrendingTokens: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { tokens, loading: tokensLoading } = useTokensData();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Implement client-side pagination
  const paginatedTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // First sort the tokens based on the sortBy state
    const sortedTokens = [...tokens].sort((a, b) => {
      const dateA = new Date(a.createdAt?.toString() || '').getTime();
      const dateB = new Date(b.createdAt?.toString() || '').getTime();
      
      // Sort by newest (descending) or oldest (ascending)
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    // Then paginate the sorted tokens
    return sortedTokens.slice(startIndex, endIndex);
  }, [tokens, currentPage, pageSize, sortBy]);

  // Calculate pagination metadata
  const metadata = useMemo(() => {
    return {
      currentPage,
      totalPages: Math.ceil(tokens.length / pageSize),
      totalCount: tokens.length,
      pageSize
    };
  }, [tokens.length, currentPage, pageSize]);

  if (tokensLoading) {
    return <TableSkeleton />;
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl mt-8 font-bold mb-4 text-white">No Tokens Found</h2>
        <p className="text-gray-400 mb-4">There are currently no tokens available.</p>
        <Button
          variant="outline"
          className="border border-gray-600 text-gray-400 hover:bg-gray-800 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl mt-6 font-bold mb-4 text-white">Tokens Index</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <select 
            className="bg-[#1C2333] text-white border border-gray-700 rounded-md px-2 py-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
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
            {paginatedTokens.map((token) => (
              <TableToken key={token._id?.toString() || ''} token={token} />
            ))}
          </TableBody>
        </Table>
        
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <div className="flex-1 text-xs md:text-sm text-gray-400">
            Page {metadata.currentPage} of {metadata.totalPages} ({metadata.totalCount} tokens)
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="text-gray-400 hover:bg-[#1C2333] hover:text-white rounded-lg"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="text-gray-400 hover:bg-[#1C2333] hover:text-white rounded-lg"
              onClick={() => setCurrentPage(prev => Math.min(metadata.totalPages, prev + 1))}
              disabled={currentPage === metadata.totalPages || metadata.totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrendingTokens; 