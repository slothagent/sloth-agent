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
import { tokenAbi } from '../../abi/tokenAbi'
import { configSonicBlaze } from '../../config/wagmi'
import { configAncient8 } from '../../config/wagmi'
import { useCalculateBin } from '../../hooks/useCalculateBin'
import { useReadContract } from 'wagmi'
import { ethers } from 'ethers'

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
  const { calculateMarketCap } = useCalculateBin();

  const { data: totalSupply } = useReadContract({
    address: token?.address as `0x${string}`,
    abi: tokenAbi,
    functionName: 'totalSupply',
    config: token?.network == "Sonic" ? configSonicBlaze : configAncient8
  });

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

  const totalCirculatingSupply = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc: number, tx: any) => {
      // Add for buy transactions, subtract for sell transactions
      if (tx.transactionType.toLowerCase() === 'buy') {
        return acc + Number(tx.amountToken);
      } else if (tx.transactionType.toLowerCase() === 'sell') {
        return acc - Number(tx.amountToken);
      }
      return acc; // For other transaction types, don't change the accumulator
    }, 0);
  }, [transactions]);

  // console.log(totalCirculatingSupply)

  const totalMarketCapToken = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;

    // Determine which network to use for base price
    const ancient8Transactions = transactions.filter((tx: any) => tx.network === 'Ancient8');
    const sonicTransactions = transactions.filter((tx: any) => tx.network === 'Sonic');
    
    let basePrice = 0;
    
    // Use the latest price from transactions as the base price
    if (ancient8Transactions.length > 0) {
      const lastTransaction = ancient8Transactions[0];
      basePrice = lastTransaction?.price * ethPrice; // Convert to USD
    } else if (sonicTransactions.length > 0) {
      const lastTransaction = sonicTransactions[0];
      basePrice = lastTransaction?.price * sonicPrice; // Convert to USD
    }
    
    if (basePrice === 0) return 0;
    // console.log("basePrice", basePrice);
    // console.log("totalSupply", ethers.formatEther(totalSupply || BigInt(0)));
    // Calculate market cap at the last bin (for Metropolis migration)
    const { requiredMarketCap } = calculateMarketCap(Number(ethers.formatEther(totalSupply || BigInt(0))), basePrice);
    // console.log("requiredMarketCap", requiredMarketCap);
    return requiredMarketCap;
  }, [transactions, ethPrice, sonicPrice, calculateMarketCap]);

  const truncateDescription = (description: string) => {
    if (description.length > 50) {
      return description.substring(0, 50) + '...';
    }
    return description;
  }

  return (
    <div onClick={() => router.navigate({to: `/token/${token.address}`})} className='cursor-pointer'>
      <div className="bg-[#161B28] p-4 hover:bg-[#1C2333] min-w-[300px] h-full transition-colors flex flex-col">
        <div className="flex items-start gap-4">
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

        <div className="mt-4 flex-1 flex flex-col">
          <p className="text-sm text-gray-400 mb-auto">{truncateDescription(token.description || '')}</p>
          
          <div className="mt-4">
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
          
          {/* <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-blue-500"
                style={{ 
                  width: `${(Number(Number(transactions[transactions.length - 1]?.fundingRaised))/22700)*100}%`,
                  background: `linear-gradient(90deg, #161B28 0%, rgb(59 130 246) 100%)`
                }}
              />
            </div>
            <span className="text-blue-500 text-sm mt-1 block">{((Number(Number(transactions[transactions.length - 1]?.fundingRaised))/22700)*100).toFixed(2)}%</span>
          </div> */}
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
          All Tokens
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
      {/* <div className="flex items-center gap-4 mt-4 mb-2 rounded-lg">
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
      </div> */}
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
        {filteredTokens.slice(0, 4).map((token: Token, index: number) => (
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
