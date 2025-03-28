import { useMemo, useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Transaction } from '../../models';
import { useQuery } from '@tanstack/react-query';
import TableTransaction from './TableTransaction';
import { useSonicPrice } from '../../hooks/useSonicPrice';
import { useEthPrice } from '../../hooks/useEthPrice';
import axios from 'axios';
import { useAllTransactionsData } from '../../hooks/useWebSocketData';

const fetchTransactions = async (page: number): Promise<{ data: Transaction[], total: number }> => {
  const response = await axios.get(`${import.meta.env.PUBLIC_API_NEW}/api/transaction?page=${page}&limit=10`);
  const result = await response.data;
  return {
    data: result.data,
    total: result.metadata.totalCount
  };
};

const TransactionList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  
  const { transactions: transactionsData30d } = useAllTransactionsData('30d');
  const { data: sonicPriceData } = useSonicPrice();
  const { data: ethPriceData } = useEthPrice();

  const ethPrice = useMemo(() => {
    return ethPriceData?.price || 2500;
  }, [ethPriceData]);
  
  const sonicPrice = useMemo(() => {
    return sonicPriceData?.price || 0.7;
  }, [sonicPriceData]);

  // Only fetch from API when needed (initial load or page change)
  const { data: apiTransactionsData, isLoading } = useQuery({
    queryKey: ['transactions', currentPage],
    queryFn: () => fetchTransactions(currentPage),
    enabled: !transactionsData30d?.length // Only fetch if we don't have WebSocket data
  });

  // Combine and manage transactions from both sources
  useEffect(() => {
    if (transactionsData30d?.length) {
      // Use WebSocket data when available
      const startIdx = (currentPage - 1) * 10;
      const endIdx = startIdx + 10;
      setDisplayedTransactions(transactionsData30d.slice(startIdx, endIdx));
      setTotalItems(transactionsData30d.length);
    } else if (apiTransactionsData) {
      // Fallback to API data
      setDisplayedTransactions(apiTransactionsData.data);
      setTotalItems(apiTransactionsData.total);
    }
  }, [currentPage, transactionsData30d, apiTransactionsData]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / 10);
  }, [totalItems]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Transactions</h2>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2 px-2">
        <div>
          TRANSFERS <span className="mx-2">{currentPage} / {totalPages}</span>
        </div>
      </div>

      {/* Desktop View - Hidden on mobile */}
      <div className='w-full  '>
        <Card className="bg-[#161B28] border-none rounded-none w-full">
          <div className='overflow-x-auto'>
            <div className="grid grid-cols-12 gap-2 p-4 text-sm text-gray-400 border-b border-gray-800 min-w-[1536px]">
              <div className="col-span-1">CHAIN</div>
              <div className="col-span-1">TIME</div>
              <div className="col-span-2">HASH</div>
              <div className="col-span-2">FROM</div>
              <div className="col-span-2">TO</div>
              <div className="col-span-1">ACTION</div>
              <div className="col-span-1 text-right">AMOUNT</div>
              <div className="col-span-1 text-right">TOKEN</div>
              <div className="col-span-1 text-right">USD</div>
            </div>
          </div>
          <div className="divide-y divide-gray-800">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Loading transactions...</div>
            ) : displayedTransactions?.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No transactions found</div>
            ) : (
              displayedTransactions?.map((tx) => (
                <TableTransaction key={tx.transactionHash} tx={tx} ethPrice={ethPrice} sonicPrice={sonicPrice} />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Pagination - Responsive for both views */}
      <div className="flex items-center justify-between p-4 mt-4 bg-[#161B28] rounded-none">
        <Button
          variant="outline"
          className="text-gray-400 hover:bg-[#1C2333] hover:text-white text-sm bg-transparent rounded-none cursor-pointer"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="text-gray-400 text-xs sm:text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          className="text-gray-400 hover:bg-[#1C2333] hover:text-white text-sm bg-transparent rounded-none cursor-pointer"
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TransactionList; 