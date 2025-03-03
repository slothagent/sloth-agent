import { TableCell, TableRow } from "../ui/table";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Transaction } from "@/models/transactions";
import { formatNumber } from "@/utils/utils";

interface TableTokenProps {
    token: any;
}


const TableToken = ({ token }: TableTokenProps) => {
    const router = useRouter();

    const fetchTransactions = async (tokenAddress: string) => {
        const response = await fetch(`/api/transactions?tokenAddress=${tokenAddress}&timeRange=30d`);
        const result = await response.json();
        return result.data;
    }

    const { data: transactionsData } = useQuery({
        queryKey: ['transactions', token?.address],
        queryFn: () => fetchTransactions(token?.address),
        refetchInterval: 1000
    });
    
    // console.log(transactionsData);

    const transactions24h = useMemo(() => {
        if (!transactionsData) return { total: 0, buys: 0, sells: 0 };
        
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const last24hTxs = transactionsData.filter((tx: Transaction) => 
            new Date(tx.timestamp) >= oneDayAgo
        );

        const buys = last24hTxs.filter((tx: Transaction) => tx.transactionType === 'BUY').length;
        const sells = last24hTxs.filter((tx: Transaction) => tx.transactionType === 'SELL').length;

        return {
            total: last24hTxs.length,
            buys,
            sells
        };
    }, [transactionsData]);

    const totalHolders = useMemo(() => {
        if (!transactionsData) return 0;
        
        // Create a map to track unique addresses
        const uniqueHolders = new Set<string>();
        
        transactionsData.forEach((tx: Transaction) => {
            if (tx.transactionType === 'BUY') {
                uniqueHolders.add(tx.to);
            }
        });

        return uniqueHolders.size;
    }, [transactionsData]);

    const totalVolume = useMemo(() => {
        if (!transactionsData) return 0;
        
        return transactionsData.reduce((total: number, tx: Transaction) => {
            return total + (tx.totalValue || 0);
        }, 0);
    }, [transactionsData]);

    const volume24h = useMemo(() => {
        if (!transactionsData) return 0;
        
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const last24hTxs = transactionsData.filter((tx: Transaction) => 
            new Date(tx.timestamp) >= oneDayAgo
        );

        return last24hTxs.reduce((total: number, tx: Transaction) => {
            return total + (tx.totalValue || 0);
        }, 0);
    }, [transactionsData]);

    const totalMarketCap = useMemo(() => {
        if (!transactionsData) return 0;
        return transactionsData.reduce((acc: number, curr: any) => acc + curr.marketCap, 0);
      }, [transactionsData]);

    return (
        <TableRow 
            key={token._id?.toString() || ''} 
            className="border-b border-gray-800 text-white hover:bg-[#1C2333] cursor-pointer transition-colors duration-200"
            onClick={() => router.push(`/token/${token.address}`)}
        >
            <TableCell>
            <div className="flex items-center gap-2">
                <img 
                    src={token.imageUrl || ''} 
                    alt={token.name} 
                    width={32} 
                    height={32} 
                    className="rounded-lg"
                />
                <div className="flex flex-col min-w-0">
                <span className="font-medium truncate text-white">{token.name}</span>
                <span className="text-sm text-gray-400 truncate">{token.curveAddress.slice(0, 6)}...{token.curveAddress.slice(-4)}</span>
                </div>
            </div>
            </TableCell>
            <TableCell className="text-gray-400">{timeAgo(token.createdAt)}</TableCell>
            <TableCell className="text-right">
            <div className="text-white">{token.metrics?.liquidityAmount||"-"} 🔥</div>
            <div className="text-sm text-gray-400">{token.metrics?.liquidityValue||"-"}</div>
            </TableCell>
            <TableCell className="text-right text-white">{token.metrics?.blueChipHolding||"-"}</TableCell>
            <TableCell className="text-right">
                <div className="text-white">{totalHolders||"-"}</div>
            </TableCell>
            <TableCell className="text-right">
            <div className="text-white">{token.metrics?.smartMoneyValue||"-"}</div>
            <div className="text-sm text-gray-400">{token.metrics?.smartMoneyKol||"-"} KOL</div>
            </TableCell>
            <TableCell className="text-right">
                <div className="text-white">{transactionsData?.length||"-"}</div>
                <div className="text-sm text-gray-400">{transactions24h.buys||"-"}/{transactions24h.sells||"-"}</div>
            </TableCell>
            <TableCell className="text-right text-white">
                ${volume24h ? volume24h.toFixed(2) : "-"}
            </TableCell>
            <TableCell className="text-right text-white">${transactionsData?.[transactionsData?.length - 1]?.price?.toFixed(6)||"-"}</TableCell>
            <TableCell className="text-right">
                <span className={token.metrics?.priceChange1m && Number(token.metrics.priceChange1m) > 0 ? 'text-green-400' : 'text-red-400'}>
                    {token.metrics?.priceChange1m||"-"}
                </span>
            </TableCell>
            <TableCell className="text-right text-white">
                ${formatNumber(Number(totalMarketCap)/10**18)}
            </TableCell>
            <TableCell className="text-right text-white">
                ${totalVolume ? totalVolume.toFixed(2) : "-"}
            </TableCell>
            <TableCell className="text-right text-white">{token.metrics?.followersCount||"-"}</TableCell>
            <TableCell className="text-center text-white">{token.metrics?.topTweetsCount||"-"}</TableCell>
        </TableRow>
    )
}

export default TableToken;