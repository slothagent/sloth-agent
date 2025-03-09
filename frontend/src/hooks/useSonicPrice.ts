import { useQuery } from '@tanstack/react-query';

interface SonicPriceData {
  symbol: string;
  price: number;
  timestamp: string;
  source?: 'binance' | 'coingecko' | 'fallback';
}

interface SonicPriceResponse {
  success: boolean;
  data: SonicPriceData;
  error?: string;
  warning?: string;
}

const fetchSonicPrice = async (): Promise<SonicPriceData & { warning?: string }> => {
  const response = await fetch('/api/sonic-price');
  const result: SonicPriceResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch Sonic price');
  }
  
  // Pass along any warning message
  return {
    ...result.data,
    warning: result.warning
  };
};

export const useSonicPrice = () => {
  return useQuery({
    queryKey: ['sonicPrice'],
    queryFn: fetchSonicPrice,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}; 