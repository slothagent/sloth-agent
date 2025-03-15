import { Twitter, Globe} from 'lucide-react'
import { formatDistance } from 'date-fns'
import { useState, useMemo, useEffect } from 'react'
import { Token } from '../../models'
import { formatNumber } from '../../utils/utils'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEthPrice } from '../../hooks/useEthPrice'
import { useSonicPrice } from '../../hooks/useSonicPrice'
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
                  <span className="text-blue-500 text-xs">TOTAL MARKET CAP</span>
                  <span className="text-white text-xs">$ {formatNumber(totalMarketCapToken)}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs">LAUNCH TIME</span>
                  <span className="text-gray-400 text-xs">{formatLaunchDate(token.createdAt?.toString())}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
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
            </div>
          </div>
        </div>
      </div>
    )
  }
  export default TokenCard;