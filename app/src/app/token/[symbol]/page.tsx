"use client";

import Image from 'next/image';
import Link from 'next/link';
import {  
    Star,
    Clock,
    Copy,
    ArrowLeft,
    ChevronRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from 'next/navigation';
import Chart from '@/components/chart';
import Overview from '@/components/custom/Overview';
import Social from '@/components/custom/Social';
import { Button } from "@/components/ui/button";
import Message from '@/components/custom/Message';
import Launching from '@/components/custom/Launching';
import { useQuery } from '@tanstack/react-query';   
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { NextPage } from 'next';
import { useReadContract, useWriteContract } from 'wagmi';
import { factoryAbi } from '@/abi/factoryAbi';
import { toast } from 'react-hot-toast';
import { parseEther, formatUnits } from "ethers";


const TokenDetails: NextPage = () => {
    const { symbol } = useParams();
    const [amount, setAmount] = useState<string|null>(null);
    const { writeContractAsync } = useWriteContract();

    const formatNumber = (num: string): string => {
        const n = parseFloat(num);
        if (isNaN(n)) return '0';
        
        const trillion = 1e12;
        const billion = 1e9;
        const million = 1e6;
        const thousand = 1e3;

        if (n >= trillion) return (n / trillion).toFixed(2) + 'T';
        if (n >= billion) return (n / billion).toFixed(2) + 'B';
        if (n >= million) return (n / million).toFixed(2) + 'M';
        if (n >= thousand) return (n / thousand).toFixed(2) + 'k';
        return n.toFixed(2);
    };

    const handleAmountClick = (value: number) => {
        setAmount(value.toString());
    };

    const getDaysAgo = (date: Date) => {
        const diffTime = Math.abs(new Date().getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `(${diffDays}d ago)`;
    };

    const fetchAgentBySymbol = async () => {
        const agent = await fetch(`/api/agent?symbol=${symbol?.toString().toUpperCase()}`,{
            next: { revalidate: 60 },
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        return agent.json();
    }

    const { data: agent, isLoading } = useQuery({
        queryKey: ['agent', symbol],
        queryFn: () => fetchAgentBySymbol(),
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const agentData = useMemo(() => {
        if (!agent) return null;
        return {
            ...agent.data,
            createdAt: agent.data?.createdAt ? new Date(agent.data.createdAt) : null
        };
    }, [agent]);

    const { data: tokensToReceive, isLoading: isLoadingTokenPrice } = useReadContract({
        address: process.env.FACTORY_ADDRESS as `0x${string}`,
        abi: factoryAbi,
        functionName: 'calculateTokensForEth',
        args: [agentData?.address, parseEther(amount||"0")]
    });


    if (isLoading || !agentData) {
        return <div>Loading...</div>;
    }

    console.log(process.env.FACTORY_ADDRESS);

    const handleBuy = async () => {
        const loadingToast = toast.loading('Buying...');
        try {
            await writeContractAsync({
                address: process.env.FACTORY_ADDRESS as `0x${string}`,
                abi: factoryAbi,
                functionName: 'buyTokens',
                value: parseEther(amount||"0"),
                args: [agentData?.address, tokensToReceive||BigInt(0)]
            });
            toast.success('Buy successful!', { id: loadingToast });
        } catch (error: any) {
            console.error('Buy error:', error);
            if (error.code === 4001 || error.message?.includes('User rejected')) {
                toast.error('Transaction rejected by user', { id: loadingToast });
            } else if (error.code === -32603) {
                toast.error('Internal JSON-RPC error. Please check your wallet balance.', { id: loadingToast });
            } else {
                toast.error('Failed to buy', { id: loadingToast });
            }
        }
    }

    return (
    <div className="min-h-screen bg-[#0B0E17] pb-[60px] sm:pb-0">
      {/* Top Navigation Bar */}
        <div className="bg-[#0B0E17] top-0 sm:top-12 border-[#1F2937] border-b sm:border-b-0">
            <div className="container mx-auto py-2 sm:py-4 lg:px-4 pt-2 flex md:items-center justify-between gap-4 max-lg:px-4 flex-col md:flex-row mb-0 lg:mt-8">
                <div className="flex items-center gap-4 justify-between sm:justify-start">
                    <Link href="/" className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            <div className="w-7 h-7 bg-[#161B28] flex items-center justify-center rounded-full border border-[#1F2937] hover:border-gray-600">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 border border-[#1F2937] px-3 py-1 rounded-full hover:border-gray-600 transition-colors duration-200">
                            <p className="text-gray-400 text-sm font-medium">{agentData?.ticker}</p>
                        </div>
                    </Link>
                    
                    <ChevronRight className="w-4 h-4 text-gray-500 hidden sm:block" />
                    
                    <div className="hidden sm:block">
                        <button className="flex items-center justify-center gap-3 px-3 py-0.5 text-sm font-medium text-gray-400 border border-[#1F2937] rounded-xl hover:bg-[#1C2333] hover:border-gray-600 transition-all duration-200">
                            <img 
                                className="w-6 h-6 rounded-md" 
                                alt={agentData?.name} 
                                src={agentData?.imageUrl} 
                                loading="lazy" 
                            />
                            {agentData?.name}
                        </button>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-500 hidden sm:block" />
                    
                    <Button 
                        variant="ghost" 
                        className="group/star text-gray-400 hover:text-white p-0 transition-colors duration-200"
                    >
                        <span className="flex items-center gap-3 border border-[#1F2937] px-4 py-2 rounded-full hover:border-gray-600">
                            <Star className="w-4 h-4" />
                            Add to watchlist
                        </span>
                    </Button>
                </div>
                <div className="hidden md:block">
                <div role="list" dir="ltr" className="flex items-center justify-center border-[#1F2937] shadow-sm rounded-lg p-[1px] gap-0 !w-full md:!w-max md:!mx-0 border py-2 h-[40px]">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white data-[state=on]:bg-[#161B28] data-[state=on]:text-white">24h</Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white data-[state=on]:bg-[#161B28] data-[state=on]:text-white">3D</Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white data-[state=on]:bg-[#161B28] data-[state=on]:text-white">7D</Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white data-[state=on]:bg-[#161B28] data-[state=on]:text-white">14D</Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white data-[state=on]:bg-[#161B28] data-[state=on]:text-white">30D</Button>
                </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto flex flex-col sm:mt-4 mb-6 lg:px-4 lg:mb-12">
            <div className="lg:mb-10 hidden sm:block">
                <div className="flex max-lg:p-2 h-full w-full lg:justify-between relative">
                    <div className="hidden lg:grid lg:grid-cols-[1fr,_420px] gap-4 w-full">
                        <div className="w-full lg:flex hidden flex-col">
                            <div className="lg:flex w-full items-center">                        
                                <div className="lg:flex items-center gap-3 h-full hidden">
                                    <Image 
                                        src={agentData?.imageUrl}
                                        alt="Token Logo"
                                        className="w-32 h-32 rounded-xl"
                                        loading="lazy"
                                        width={64}
                                        height={64}
                                    />
                                    <div className="lg:flex flex-col justify-center h-full">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-3xl font-medium mb-1 text-white">{agentData?.name}</h1>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a href="/d/categories/meme">
                                                        <div className="flex items-center justify-center font-sans font-medium w-fit gap-1 rounded-full px-2 py-0.5 text-xs h-6 bg-[#161B28] border-[#1F2937] text-gray-400 border">
                                                            {agentData?.ticker}
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400">@{agentData?.ticker}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-col gap-2 mt-4 max-lg:mt-6">
                                <div className="text-gray-400 text-sm">
                                    {agentData?.description}
                                </div>
                            </div>
                        </div>
                        <div className="ml-auto w-max hidden lg:block">
                            <div className="grid grid-cols-2 max-h-[86px]">
                                <div className="w-52 h-[86px] justify-between flex flex-col border border-[#1F2937] px-4 py-2 bg-[#161B28]">
                                    <div className="flex flex-col h-full">
                                        <div className="text-sm mb-auto flex items-center gap-1.5 font-medium text-gray-400">
                                            <img alt="Chain" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6" src="/assets/chains/a8.png" style={{ color: 'transparent' }} />
                                            Contract address
                                        </div>
                                        <Link href={`https://scanv2-testnet.ancient8.gg/address/${agentData?.address}`} target="_blank" className="flex text-sm items-center gap-1 mt-1.5 text-gray-400 hover:text-white">
                                            {agentData?.address.slice(0, 4)}...{agentData?.address.slice(-4)}
                                            <button className="ml-1 text-gray-400 hover:text-white">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="border-l-0 w-52 h-[86px] justify-between flex flex-col border border-[#1F2937] px-4 py-2 bg-[#161B28]">
                                    <div>
                                        <div className="text-sm flex items-center gap-1.5 font-medium text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            Created
                                        </div>
                                        <div className="flex text-sm items-center gap-1 mt-1.5 text-gray-400">
                                            {agentData?.createdAt ? (
                                                <>
                                                    {agentData.createdAt.toLocaleDateString()} 
                                                    <span className="text-gray-500">
                                                        {getDaysAgo(agentData.createdAt)}
                                                    </span>
                                                </>
                                            ) : (
                                                'N/A'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    {/* Mobile View */}
                    <div className="flex flex-col lg:hidden">
                        <div className="flex gap-3 items-center">
                            <div>
                                <div className="flex flex-col gap-0">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <div className="flex items-center justify-center font-sans font-medium w-fit gap-1 rounded-full px-2 py-1 text-xs h-auto bg-[#161B28] border-[#1F2937] text-gray-400 border">
                                            {agentData?.ticker}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <h1 className="text-2xl font-medium font-display mb-1 text-white">{agentData?.name}</h1>
                                    </div>
                                    <p className="text-xs text-gray-400">{agentData?.ticker}</p>
                                    <div className="mt-2 flex items-center gap-1">
                                        <div className="flex items-center rounded justify-center font-sans font-medium w-fit bg-[#161B28] text-gray-400 h-6 gap-1 text-xs px-2 border border-[#1F2937]">
                                            {agentData?.ticker}
                                        </div>
                                        <Link href={`https://scanv2-testnet.ancient8.gg/address/${agentData?.address}`} target="_blank" className="flex items-center rounded justify-center font-medium w-fit bg-[#161B28] text-gray-400 text-[10px] leading-[12px] gap-1 px-1 h-auto py-1 border border-[#1F2937]">
                                            <img alt="Chain" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-4" src="/assets/chains/a8.png" style={{ color: 'transparent' }} />
                                            {agentData?.address.slice(0, 4)}...{agentData?.address.slice(-4)}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-400">
                            {agentData?.description}
                        </p>
                    </div>

                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-[#1F2937]">
                <div className="">
                <Tabs defaultValue="trade" className="w-full">
                    <div className="flex-wrap">
                        <div className="flex items-center justify-between mb-4 border-b border-[#1F2937]">
                            <TabsList className="h-[62px] w-full justify-start gap-6 bg-transparent">
                                <TabsTrigger 
                                    value="trade"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 text-xs md:text-base font-medium text-gray-400 data-[state=active]:text-white whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1">Trade</div>
                                </TabsTrigger>      
                                <TabsTrigger 
                                    value="overview"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 text-xs md:text-base font-medium text-gray-400 data-[state=active]:text-white whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1 text-xs md:text-base">Overview</div>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="social"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 text-xs md:text-base font-medium text-gray-400 data-[state=active]:text-white whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1">Social</div>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="message"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 text-xs md:text-base font-medium text-gray-400 data-[state=active]:text-white whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1 ">Message</div>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="launching"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 text-xs md:text-base font-medium text-gray-400 data-[state=active]:text-white whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1 ">Launching</div>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="trade" className="mt-4">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,_400px] gap-4">
                                <div className="h-[300px] sm:h-[400px] md:h-[550px] border rounded-lg relative flex flex-col border-[#1F2937] bg-[#161B28]">
                                    <div className="h-[80px] sm:h-[100px] flex justify-between p-4 border-b border-[#1F2937]">
                                        <div>
                                            <p className="text-2xl sm:text-4xl font-medium text-white">$0.51033</p>
                                            <span className="text-sm flex gap-1 items-center text-red-400">
                                                -20.15% <span>(7D)</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full p-2 sm:p-4 relative">
                                        <div className="flex flex-col w-full h-full relative pt-3">
                                            {/* <Chart height="full" /> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-[#1F2937] p-2 overflow-hidden h-[450px] sm:h-[550px] rounded-lg bg-[#161B28]">
                                    <Tabs defaultValue="buy" className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="w-[200px]">
                                                <TabsList className="grid w-full grid-cols-3 bg-[#0B0E17]">
                                                    <TabsTrigger 
                                                        value="buy"
                                                        className="text-gray-400 data-[state=active]:bg-[#93E905]/20 data-[state=active]:text-white"
                                                    >
                                                        Buy
                                                    </TabsTrigger>
                                                    <TabsTrigger 
                                                        value="sell"
                                                        className="text-gray-400 data-[state=active]:bg-[#93E905]/20 data-[state=active]:text-white"
                                                    >
                                                        Sell
                                                    </TabsTrigger>
                                                    <TabsTrigger 
                                                        value="auto"
                                                        className="text-gray-400 data-[state=active]:bg-[#93E905]/20 data-[state=active]:text-white"
                                                    >
                                                        Auto
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-400">Bal:</span>
                                                <span className="text-sm font-medium text-white">—ETH</span>
                                            </div>
                                        </div>
                                        <TabsContent value="buy">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-400">Amount</span>
                                                    <div className="flex items-center gap-2 border border-[#1F2937] px-2 bg-[#0B0E17]">
                                                        <Input 
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            placeholder="0.0"
                                                            value={amount||0}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent text-white" 
                                                        />
                                                        <span className="text-gray-400">ETH</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <button 
                                                            onClick={() => handleAmountClick(0.01)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            0.01
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.1)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            0.1
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.5)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            0.5
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(1)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            1
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span>You will receive: {formatNumber(formatUnits(tokensToReceive || BigInt(0), 18))} {agentData?.ticker}</span>
                                                </div>
                                                <Button onClick={handleBuy} className="w-full mt-2 bg-[#93E905]/20 text-white py-3 rounded-md font-medium hover:bg-[#93E905]/30 transition-colors">
                                                    Buy
                                                </Button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="sell">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-400">Amount</span>
                                                    <div className="flex items-center gap-2 border border-[#1F2937] px-2 bg-[#0B0E17]">
                                                        <Input 
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            placeholder="0.0"
                                                            value={amount||0}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent text-white" 
                                                        />
                                                        <span className="text-gray-400">ETH</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <button 
                                                            onClick={() => handleAmountClick(0.01)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            25%
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.1)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            50%
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.5)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            75%
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(1)}
                                                            className="px-4 py-2 text-sm font-medium border border-[#1F2937] rounded-md hover:bg-[#1C2333] text-gray-400"
                                                        >
                                                            100%
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span>1 ETH = {formatNumber(formatUnits(tokensToReceive || BigInt(0), 18))} {agentData?.ticker}</span>
                                                </div>
                                                <button className="w-full mt-2 bg-[#93E905]/20 text-white py-3 rounded-md font-medium hover:bg-[#93E905]/30 transition-colors">
                                                    Sell
                                                </button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="auto">
                                            <span className="text-gray-400">Coming Soon</span>
                                        </TabsContent>  
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                        
                    </TabsContent>
                    <TabsContent value="overview" className="mt-4">
                        <Overview />
                    </TabsContent>
                    <TabsContent value="social" className="mt-4">
                        <Social agentData={agentData} />
                    </TabsContent>
                    <TabsContent value="message" className="mt-4">
                        <Message />
                    </TabsContent>
                    <TabsContent value="launching" className="mt-4">
                        <Launching />
                    </TabsContent>
                </Tabs>
                </div>
            </div>
            
        </div>      
    
    </div>
    );
} 


export default TokenDetails;