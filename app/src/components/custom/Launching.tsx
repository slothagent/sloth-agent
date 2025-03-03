import React from 'react';
import { formatNumber, formatAddress } from '@/utils/utils';
import { Transaction } from '@/models';
import TableLaunching from './TableLaunching';
import { tokenAbi } from '@/abi/tokenAbi';
import { useReadContract } from 'wagmi';
import { Badge } from '../ui/badge';
import { INITIAL_SUPPLY } from '@/lib/contants';
import Link from 'next/link';


interface LaunchingProps {
    totalMarketCap: number;
    totalSupply: number;
    symbol: string;
    transactions: Transaction[];
    bondingCurveAddress: string;
    tokenAddress: string;
}

const Launching: React.FC<LaunchingProps> = ({totalMarketCap,totalSupply,symbol,transactions,bondingCurveAddress,tokenAddress}) => {

    const {data: balanceOfToken} = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [bondingCurveAddress as `0x${string}`]
    });
    const uniqueToAddresses = [...new Set(transactions.map(tx => tx.to))];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Cap Stats */}
            <div className="bg-[#161B28] text-gray-300 rounded-lg p-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">Current Target MarketCap</h3>
                        <div className="text-3xl font-bold">{formatNumber(Number(totalMarketCap)/10**18)}</div>
                        <div className="text-[#93E905] text-sm">USD</div>
                    </div>

                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">Tokens on Bonding Curve</h3>
                        <div className="text-3xl font-bold">{formatNumber(Number(totalSupply)/10**18)}</div>
                        <div className="text-[#93E905] text-sm">{symbol}</div>
                    </div>
                </div>
            </div>

            {/* Bonding Curve Holders */}
            <div className="bg-[#161B28] text-gray-300 rounded-lg p-6">
                <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">1.</span>
                                <Link href={`https://testnet.sonicscan.org/address/${bondingCurveAddress}`} target="_blank" className="hover:underline hover:text-white">{formatAddress(bondingCurveAddress)}</Link>
                                <Badge variant="outline" className="bg-[#93E905]/10 text-[#93E905] border-[#93E905]">
                                    Bonding Curve
                                </Badge>
                            </div>
                            <span>{parseFloat((((Number(balanceOfToken)/INITIAL_SUPPLY)*100)/1000).toFixed(5))}%</span>
                        </div>
                        {uniqueToAddresses.map((address, index) => (
                            <TableLaunching tokenAddress={tokenAddress} key={index} address={address} index={index} totalValue={transactions.filter(tx => tx.to === address).reduce((acc, tx) => acc + Number(tx.totalValue), 0)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Launching;
