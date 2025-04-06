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
import { Loader2 } from 'lucide-react'
import { INITIAL_SUPPLY } from '../../lib/contants'
import clsx from 'clsx'

const formatLaunchDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
  } catch (error) {
    console.error('Invalid date:', dateString)
    return 'N/A'
  }
}

const TokenCard = ({ token }: { token: Token }) => {
  const router = useRouter();
  const fetchTransactions = async (tokenAddress: string) => {
    const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/transaction?tokenAddress=${tokenAddress}&timeRange=30d`);
    const result = await response.json();
    return result.data;
  }

  const { data: sonicPriceData } = useSonicPrice();
  const { data: ethPriceData } = useEthPrice();
  // Get the ETH price for calculations, fallback to 2500 if not available
  const ethPrice = useMemo(() => {
    return ethPriceData?.price || 2500;
  }, [ethPriceData]);
  
  const sonicPrice = useMemo(() => {
    return sonicPriceData?.price || 0.7;
  }, [sonicPriceData]);

  const { data: transactionsData } = useQuery({
      queryKey: ['transactions', token?.address],
      queryFn: () => fetchTransactions(token?.address)
  });

  const transactions = useMemo(() => {
    if (!transactionsData) return [];
    return transactionsData
  }, [transactionsData]);


  // console.log(totalCirculatingSupply)

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

  const truncateDescription = (description: string) => {
    if (description.length > 50) {
      return description.substring(0, 50) + '...';
    }
    return description;
  }

  return (
    <div onClick={() => router.navigate({to: `/token/${token.address}`})} className='cursor-pointer'>
      <div className="bg-[#161B28] p-4 hover:bg-[#1C2333] min-w-[300px] transition-colors flex flex-col md:border-b border-gray-600">
        <div className="flex items-start gap-2">
          <img
            src={token.imageUrl || ''}
            alt={token.name}
            width={48}
            height={48}
            className="rounded-none w-12 h-12 object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-col">
              <h3 className="font-semibold text-white">{token.name}</h3>
              <span className="text-sm text-gray-400">({token.ticker})</span>
            </div>

            <div className="flex gap-2 mt-1">
              {token.twitterUrl && (
                <a href={token.twitterUrl} className="text-gray-400 hover:text-white">
                  <Twitter size={16} />
                </a>
              )}
              {token.websiteUrl && (
                <a href={token.websiteUrl} className="text-gray-400 hover:text-white">
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>
          <img alt="Chain" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="w-6" src={ token?.network == "Sonic" ? "https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" : "/assets/chains/a8.png"} style={{ color: 'transparent' }} />
        </div>

        <div className="mt-4 md:mt-0 flex-1 flex flex-col">
          <p className="text-sm text-gray-400 mb-auto">{truncateDescription(token.description || '')}</p>
          
          <div className="mt-4 md:mt-0">
            <div className="flex justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-blue-500 text-xs">MARKET CAP</span>
                <span className="text-white text-xs">$ {formatNumber(totalMarketCapToken)}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400 text-xs">LAUNCH TIME</span>
                <span className="text-gray-400 text-xs">{formatLaunchDate(token.createdAt?.toString())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const { tokens, loading: tokensLoading } = useTokensData()
  const [defaultVisible, setDefaultVisible] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const handleResize = () => {
      setDefaultVisible(window.innerWidth < 768 ? 3 : 13)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { data: tokensData, isLoading: tokensDataLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token?page=1&pageSize=10`)
      const result = await response.json()
      return result.data
    }
  })

  const filteredTokens = useMemo(() => {
    const sourceTokens = tokens?.length ? tokens : (tokensData || [])

    let result = !searchQuery
      ? [...sourceTokens]
      : sourceTokens.filter((token: Token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
        )

    if (searchQuery) {
      result = sortTokensByPriority(result, searchQuery.toLowerCase())
    } else {
      result.sort((a: Token, b: Token) => {
        return new Date(b.createdAt?.toString() || '').getTime() -
               new Date(a.createdAt?.toString() || '').getTime()
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

  const visibleTokens = useMemo(() => {
    return selectedCategory === 'All'
      ? filteredTokens
      : filteredTokens.filter((token: Token) =>
          token.categories?.includes(selectedCategory)
        )
  }, [filteredTokens, selectedCategory])
  
  return (
    <div className="flex flex-col pt-6 w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-white text-2xl font-bold">All Tokens</p>
      </div>

      <div className="py-4 border-b border-gray-800 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-wrap gap-4">
            {categories
              .slice(0, showAllCategories ? categories.length : defaultVisible)
              .map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={clsx(
                    'px-2 py-1.5 text-sm border border-gray-800 hover:bg-[#1C2333] transition-colors',
                    selectedCategory === category ? 'text-white bg-[#1C2333]' : 'text-gray-400'
                  )}
                >
                  {category}
                </button>
              ))}
            <button
              onClick={() => router.navigate({ to: '/token/create' })}
              className="flex items-center text-wrap gap-2 px-6 py-2 text-sm bg-blue-500 border border-[#1F2937] text-white hover:bg-blue-400 hover:text-white cursor-pointer"
            >
              Create New Token
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <Button
              variant="outline"
              className="text-gray-400 bg-[#161B28] hover:bg-[#1C2333] hover:text-white text-sm"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? <Minus size={16} /> : <Plus size={16} />}
            </Button>
          </div>
        </div>
      </div>

      <div className="gap-4 pt-0 max-h-[490px] overflow-y-auto">
        {tokensDataLoading && (
          <div className="flex flex-row items-center gap-2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            <p className="text-gray-400 text-sm">Loading tokens...</p>
          </div>
        )}

        {!tokensDataLoading &&
          visibleTokens.slice(0, 4).map((token: Token, index: number) => (
            <TokenCard key={index} token={token} />
          ))}
      </div>
    </div>
  )
}
