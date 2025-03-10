import { Twitter, Globe, Search, Minus, Plus } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { Button } from '../ui/button'
import { useRouter } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { useTokensData } from '../../hooks/useWebSocketData'
import { Token } from '../../models'
import { formatNumber } from '../../utils/utils'
import { useReadContract } from 'wagmi'
import { bondingCurveAbi } from '../../abi/bondingCurveAbi'
import { useQuery } from '@tanstack/react-query'
import { useEthPrice } from '../../hooks/useEthPrice'
import { useSonicPrice } from '../../hooks/useSonicPrice'
import { configAncient8, configSonicBlaze } from '../../config/wagmi'
import { INITIAL_SUPPLY } from '../../lib/contants'

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
  // console.log(`transactionsData: ${token?.address}`,formatNumber(Number(transactions.reduce((acc: number, curr: any) => acc + curr.marketCap, 0))/10**18))
  
  const {data: fundingRaised} = useReadContract({
    address: token?.curveAddress as `0x${string}`,
    abi: bondingCurveAbi,
    functionName: 'fundingRaised',
    args: [],
    config: transactions[0]?.network === 'Ancient8' ? configAncient8 : configSonicBlaze
  });

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

  return (
    <a href={`/token/${token.address}`}>
      <div className="bg-[#161B28] p-4 hover:bg-[#1C2333] min-w-[300px] h-full transition-colors">
        <div className="flex items-start gap-4">
          <img
            src={token.imageUrl || ''}
            alt={token.name}
            width={48}
            height={48}
            className="rounded-none"
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
        </div>

        <div className="mt-4">
          <div className="flex flex-col justify-between gap-5 text-sm mb-1">
            <p className="text-sm text-gray-400 mt-2">{token.description}</p>
            <div className="flex gap-2 justify-between">
              <div className="flex flex-col gap-2">
                  <span className="text-blue-500">TOTAL MARKET CAP</span>
                  <span className="text-blue-500">$ {formatNumber(totalMarketCapToken)}</span>
              </div>
              <div className="flex flex-col gap-2">
                  <span className="text-gray-400">LAUNCH TIME</span>
                  <span className="text-gray-400">{formatLaunchDate(token.createdAt?.toString())}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full"
                style={{ 
                  width: `${(Number(formatNumber(Number(fundingRaised)/10**18))/22700)*100}%`,
                  background: `linear-gradient(90deg, #161B28 0%, rgb(59 130 246) 100%)`
                }}
              />
            </div>
            <span className="text-blue-500 text-sm mt-1 block">{parseFloat((Number(formatNumber(Number(fundingRaised)/10**18))/22700*100).toFixed(2))}%</span>
          </div>
        </div>
      </div>
    </a>
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
  const { tokens, loading: tokensLoading } = useTokensData();
  const [defaultVisible, setDefaultVisible] = useState(1);


  useEffect(() => {
    // Kiểm tra kích thước màn hình để set số lượng category hiển thị
    const handleResize = () => {
      setDefaultVisible(window.innerWidth < 768 ? 3 : 13); // Mobile: 3, Desktop: 1
    };

    handleResize(); // Gọi ngay lần đầu
    window.addEventListener("resize", handleResize); // Lắng nghe sự kiện resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);


  const {data: tokensData, isLoading: tokensDataLoading} = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token?page=1&pageSize=10`);
      const result = await response.json();
      return result.data;
    }
  });

  // Show loading state when both sources are loading and no data is available yet
  const isLoading = (tokensLoading || tokensDataLoading) && !tokens && !tokensData;

  const filteredTokens = useMemo(() => {
    // Use tokensData if tokens is not available
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

  
  // console.log('Tokens:', tokens)

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
      <div className='flex gap-4 py-4 overflow-x-auto'>
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
