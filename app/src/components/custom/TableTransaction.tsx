import { formatAddress } from "@/utils/utils";

import { formatDistance } from "date-fns";
import { Transaction } from "@/models/transactions";
import { formatNumber } from "@/utils/utils";
import Link from "next/link";
import { useTokenByAddress } from "@/hooks/useWebSocketData";
import { useMemo } from "react";
import { useAccount } from "wagmi";

const TableTransaction = ({tx}: {tx: Transaction}) => {
    const { token: token, loading: isTokenDataLoading } = useTokenByAddress(tx.from as string);

    const tokenData = useMemo(() => {
        if (!token) return null;
        return {
            ...token,
            createdAt: token?.createdAt ? new Date(token.createdAt) : null
        };
    }, [token]);


    return (
        <div key={tx.transactionHash} className="grid grid-cols-12 gap-4 p-4 text-sm hover:bg-[#1C2333] transition-colors duration-200">
            <div className="col-span-2 text-[#2196F3]">
            {formatDistance(new Date(tx.timestamp), new Date(), { addSuffix: true })}
            </div>
            <Link target='_blank' href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/address/" : "https://scanv2-testnet.ancient8.gg/address/"}${tx.to}`} className="col-span-3 text-gray-400 hover:text-white hover:underline">
            {formatAddress(tx.to)}
            </Link>
            <Link target='_blank' href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/token/" : "https://scanv2-testnet.ancient8.gg/token/"}${tx.from}`} className="col-span-3 text-gray-400 hover:text-white hover:underline">
            {formatAddress(tx.from)}
            </Link>
            <div className={`col-span-1 ${tx.transactionType === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
            {tx.transactionType}
            </div>
            <div className="col-span-1 text-right text-white">
            {tx.amount ? formatNumber(tx.amount) : '-'} {tx.transactionType === 'BUY' ? tx.network == "Sonic" ? `S` : "ETH" : tokenData?.ticker}
            </div>
            <div className="col-span-2 text-right text-white">
            ${tx.price ? tx?.price.toFixed(6) : '-'}
            </div>
        </div>
    )
}

export default TableTransaction;