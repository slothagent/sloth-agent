import React from 'react';
import { formatNumber, formatAddress, timeAgo } from '../../utils/utils';
import { Transaction } from '../../models';
import TableLaunching from './TableLaunching';
import { tokenAbi } from '../../abi/tokenAbi';
import { useReadContract } from 'wagmi';
import { Badge } from '../ui/badge';
import { INITIAL_SUPPLY } from '../../lib/contants';
import { configAncient8,configSonicBlaze } from '../../config/wagmi';
import { Card } from '../ui/card';

interface LaunchingProps {
    totalMarketCap: number;
    totalSupply: number;
    symbol: string;
    transactions: Transaction[];
    tokenAddress: string;
    network: string;
    sonicPrice: number;
    ethPrice: number;
}

const Launching: React.FC<LaunchingProps> = (
    {
        transactions,
        tokenAddress,
        network
    }
) => {
    const {data: balanceOfToken} = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [process.env.PUBLIC_FACTORY_ADDRESS_SONIC as `0x${string}`],
        config: network == "Sonic" ? configSonicBlaze : configAncient8
    });
    const uniqueToAddresses = [...new Set(transactions.map(tx => tx.to))];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Market Cap Stats */}
            <div className="bg-[#161B28] text-gray-300 rounded-lg p-6">
                <div className="hidden md:block">
                        <Card className="bg-[#161B28] border-none rounded-none overflow-hidden">
                        <div className="grid grid-cols-12 gap-2 p-4 text-sm text-gray-400 border-b border-gray-800">
                            <div className="col-span-2">TIME</div>
                            <div className="col-span-2">TYPE</div>
                            <div className="col-span-2">{network == "Sonic" ? "SONIC" : "ANCIENT8"}</div>
                            <div className="col-span-2">AMOUNT</div>
                            <div className="col-span-2">MAKER</div>
                            <div className="col-span-2 flex justify-center">HASH</div>
                        </div>

                        <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
                            {transactions.map((tx) => (
                                <div key={tx.transactionHash} className="grid grid-cols-12 gap-2 p-4 text-sm hover:bg-[#1C2333] transition-colors duration-200 w-full">
                                    <div className="col-span-2 text-[#2196F3] flex items-center">
                                        {timeAgo(tx.timestamp)}
                                    </div>
                                    <div className={`col-span-2 ${tx.transactionType === 'BUY' ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                        {tx.transactionType}
                                    </div>
                                    <div className="col-span-2 text-white flex items-center">
                                        {tx.amount ? formatNumber(Number(tx.amount)) : '-'}
                                    </div>                        
                                    <div className="col-span-2 text-white flex items-center">
                                        {tx.amount ? formatNumber(Number(tx.amountToken)) : '-'}
                                    </div>
                                    <a target='_blank' href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/address/" : "https://scanv2-testnet.ancient8.gg/address/"}${tx.to}`} className="col-span-2 text-gray-400 hover:text-white hover:underline flex items-center">
                                        {formatAddress(tx.to)}
                                    </a>
                                    <a 
                                        target='_blank' 
                                        href={`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/tx/" : "https://scanv2-testnet.ancient8.gg/tx/"}${tx.transactionHash}`} 
                                        className="col-span-2 text-gray-400 hover:text-white hover:underline flex items-center justify-center">
                                        <img src="/assets/icon/arrow-up-right.svg" alt="Arrow Up Right" className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                        </Card>
                    </div>
            </div>

            {/* Bonding Curve Holders */}
            <div className="bg-[#161B28] text-gray-300 rounded-lg p-6">
                <div className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex justify-between items-center w-full gap-2">
                                <span className="text-gray-400">1.</span>
                                <a href={`https://testnet.sonicscan.org/address/${process.env.PUBLIC_FACTORY_ADDRESS_SONIC}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white">{formatAddress(process.env.PUBLIC_FACTORY_ADDRESS_SONIC || '')}</a>
                                <Badge variant="outline" className="bg-[#93E905]/10 text-[#93E905] border-[#93E905]">
                                    Bonding Curve
                                </Badge>
                                <span className='text-sm'>{parseFloat((((Number(balanceOfToken)/INITIAL_SUPPLY)*100)/10**18).toFixed(5))}%</span>
                            </div>
                            
                        </div>
                        {uniqueToAddresses.map((address, index) => (
                            <TableLaunching  tokenAddress={tokenAddress} network={network} key={index} address={address} index={index} totalValue={transactions.filter(tx => tx.to === address).reduce((acc, tx) => acc + Number(tx.totalValue), 0)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Launching;
