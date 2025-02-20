import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

interface Transaction {
  id: string;
  timestamp: string;
  from: {
    address: string;
    name?: string;
    icon?: string;
  };
  to: {
    address: string;
    name?: string;
    icon?: string;
  };
  value: number;
  token: {
    symbol: string;
    icon?: string;
  };
  usdValue: number;
}

const fetchTransactions = async (page: number): Promise<{ data: Transaction[], total: number }> => {
  // TODO: Replace with actual API call
  return {
    data: [],
    total: 0
  };
};

const TransactionList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(625);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', currentPage],
    queryFn: () => fetchTransactions(currentPage),
    staleTime: 30000,
  });

  const transactions = data?.data || [];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = () => 'just now'; // TODO: Implement proper time formatting

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl text-gray-400">FILTER FOR TRANSFERS</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[#6200EA] text-white hover:bg-[#7C4DFF] rounded px-3 py-1">
            ALL
          </Button>
          <Button variant="outline" className="bg-[#161B28] text-gray-400 hover:bg-[#1C2333] rounded px-3 py-1">
            USD {'>'} $1
          </Button>
          <Button variant="outline" className="bg-[#161B28] text-gray-400 hover:bg-[#1C2333] rounded px-3 py-1">
            SORT BY TIME
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-2 px-2">
        <div>
          TRANSFERS <span className="mx-2">1 / {totalTransactions}</span>
        </div>
      </div>

      <Card className="bg-[#161B28] border-none rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 text-sm text-gray-400 border-b border-gray-800">
          <div className="col-span-1">TIME</div>
          <div className="col-span-4">FROM</div>
          <div className="col-span-4">TO</div>
          <div className="col-span-1 text-right">VALUE</div>
          <div className="col-span-1 text-right">TOKEN</div>
          <div className="col-span-1 text-right">USD</div>
        </div>

        <div className="divide-y divide-gray-800">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No transactions found</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 text-sm hover:bg-[#1C2333] transition-colors duration-200">
                <div className="col-span-1 text-[#2196F3]">{formatTime()}</div>
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    {tx.from.icon && (
                      <Image
                        src={tx.from.icon}
                        alt={tx.from.name || 'From'}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-gray-400">
                      {tx.from.name || formatAddress(tx.from.address)}
                    </span>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    {tx.to.icon && (
                      <Image
                        src={tx.to.icon}
                        alt={tx.to.name || 'To'}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-gray-400">
                      {tx.to.name || formatAddress(tx.to.address)}
                    </span>
                  </div>
                </div>
                <div className="col-span-1 text-right text-white">{tx.value}</div>
                <div className="col-span-1 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {tx.token.icon && (
                      <Image
                        src={tx.token.icon}
                        alt={tx.token.symbol}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-white">{tx.token.symbol}</span>
                  </div>
                </div>
                <div className="col-span-1 text-right text-white">${tx.usdValue}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <Button
            variant="outline"
            className="text-gray-400 hover:bg-[#1C2333]"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-gray-400">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            className="text-gray-400 hover:bg-[#1C2333]"
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TransactionList; 