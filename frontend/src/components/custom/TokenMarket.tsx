import { Twitter, Globe, Search, Minus, Plus } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { Button } from '../ui/button'
import { useRouter } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { useTokensData } from '../../hooks/useWebSocketData'
import { Token } from '../../models'
import { formatNumber } from '../../utils/utils'
import { useQuery } from '@tanstack/react-query'
import { useEthPrice } from '../../hooks/useEthPrice'
import { useSonicPrice } from '../../hooks/useSonicPrice'
import { INITIAL_SUPPLY } from '../../lib/contants'
import TokenCard from './TokenCard'

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

export default function TokenMarket() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const { tokens, loading: tokensLoading } = useTokensData();
  const [defaultVisible, setDefaultVisible] = useState(1);


  useEffect(() => {
    const handleResize = () => {
      setDefaultVisible(window.innerWidth < 768 ? 3 : 13);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const {data: tokensData, isLoading: tokensDataLoading} = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token?page=1&pageSize=10`);
      const result = await response.json();
      return result.data;
    }
  });

  const isLoading = (tokensLoading || tokensDataLoading) && !tokens && !tokensData;

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

  const categories = [
    'All',
    'Investment DAO',
    'Meme',
    'Gaming',
    'Entertainment',
    'AI',
  ]

  
  if (isLoading) {
    return (
      <div className="flex flex-col pt-6">
        <div className="flex items-center justify-between">
          <p className="text-white text-2xl font-bold">Tokens Market</p>
        </div>
        <div className="flex gap-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[300px] h-[200px] bg-[#161B28] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pt-6">
      <div className='flex items-center justify-between'>
        <p className='text-white text-2xl font-bold'>
          Token Market
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            className="text-gray-400 hover:bg-[#1C2333] hover:text-white text-sm bg-transparent rounded-none cursor-pointer"
            onClick={() => router.navigate({to: '/token'})}
          >
            View More
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 mb-2 rounded-lg">
        <div className="relative flex-1">
          <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type="text"
            value={searchQuery}
            placeholder="Search tokens by name and ticker"
            className="w-full pl-10 pr-4 py-3 bg-[#1C2333] border-none rounded-none text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className='py-4 border-b border-gray-800'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-wrap gap-2'>
          {categories
            .slice(0, showAllCategories ? categories.length : defaultVisible)
            .map((category) => (
              <button
                key={category}
                className="px-4 py-1.5 text-sm text-gray-400 border border-gray-800 hover:bg-[#1C2333] transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
          <div className='md:hidden flex items-center'>
            <Button 
              variant="outline" 
              className="text-gray-400 hover:bg-[#1C2333] hover:text-white` text-sm"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? <Minus size={16} /> : <Plus size={16} />}
            </Button>
          </div>
        </div>
      </div>
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
    </div>
  )
}
