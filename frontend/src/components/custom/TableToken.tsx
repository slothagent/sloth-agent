import { TableCell, TableRow } from "../ui/table";
import { useRouter } from "@tanstack/react-router";
import { timeAgo } from "../../utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Transaction } from "../../models/transactions";
import { formatNumber } from "../../utils/utils";
import { INITIAL_SUPPLY } from "../../lib/contants";

interface TableTokenProps {
    token: any;
    ethPrice: number;
    sonicPrice: number;
}


const TableToken = ({ token, ethPrice, sonicPrice }: TableTokenProps) => {
    const router = useRouter();

    const fetchTransactions = async (tokenAddress: string) => {
        const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/transaction?tokenAddress=${tokenAddress}&timeRange=30d`);
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
    
        const uniqueHolders = new Set<string>();
        
        transactionsData.forEach((tx: Transaction) => {
            if (tx.transactionType === 'BUY') {
                uniqueHolders.add(tx.to);
            }
        });

        return uniqueHolders.size;
    }, [transactionsData]);


    const totalVolumeToken = useMemo(() => {
        if (!transactionsData) return 0;
        const ancient8Transactions = transactionsData.filter((tx: any) => tx.network === 'Ancient8');
        const ancient8Volume = ancient8Transactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * ancient8Transactions[ancient8Transactions.length - 1]?.price * ethPrice;
        const sonicTransactions = transactionsData.filter((tx: any) => tx.network === 'Sonic');
        const sonicVolume = sonicTransactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * sonicTransactions[sonicTransactions.length - 1]?.price * sonicPrice;
        return ancient8Volume || sonicVolume;
    }, [transactionsData]);

    const totalVolume24h = useMemo(() => {
        if (!transactionsData) return 0;
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const last24hTxs = transactionsData.filter((tx: Transaction) => 
            new Date(tx.timestamp) >= oneDayAgo
        );
        const ancient8Transactions = last24hTxs.filter((tx: any) => tx.network === 'Ancient8');
        const ancient8Volume = ancient8Transactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * ancient8Transactions[ancient8Transactions.length - 1]?.price * ethPrice;
        const sonicTransactions = last24hTxs.filter((tx: any) => tx.network === 'Sonic');
        const sonicVolume = sonicTransactions.reduce((acc: number, curr: any) => acc + curr.amountToken, 0) * sonicTransactions[sonicTransactions.length - 1]?.price * sonicPrice;
        return ancient8Volume || sonicVolume;
    }, [transactionsData]);

    // console.log(totalVolume24h);

    return (
        <TableRow 
            key={token._id?.toString() || ''} 
            className="border-b border-gray-800 text-white hover:bg-[#1C2333] cursor-pointer transition-colors duration-200"
            onClick={() => router.navigate({to: `/token/${token.address}`})}
        >
            <TableCell>
            <div className="flex items-center gap-2">
                <img 
                    src={token.imageUrl || ''} 
                    alt={token.name} 
                    width={32} 
                    height={32} 
                    className="rounded-none"
                />
                <div className="flex flex-col min-w-0">
                <span className="font-medium truncate text-white">{token.name}</span>
                <span className="text-sm text-gray-400 truncate">{token.curveAddress.slice(0, 6)}...{token.curveAddress.slice(-4)}</span>
                </div>
            </div>
            </TableCell>
            <TableCell className="text-gray-400">{timeAgo(token.createdAt)}</TableCell>
            <TableCell className="text-gray-400">
                <img alt="Chain" loading="lazy" width="16" height="16" decoding="async" data-nimg="1" className="w-5" src={ token.network == "Sonic" ? "https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" : "/assets/chains/a8.png"} style={{ color: 'transparent' }} />
            </TableCell>
            <TableCell className="text-center">
                <div className="text-white">{"-"}</div>
            </TableCell>
            <TableCell className="text-right">
                <div className="text-white">{totalHolders||"-"}</div>
            </TableCell>
            <TableCell className="text-right">
                <div className="text-white">{transactionsData?.length||"-"}</div>
                <div className="text-sm text-gray-400"><span className="text-green-500">{transactions24h.buys||"-"}</span>/<span className="text-red-500">{transactions24h.sells||"-"}</span></div>
            </TableCell>
            <TableCell className="text-center">
                <div className="text-white">${formatNumber(totalVolume24h)}</div>
            </TableCell>
            <TableCell className="text-right text-white">
                ${transactionsData?.[0]?.price ? (transactionsData?.[0]?.price*(transactionsData?.[0]?.network === 'Ancient8' ? ethPrice : sonicPrice)).toFixed(8) : "-"} 
            </TableCell>
            <TableCell className="text-right text-white">${transactionsData?.[0]?.network === 'Ancient8' ? formatNumber((transactionsData?.[0]?.price * ethPrice)*INITIAL_SUPPLY) : formatNumber((transactionsData?.[0]?.price * sonicPrice)*INITIAL_SUPPLY)||"-"}</TableCell>
            <TableCell className="text-right text-white">
                ${formatNumber(totalVolumeToken)}
            </TableCell>

            <TableCell className="text-right text-white">{token.metrics?.followersCount||"-"}</TableCell>
            <TableCell className="text-center text-white">{token.metrics?.topTweetsCount||"-"}</TableCell>
        </TableRow>
    )
}

export default TableToken;