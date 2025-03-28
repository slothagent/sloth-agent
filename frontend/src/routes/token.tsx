import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Token } from '../models/token';
import TokenCard from '../components/custom/TokenCard';
import { useTokensData } from '../hooks/useWebSocketData';
export const Route = createFileRoute("/token")({
    component: Tokens
});
const sortTokensByPriority = (tokens: Token[], query: string) => {
    return [...tokens].sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const aTicker = a.ticker.toLowerCase()
      const bTicker = b.ticker.toLowerCase()
  
      const aStartsWithName = aName.startsWith(query)
      const bStartsWithName = bName.startsWith(query)
      
      if (aStartsWithName && !bStartsWithName) return -1
      if (!aStartsWithName && bStartsWithName) return 1
      if (!aStartsWithName && !bStartsWithName) {
        const aStartsWithTicker = aTicker.startsWith(query)
        const bStartsWithTicker = bTicker.startsWith(query)
        
        if (aStartsWithTicker && !bStartsWithTicker) return -1
        if (!aStartsWithTicker && bStartsWithTicker) return 1
      }
  
      const aContainsName = aName.includes(query)
      const bContainsName = bName.includes(query)
      
      if (aContainsName && !bContainsName) return -1
      if (!aContainsName && bContainsName) return 1
  
      if (!aContainsName && !bContainsName) {
        const aContainsTicker = aTicker.includes(query)
        const bContainsTicker = bTicker.includes(query)
        
        if (aContainsTicker && !bContainsTicker) return -1
        if (!aContainsTicker && bContainsTicker) return 1
      }
  
      return new Date(b.createdAt?.toString() || '').getTime() - new Date(a.createdAt?.toString() || '').getTime()
    })
  }

function Tokens() {
    const [searchQuery] = useState('')
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { tokens, loading: tokensLoading } = useTokensData();
    const {data: tokensData, isLoading: tokensDataLoading} = useQuery({
        queryKey: ['tokens'],
        queryFn: async () => {
          const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token?page=1&pageSize=10`);
          const result = await response.json();
          return result.data;
        }
      });
    const filteredTokens = useMemo(() => {
        
        const sourceTokens = tokens || tokensData || [];
        
        let result = !searchQuery ? [...sourceTokens] : sourceTokens.filter((token: Token) => 
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
        )
        
        if (searchQuery) {
          result = sortTokensByPriority(result, searchQuery.toLowerCase())
        } else {
          result.sort((a, b) => {
            return new Date(b.createdAt?.toString() || '').getTime() - new Date(a.createdAt?.toString() || '').getTime()
          })
        }
        
        return result
      }, [tokens, tokensData, searchQuery])

    const isLoading = (tokensLoading || tokensDataLoading) && !tokens && !tokensData;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    
    const { totalPages } = tokensData?.metadata || { currentPage: 1, totalPages: 1 };

    return (
        <div className="min-h-screen bg-[#0B0E17] py-12 sm:py-12">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">ALL Tokens</h1>
                        <p className="text-gray-400">Manage and monitor your tokens for blockchain technology.</p>
                    </div>
                    <Link 
                        to="/token/create"
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Token
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search your tokens..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-[#161B28] border-[#1F2937] text-white w-full h-11"
                        />
                    </div>
                </div>

                {/* Agents Grid */}
                <div className='gap-4 py-4 overflow-x-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {filteredTokens.map((token: Token, index: number) => (
                    <TokenCard key={index} token={token} />
                  ))}
                  {filteredTokens.length === 0 && searchQuery && (
                    <div className="flex flex-col items-center justify-center w-full py-8">
                      <p className="text-gray-400 text-sm">No tokens found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>

                {/* Pagination with smaller buttons */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 space-x-1.5">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-[#1F2937] text-gray-400 hover:text-white hover:border-blue-600 h-8 px-3 text-sm"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={p === page ? "default" : "outline"}
                                    onClick={() => setPage(p)}
                                    className={`h-8 w-8 text-sm ${p === page 
                                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                                        : "border-[#1F2937] text-gray-400 hover:text-white hover:border-blue-600"
                                    }`}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="border-[#1F2937] text-gray-400 hover:text-white hover:border-blue-600 h-8 px-3 text-sm"
                        >
                            Next
                        </Button>
                    </div>
                )}

                {tokens.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">
                        You haven't created any tokens yet. Create your first token!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tokens;