import { formatAddress } from "../../utils/utils";
import { formatDistance } from "date-fns";
import { Transaction } from "../../models/transactions";
import { formatNumber } from "../../utils/utils";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

interface TableTransactionProps {
    tx: Transaction;
    ethPrice: number;
    sonicPrice: number;
}

const TableTransaction = ({tx, ethPrice, sonicPrice}: TableTransactionProps) => {
    const fetchTokenByAddress = async (address: string) => {
        const token = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token?address=${address}`);
        return token.json();
    }

    const {data: token} = useQuery({
        queryKey: ['token', tx?.from],
        queryFn: () => fetchTokenByAddress(tx?.from)
    })

    // console.log(token)

    const price = useMemo(() => {
        if (tx.network === 'Ancient8') {
            return (Number(tx.price)) * tx.amountToken * ethPrice;
        } else {
            return Number(tx.price) * tx.amountToken * sonicPrice;
        }
    }, [tx, ethPrice, sonicPrice]);

    return (
        <div key={tx.transactionHash} className="grid grid-cols-12 gap-2 p-4 text-sm hover:bg-[#1C2333] transition-colors duration-200 w-full">
            <div className="col-span-1 flex items-center">
                <img 
                    alt="Chain" 
                    loading="lazy" 
                    width="16" 
                    height="16" 
                    decoding="async" 
                    data-nimg="1" 
                    className="w-4" 
                    src={tx.network === "Sonic" ? "https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" : "/assets/chains/a8.png"} 
                    style={{ color: 'transparent' }} 
                />
            </div>
            <div className="col-span-2 text-[#2196F3] flex items-center">
                {formatDistance(new Date(tx.timestamp), new Date(), { addSuffix: true })}
            </div>
            <a target='_blank' href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/address/" : "https://scanv2-testnet.ancient8.gg/address/"}${tx.to}`} className="col-span-2 text-gray-400 hover:text-white hover:underline flex items-center">
                {formatAddress(tx.to)}
            </a>
            <a target='_blank' href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/token/" : "https://scanv2-testnet.ancient8.gg/token/"}${tx.from}`} className="col-span-2 text-gray-400 hover:text-white hover:underline flex items-center">
                {formatAddress(tx.from)}
            </a>
            <div className={`col-span-1 ${tx.transactionType === 'BUY' ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {tx.transactionType}
            </div>
            <div className="col-span-1 text-right text-white flex items-center justify-end">
                {tx.amount ? tx.transactionType === 'BUY' ? formatNumber(Number(tx.amountToken)) : formatNumber(Number(tx.amountToken)) : '-'} {token?.data?.ticker}
            </div>
            <div className="col-span-1 text-right text-white flex items-center justify-end">
                <a target='_blank' href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/token/" : "https://scanv2-testnet.ancient8.gg/token/"}${tx.from}`} className="flex items-center gap-2">
                    <img src={token?.data?.imageUrl} alt={token?.data?.name} className="w-4 h-4 rounded-full" />
                    <span className="hover:underline">{token?.data?.ticker}</span>
                </a>
            </div>
            <div className="col-span-2 text-right text-white flex items-center justify-end">
                {tx.price ? formatNumber(price): "-"} USD
            </div>

        </div>
    )
}

export default TableTransaction;