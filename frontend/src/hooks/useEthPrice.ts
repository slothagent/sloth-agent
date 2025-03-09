import { useQuery } from '@tanstack/react-query';

interface EthPriceData {
  symbol: string;
  price: number;
  timestamp: string;
  source?: 'binance' | 'coingecko' | 'fallback';
}

interface EthPriceResponse {
  success: boolean;
  data: EthPriceData;
  error?: string;
  warning?: string;
}

const fetchEthPrice = async (): Promise<EthPriceData & { warning?: string }> => {
  const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/binance-eth-price`);
  const result: EthPriceResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch ETH price');
  }
  
  // Pass along any warning message
  return {
    ...result.data,
    warning: result.warning
  };
};

export const useEthPrice = () => {
  return useQuery({
    queryKey: ['ethPrice'],
    queryFn: fetchEthPrice,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}; 