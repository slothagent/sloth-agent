"use client";
import Header from "@/components/Header";
import { useParams } from "next/navigation";
import Image from "next/image";
import { XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import PriceChart from "@/components/PriceChart";
import { useState, useEffect, useCallback } from "react";
import { Token } from "@/data/tokens";
import { truncateAddress } from "@/lib/comon";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { TOKEN_CONTRACT_ABI } from '@/config/abis/TokenABI'
import { parseEther, formatEther } from 'viem'
import toast from "react-hot-toast";


// Update the interface based on API response
interface TokenHolder {
    address: {
        hash: string;
        is_contract: boolean;
        // Add other address properties if needed
    };
    value: string;
    percentage: number;
    type?: string;
}

// Add this interface at the top of the file
interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: string;
    type: 'buy' | 'sell';
}

// Add these interfaces at the top
interface TokenPrice {
    timestamp: string;
    price: string;
    volume: string;
}

interface ChartData {
    time: string;
    fullTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const TokenPage = () => {
    const { tokenAddress } = useParams();
    const { 
        address
    } = useAccount();
    const [timeframe, setTimeframe] = useState('1m');
    const [tokenData, setTokenData] = useState<Token | null>(null);
    const [holders, setHolders] = useState<number>(0);
    const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTx, setIsLoadingTx] = useState(false);
    const [priceHistory, setPriceHistory] = useState<ChartData[]>([]);
    const [isLoadingChart, setIsLoadingChart] = useState(false);
    const [amount, setAmount] = useState('')
    const [isBuying, setIsBuying] = useState(true)
    const [txPending, setTxPending] = useState(false)
    const [ethAmount, setEthAmount] = useState('')
    const [tokenAmount, setTokenAmount] = useState('')

    const { data: balance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: TOKEN_CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address
        }
    })

    const { writeContractAsync: writeTokenContract } = useWriteContract()

    useWatchContractEvent({
        address: tokenAddress as `0x${string}`,
        abi: TOKEN_CONTRACT_ABI,
        eventName: 'Transfer',
        onLogs(logs) {
            toast.success('Transaction successful!')
            fetchTokenData()
        },
    })

    useEffect(() => {
        const handleTimeframeChange = (event: any) => {
            setTimeframe(event.detail);
        };

        window.addEventListener('timeframeChange', handleTimeframeChange);
        return () => {
            window.removeEventListener('timeframeChange', handleTimeframeChange);
        };
    }, []);

    const fetchTokenData = useCallback( async () => {
        const response = await fetch('/api/tokens/findByAddress', {
            method: 'POST',
            body: JSON.stringify({ address: tokenAddress })
        });
        const data = await response.json();
        // console.log(data);
        setTokenData(data[0]);
    }, [tokenAddress]);

    useEffect(() => {
        fetchTokenData();
    }, [fetchTokenData]);

    // Replace fetchHoldersData with REST API implementation
    const fetchHoldersData = useCallback(async () => {
        try {
            // Get token info first to get total supply
            const tokenResponse = await fetch(`https://scanv2-testnet.ancient8.gg/api/v2/tokens/${tokenAddress}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const tokenData = await tokenResponse.json();
            // console.log('Token Data:', tokenData);

            // Get token holders
            const holdersResponse = await fetch(`https://scanv2-testnet.ancient8.gg/api/v2/tokens/${tokenAddress}/holders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const holdersData = await holdersResponse.json();
            // console.log('Holders Data:', holdersData);

            if (holdersData.items && tokenData.total_supply) {
                const totalSupply = parseFloat(tokenData.total_supply);
                const formattedHolders = holdersData.items.map((holder: any) => ({
                    address: holder.address,
                    value: holder.value,
                    percentage: (parseFloat(holder.value) / totalSupply) * 100,
                    type: holder.address.hash === tokenAddress ? '(Bonding Curve)' : undefined
                })).sort((a: TokenHolder, b: TokenHolder) => b.percentage - a.percentage);

                setTokenHolders(formattedHolders);
                setHolders(holdersData.items.length);
            }
        } catch (error) {
            console.error('API Error:', error);
        }
    }, [tokenAddress]);

    // Add useEffect to call the fetch function
    useEffect(() => {
        fetchHoldersData();
    }, [fetchHoldersData]);

    // Sample data for price prediction 
    const predictionData = [
        { name: 'Init', value: 1 },
        { name: 'Current', value: 1 },
        { name: 'After listing', value: 1.8 },
    ];

    // Add tokenomic data
    const tokenomicData = [
        { name: 'Presale', value: 35, color: '#FF3B9A' },
        { name: 'Liquidity', value: 30, color: '#0EA5E9' },
        { name: 'Burnt', value: 35, color: '#94A3B8' }
    ];

    // Add this function to fetch transactions
    const fetchTransactions = useCallback(async () => {
        if (!address) return;
        
        try {
            setIsLoadingTx(true);
            const response = await fetch(`https://scanv2-testnet.ancient8.gg/api/v2/tokens/${tokenAddress}/transfers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.items) {
                const formattedTx = data.items.map((tx: any) => ({
                    hash: tx.tx_hash,
                    from: tx.from.hash,
                    to: tx.to.hash,
                    value: tx.total.token_amount,
                    timestamp: new Date(tx.timestamp).toLocaleString(),
                    type: tx.from.hash.toLowerCase() === address.toLowerCase() ? 'sell' : 'buy'
                }));
                setTransactions(formattedTx);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoadingTx(false);
        }
    }, [tokenAddress, address]);

    // Add this useEffect to fetch transactions when address changes
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions, address]);

    // Add this function to fetch price history
    const fetchPriceHistory = useCallback(async () => {
        try {
            setIsLoadingChart(true);
            const response = await fetch(`https://scanv2-testnet.ancient8.gg/api/v2/tokens/${tokenAddress}/prices`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const chartData = data.items.map((item: TokenPrice) => {
                    const date = new Date(item.timestamp);
                    return {
                        time: date.getDate().toString().padStart(2, '0'),
                        fullTime: date.toLocaleString(),
                        open: parseFloat(item.price),
                        high: parseFloat(item.price) * 1.001, // Simulate high
                        low: parseFloat(item.price) * 0.999,  // Simulate low
                        close: parseFloat(item.price),
                        volume: parseFloat(item.volume || '0')
                    };
                });
                
                setPriceHistory(chartData.reverse()); // Reverse to show oldest first
            }
        } catch (error) {
            console.error('Error fetching price history:', error);
        } finally {
            setIsLoadingChart(false);
        }
    }, [tokenAddress]);

    // Add useEffect to fetch price history
    useEffect(() => {
        fetchPriceHistory();
    }, [fetchPriceHistory]);

    // Update handleBuySell function
    const handleBuy = async () => {
        if (!amount || !address) return
        // console.log('amount', parseEther(amount))
        // console.log('address', address)
        const toastLoading = toast.loading('Please wait buying...')
        try {
            setTxPending(true)
            
            await writeTokenContract({
                address: tokenAddress as `0x${string}`,
                abi: TOKEN_CONTRACT_ABI,
                functionName: 'transferFromContract',
                args: [address as `0x${string}`, BigInt(Number(amount)*10**18)]
            })
            toast.success('Please wait transaction!', { id: toastLoading })
        } catch (error) {
            console.error('Transaction failed:', error)
            toast.error('Buy failed!', { id: toastLoading })
        } finally {
            setTxPending(false)
        }
    }

    const handleSell = async () => {
        if (!amount || !address) return
        const toastLoading = toast.loading('Please wait selling...')
        try {
            setTxPending(true)
            await writeTokenContract({
                address: tokenAddress as `0x${string}`,
                abi: TOKEN_CONTRACT_ABI,
                functionName: 'transferToContract',
                args: [BigInt(Number(amount)*10**18)]
            })
            toast.success('Please wait transaction!', { id: toastLoading })
        } catch (error) {
            console.error('Transaction failed:', error)
        } finally {
            setTxPending(false)
        }
    }

    // Update amount change handler
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setAmount(value)
        
        if (isBuying) {
            // When buying, show token amount equal to input
            setTokenAmount(value)
        } else {
            // When selling, show ETH amount equal to input
            setEthAmount(value)
        }
    }

    // Add handleMaxClick function
    const handleMaxClick = () => {
        if (!balance) return
        
        if (isBuying) {
            // When buying, use wallet ETH balance
            setAmount(formatEther(balance))
        } else {
            // When selling, use token balance
            setAmount(formatEther(balance))
        }
    }


    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <Header />
            <main className="w-full px-5 py-10">
                {/* Token Description */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="text-sm text-gray-700">
                        {tokenData?.description}
                    </div>
                </div>

                {/* Three Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_380px] gap-6">
                    {/* Left Column - Token Info */}
                    <div className="space-y-4 order-2 lg:order-1">
                        <div className="bg-white rounded-xl p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="bg-[#FF3B9A] text-white text-xs px-2 py-1 rounded">Address</span>
                                    <Link href={`https://scanv2-testnet.ancient8.gg/address/${tokenData?.tokenAddress}`} target="_blank" className="text-[#FF3B9A] hover:underline">{truncateAddress(tokenData?.tokenAddress || '')}</Link>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="bg-[#FF3B9A] text-white text-xs px-2 py-1 rounded">Name</span>
                                    <span className="text-sm">{tokenData?.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="bg-[#FF3B9A] text-white text-xs px-2 py-1 rounded">Symbol</span>
                                    <span className="text-sm">{tokenData?.symbol}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="bg-[#FF3B9A] text-white text-xs px-2 py-1 rounded">Listing On</span>
                                    <span className="text-[#FF3B9A] text-sm">Raydium AMM V4</span>
                                </div>
                            </div>
                        </div>

                        {/* Beat the dog info */}
                        {/* <div className="bg-white rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Beat the current dog at 14.6K mCap</span>
                                <span className="text-[#00C2FF] text-sm">1.03%</span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#00C2FF] rounded-full transition-all duration-300"
                                    style={{ width: '1.03%' }}
                                />
                            </div>
                        </div> */}

                        {/* Holders */}
                        <div className="bg-white rounded-xl p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-medium">Holders ({holders})</h2>
                                <button className="text-xs border border-gray-200 px-2 py-1 rounded">Detail</button>
                            </div>
                            <div className="space-y-2">
                                {tokenHolders.length > 0 ? (
                                    tokenHolders.slice(0, 3).map((holder, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[#FF3B9A]">{truncateAddress(holder.address.hash)}</span>
                                                {holder.type && <span className="text-xs text-gray-500">{holder.type}</span>}
                                            </div>
                                            <span>{holder.percentage.toFixed(2)}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No holders found</div>
                                )}
                            </div>
                        </div>

                        {/* Tokenomic */}
                        <div className="bg-white rounded-xl p-4">
                            <h2 className="text-sm font-medium mb-4">Tokenomic</h2>
                            <div className="flex justify-center mb-4">
                                <div className="relative w-[200px] h-[200px]">
                                    <PieChart width={200} height={200}>
                                        <Pie
                                            data={tokenomicData}
                                            cx={100}
                                            cy={100}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {tokenomicData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.color} 
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <span className="text-sm font-medium">DENGO</span>
                                    </div>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="space-y-2">
                                {tokenomicData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded" 
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        <span>{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Chart and Thread */}
                    <div className="space-y-4 order-1 lg:order-2">
                        {/* Token Header and Chart */}
                        <div className="bg-white rounded-xl p-6">
                            {/* Token Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={tokenData?.image || ""}
                                        alt="PUNGY DRAGONS"
                                        width={64}
                                        height={64}
                                        className="rounded-xl"
                                    />
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-bold">{tokenData?.name}</h1>
                                        <span className="text-xs bg-[#EAFAF0] text-[#16A34A] px-2 py-0.5 rounded">NEW</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">Owner</span>
                                    <Link href={`https://scanv2-testnet.ancient8.gg/address/${tokenData?.tokenAddress}`} target="_blank" className="text-[#FF3B9A] hover:underline">{truncateAddress(tokenData?.tokenAddress || '')}</Link>
                                </div>
                            </div>

                            {/* Price Chart */}
                            <div className="h-[300px] w-full">
                                {isLoadingChart ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF3B9A] border-t-transparent"></div>
                                    </div>
                                ) : priceHistory.length > 0 ? (
                                    <PriceChart data={priceHistory} />
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z" fill="#94A3B8"/>
                                            </svg>
                                            <div className="text-gray-500">No price data available</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thread and Transactions */}
                        <div className="bg-white rounded-xl p-6">
                            <div className="border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.9 17.39C17.64 16.59 16.89 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.77 20 8.64 20 12C20 14.08 19.2 15.97 17.9 17.39M11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.78 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#FF3B9A"/>
                                    </svg>
                                    <span className="text-lg font-medium">Transactions</span>
                                </div>
                            </div>
                            <div className="py-6">
                                <div>
                                    {!address ? (
                                        <div className="text-center py-8">
                                            <div className="mb-6">
                                                <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z" fill="#94A3B8"/>
                                                </svg>
                                            </div>
                                            <div className="text-gray-500 mb-4">Connect your wallet to view transactions</div>
                                        </div>
                                    ) : (
                                        <div>
                                            {isLoadingTx ? (
                                                <div className="flex justify-center items-center py-12">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF3B9A] border-t-transparent"></div>
                                                </div>
                                            ) : transactions.length > 0 ? (
                                                <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                                                    {transactions.map((tx, index) => (
                                                        <div key={index} className="border border-gray-100 hover:border-[#FF3B9A]/20 rounded-xl p-4 transition-all hover:shadow-sm">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <Link 
                                                                    href={`https://scanv2-testnet.ancient8.gg/tx/${tx.hash}`}
                                                                    target="_blank"
                                                                    className="text-[#FF3B9A] hover:underline text-sm font-medium flex items-center gap-1"
                                                                >
                                                                    {truncateAddress(tx.hash)}
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14ZM19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z" fill="#FF3B9A"/>
                                                                    </svg>
                                                                </Link>
                                                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                                    tx.type === 'buy' 
                                                                        ? 'bg-green-100 text-green-600'
                                                                        : 'bg-red-100 text-red-600'
                                                                }`}>
                                                                    {tx.type.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div className="bg-gray-50 rounded-lg p-3">
                                                                    <div className="text-gray-500 mb-1">From</div>
                                                                    <Link 
                                                                        href={`https://scanv2-testnet.ancient8.gg/address/${tx.from}`}
                                                                        target="_blank"
                                                                        className="text-[#FF3B9A] hover:underline font-medium flex items-center gap-1"
                                                                    >
                                                                        {truncateAddress(tx.from)}
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14ZM19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z" fill="#FF3B9A"/>
                                                                        </svg>
                                                                    </Link>
                                                                </div>
                                                                <div className="bg-gray-50 rounded-lg p-3">
                                                                    <div className="text-gray-500 mb-1">To</div>
                                                                    <Link 
                                                                        href={`https://scanv2-testnet.ancient8.gg/address/${tx.to}`}
                                                                        target="_blank"
                                                                        className="text-[#FF3B9A] hover:underline font-medium flex items-center gap-1"
                                                                    >
                                                                        {truncateAddress(tx.to)}
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14ZM19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z" fill="#FF3B9A"/>
                                                                        </svg>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 flex justify-between items-center text-sm bg-gray-50 rounded-lg p-3">
                                                                <span className="text-gray-500">{tx.timestamp}</span>
                                                                <span className="font-medium">{tx.value} {tokenData?.symbol}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z" fill="#94A3B8"/>
                                                    </svg>
                                                    <div className="text-gray-500">No transactions found</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Trading Interface */}
                    <div className="space-y-4 order-3">
                        {/* Trading Interface */}
                        <div className="bg-white rounded-xl p-6">
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Bonding Curve Progress (0.59%)</span>
                                    <span>Mcap: $37.8K</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[#FF3B9A] rounded-full transition-all duration-300"
                                        style={{ width: '0.59%' }}
                                    />
                                </div>
                                <div className="text-xs text-gray-600 mt-2">
                                    When the market cap hits $66.9K, All liquidity from the bonding curve will be 
                                    deposited into Raydium AMM V4 and burned. The progression accelerates as the price rises
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        className={`w-full py-2.5 ${
                                            isBuying 
                                                ? 'bg-[#22C55E] text-white' 
                                                : 'bg-white border border-gray-200'
                                        } rounded-lg`}
                                        onClick={handleBuy}
                                    >
                                        Buy
                                    </button>
                                    <button 
                                        className={`w-full py-2.5 ${
                                            !isBuying 
                                                ? 'bg-[#22C55E] text-white' 
                                                : 'bg-white border border-gray-200'
                                        } rounded-lg`}
                                        onClick={handleSell}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{isBuying ? 'ETH Amount' : `${tokenData?.symbol} Amount`}</span>
                                        <span className="text-gray-500">@ 0.5%</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="0" 
                                        value={amount}
                                        onChange={handleAmountChange}
                                        className="w-full border border-gray-200 rounded-lg p-2"
                                    />
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            {isBuying 
                                                ? `${tokenData?.symbol} Received: ${tokenAmount}` 
                                                : `ETH Received: ${ethAmount}`
                                            }
                                        </span>
                                        <button 
                                            className="text-[#FF3B9A]"
                                            onClick={handleMaxClick}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Prediction */}
                        <div className="bg-white rounded-xl p-6">
                            <h3 className="text-lg font-medium mb-4">Price Prediction</h3>
                            <div className="h-[200px] w-full">
                                <LineChart width={280} height={200} data={predictionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[1, 2]} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#22C55E"
                                        dot={{ stroke: '#22C55E', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#22C55E] rounded"></div>
                                    <span className="text-sm">Price</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#FF3B9A] rounded"></div>
                                    <span className="text-sm">Your Purchase</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TokenPage;
