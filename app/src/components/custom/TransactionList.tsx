import { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from '@/models/transactions';
import { formatDistance } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import TableTransaction from './TableTransaction';
import { useSonicPrice } from '@/hooks/useSonicPrice';
import { useEthPrice } from '@/hooks/useEthPrice';

const fetchTransactions = async (page: number): Promise<{ data: Transaction[], total: number }> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_NEW}/api/transaction?page=${page}&limit=10`);
  const result = await response.json();
  return {
    data: result.data,
    total: result.total
  };
};

const TransactionList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const { data: sonicPriceData, isLoading: sonicPriceLoading } = useSonicPrice();
  const { data: ethPriceData, isLoading: ethPriceLoading } = useEthPrice();

  // Get the ETH price for calculations, fallback to 2500 if not available
  const ethPrice = useMemo(() => {
    return ethPriceData?.price || 2500;
  }, [ethPriceData]);
  
  const sonicPrice = useMemo(() => {
    return sonicPriceData?.price || 0.7;
  }, [sonicPriceData]);

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', currentPage],
    queryFn: () => fetchTransactions(currentPage),
    refetchInterval: 10000
  });


  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Transactions</h2>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2 px-2">
        <div>
          TRANSFERS <span className="mx-2">{currentPage} / {Math.ceil(totalTransactions+1 / 10)}</span>
        </div>
      </div>

      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block">
        <Card className="bg-[#161B28] border-none rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm text-gray-400 border-b border-gray-800">
            <div className="col-span-2">TIME</div>
            <div className="col-span-3">FROM</div>
            <div className="col-span-3">TO</div>
            <div className="col-span-1">ACTION</div>
            <div className="col-span-1 text-right">AMOUNT</div>
            <div className="col-span-2 text-right">PRICE</div>
          </div>

          <div className="divide-y divide-gray-800">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Loading transactions...</div>
            ) : transactionsData?.data?.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No transactions found</div>
            ) : (
              transactionsData?.data?.map((tx) => (
                <TableTransaction key={tx.transactionHash} tx={tx} ethPrice={ethPrice} sonicPrice={sonicPrice} />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Pagination - Responsive for both views */}
      <div className="flex items-center justify-between p-4 mt-4 bg-[#161B28] rounded-lg">
        <Button
          variant="outline"
          className="text-gray-400 hover:bg-[#1C2333] hover:text-white text-sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="text-gray-400 text-xs sm:text-sm">
          Page {currentPage} of {Math.ceil(totalTransactions / 10)}
        </span>
        <Button
          variant="outline"
          className="text-gray-400 hover:bg-[#1C2333] hover:text-white text-sm"
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage >= Math.ceil(totalTransactions / 10) || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TransactionList; 