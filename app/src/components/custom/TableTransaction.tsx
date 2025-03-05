import { formatAddress } from "@/utils/utils";

import { formatDistance } from "date-fns";
import { Transaction } from "@/models/transactions";
import { formatNumber } from "@/utils/utils";
import Link from "next/link";
import { useTokenByAddress } from "@/hooks/useWebSocketData";
import { useMemo } from "react";

interface TableTransactionProps {
    tx: Transaction;
    ethPrice: number;
    sonicPrice: number;
}

const TableTransaction = ({tx, ethPrice, sonicPrice}: TableTransactionProps) => {

    const price = useMemo(() => {
        if (tx.network === 'Ancient8') {
            return (Number(tx.price)) * ethPrice;
        } else {
            return Number(tx.price) * sonicPrice;
        }
    }, [tx, ethPrice, sonicPrice]);

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
                ${tx.amount ? tx.network == "Sonic" ? formatNumber(Number(tx.amount)*sonicPrice) : formatNumber(Number(tx.amount)*ethPrice) : '-'}
            </div>
            <div className="col-span-2 text-right text-white">
                ${tx.price ? price.toFixed(8) : '-'}
            </div>
        </div>
    )
}

export default TableTransaction;