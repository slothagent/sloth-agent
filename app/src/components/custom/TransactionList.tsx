import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from '@/models/transactions';
import { formatDistance } from 'date-fns';
import Link from 'next/link';

const fetchTransactions = async (page: number): Promise<{ data: Transaction[], total: number }> => {
  const response = await fetch(`/api/transactions?page=${page}&limit=10`);
  const result = await response.json();
  return {
    data: result.data,
    total: result.total
  };
};

const TransactionList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const result = await fetchTransactions(currentPage);
        setTransactions(result.data);
        setTotalTransactions(result.total);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [currentPage]);

  const formatAddress = (address: string | undefined | null) => {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Transactions</h2>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2 px-2">
        <div>
          TRANSFERS <span className="mx-2">{currentPage} / {Math.ceil(totalTransactions / 10)}</span>
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
            ) : transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No transactions found</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.transactionHash} className="grid grid-cols-12 gap-4 p-4 text-sm hover:bg-[#1C2333] transition-colors duration-200">
                  <div className="col-span-2 text-[#2196F3]">
                    {formatDistance(new Date(tx.timestamp), new Date(), { addSuffix: true })}
                  </div>
                  <Link target='_blank' href={`https://testnet.sonicscan.org/address/${tx.to}`} className="col-span-3 text-gray-400 hover:text-white hover:underline">
                    {formatAddress(tx.to)}
                  </Link>
                  <Link target='_blank' href={`https://testnet.sonicscan.org/token/${tx.from}`} className="col-span-3 text-gray-400 hover:text-white hover:underline">
                    {formatAddress(tx.from)}
                  </Link>
                  <div className={`col-span-1 ${tx.transactionType === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.transactionType}
                  </div>
                  <div className="col-span-1 text-right text-white">
                    {tx.amount ? tx.amount.toFixed(6) : '-'} S
                  </div>
                  <div className="col-span-2 text-right text-white">
                    ${tx.price.toFixed(6)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No transactions found</div>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.transactionHash} className="bg-[#161B28] border-none rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#2196F3] text-sm">
                  {formatDistance(new Date(tx.timestamp), new Date(), { addSuffix: true })}
                </span>
                <span className={`text-sm ${tx.transactionType === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.transactionType}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm w-24">From:</span>
                  <span className="text-gray-400 text-sm font-mono">
                    {formatAddress(tx.to)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm w-24">To:</span>
                  <span className="text-gray-400 text-sm font-mono">
                    {formatAddress(tx.from)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <div className="text-white text-sm">
                    Amount: {tx.amount}
                  </div>
                  <div className="text-white text-sm">
                    ${tx.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination - Responsive for both views */}
      <div className="flex items-center justify-between p-4 mt-4 bg-[#161B28] rounded-lg">
        <Button
          variant="outline"
          className="text-gray-400 hover:bg-[#1C2333] text-sm"
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