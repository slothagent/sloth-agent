import Image from 'next/image'
import { Twitter, Globe, Search, Minus, Plus } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Token {
  _id: string
  name: string
  ticker: string
  description: string
  imageUrl: string
  totalSupply: string
  address: string
  curveAddress: string
  owner: string
  createdAt: string
  updatedAt: string
  twitterUrl: string | null
  websiteUrl: string | null
  telegramUrl: string | null
}

const fetchTokens = async () => {
  const response = await fetch('/api/token')
  const result = await response.json()
  return result.data
}

const formatMarketCap = (value?: number) => {
  if (!value) return '$0'
  return `$${value.toLocaleString()}`
}

const formatLaunchDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  try {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
  } catch (error) {
    console.error('Invalid date:', dateString)
    return 'N/A'
  }
}

const formatSupply = (value: string) => {
  // Convert from wei to token amount (divide by 10^18)
  const num = Number(value) / 1e18
  
  // Nếu số nhỏ hơn 1000, giữ nguyên và làm tròn 2 chữ số thập phân
  if (num < 1000) {
    return num.toFixed(2)
  }
  
  // Nếu số lớn hơn hoặc bằng 1000
  const tier = Math.floor(Math.log10(num) / 3)
  if (tier === 0) return num.toFixed(2)
  
  const scale = Math.pow(10, tier * 3)
  const scaled = num / scale
  
  // Giữ lại 2 số thập phân và thêm đơn vị K, M, B, T
  return scaled.toFixed(2).replace(/\.?0+$/, '') + ['', 'K', 'M', 'B', 'T'][tier]
}

const TokenCard = ({ token }: { token: Token }) => {
  return (
    <Link href={`/token/${token.address}`}>
      <div className="bg-[#161B28] p-4 hover:bg-[#1C2333] min-w-[300px] h-full transition-colors">
        <div className="flex items-start gap-4">
          <Image
            src={token.imageUrl}
            alt={token.name}
            width={48}
            height={48}
            className="rounded-lg"
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
                  <span className="text-blue-500">TOTAL SUPPLY</span>
                  <span className="text-blue-500">$ {formatSupply(token.totalSupply)}</span>
              </div>
              <div className="flex flex-col gap-2">
                  <span className="text-gray-400">LAUNCH TIME</span>
                  <span className="text-gray-400">{formatLaunchDate(token.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full"
                style={{ 
                  width: '100%',
                  background: `linear-gradient(90deg, #161B28 0%, rgb(59 130 246) 100%)`
                }}
              />
            </div>
            <span className="text-blue-500 text-sm mt-1 block">100%</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const sortTokensByPriority = (tokens: Token[], query: string) => {
  return [...tokens].sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aTicker = a.ticker.toLowerCase()
    const bTicker = b.ticker.toLowerCase()

    // Priority 1: Tên bắt đầu bằng query
    const aStartsWithName = aName.startsWith(query)
    const bStartsWithName = bName.startsWith(query)
    
    if (aStartsWithName && !bStartsWithName) return -1
    if (!aStartsWithName && bStartsWithName) return 1

    // Priority 2: Ticker bắt đầu bằng query (nếu tên không match)
    if (!aStartsWithName && !bStartsWithName) {
      const aStartsWithTicker = aTicker.startsWith(query)
      const bStartsWithTicker = bTicker.startsWith(query)
      
      if (aStartsWithTicker && !bStartsWithTicker) return -1
      if (!aStartsWithTicker && bStartsWithTicker) return 1
    }

    // Priority 3: Tên chứa query
    const aContainsName = aName.includes(query)
    const bContainsName = bName.includes(query)
    
    if (aContainsName && !bContainsName) return -1
    if (!aContainsName && bContainsName) return 1

    // Priority 4: Ticker chứa query (nếu tên không chứa)
    if (!aContainsName && !bContainsName) {
      const aContainsTicker = aTicker.includes(query)
      const bContainsTicker = bTicker.includes(query)
      
      if (aContainsTicker && !bContainsTicker) return -1
      if (!aContainsTicker && bContainsTicker) return 1
    }

    // Priority 5: Sắp xếp theo thời gian tạo nếu cùng mức độ ưu tiên
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export default function AgentMarket() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['token'],
    queryFn: () => fetchTokens(),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 10 * 1000,
    retry: 1,
  })

  const filteredTokens = useMemo(() => {
    if (!tokens) return []
    if (!searchQuery) return tokens

    const query = searchQuery.toLowerCase()
    const filtered = tokens.filter((token: Token) => 
      token.name.toLowerCase().includes(query) ||
      token.ticker.toLowerCase().includes(query)
    )

    return sortTokensByPriority(filtered, query)
  }, [tokens, searchQuery])

  const categories = [
    'All',
    'Anime',
    'Twitter',
    'Web3',
    'NFT',
    'NSFW',
    'Movies',
    'Games',
    'Assistant',
    'Mascot',
    'Roleplay',
    'Books',
    'Memes',
  ]

  const extraCategories = [
    'Original Characters',
    'Male',
    'Female', 
    'Non-Binary',
    'Non-Human',
    'Action',
    'Fictional',
    'Finance',
    'Politics',
    'Philosophy',
    'Romance',
    'Historical',
    'Horror'
  ]

  const visibleCategories = showAllCategories ? [...categories, ...extraCategories] : categories

  // console.log('Tokens:', tokens)

  if (isLoading) {
    return (
      <div className="flex flex-col pt-6">
        <div className="flex items-center justify-between">
          <p className="text-white text-2xl font-bold">Tokens Market</p>
        </div>
        <div className="flex gap-4 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
            className="text-gray-400 hover:bg-[#1C2333] hover:text-white text-sm"
            onClick={() => router.push('/token')}
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
            className="w-full pl-10 pr-4 py-3 bg-[#1C2333] border-none rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className='py-4 border-b border-gray-800'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-wrap gap-2'>
            {visibleCategories.map((category) => (
              <button
                key={category}
                className="px-4 py-1.5 text-sm text-gray-400 border border-gray-800 hover:bg-[#1C2333] transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
          <div className='flex items-center'>
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
          <div key={`${token._id}-${index}`} className="flex-shrink-0">
            <TokenCard token={token} />
          </div>
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
