"use client";

import Image from 'next/image';
import Link from 'next/link';
import {  
    Star,
    Clock,
    Copy
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from 'next/navigation';
import Chart from '@/components/chart';
import Overview from '@/components/custom/Overview';
import Social from '@/components/custom/Social';
import { useQuery } from '@tanstack/react-query';   
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { NextPage } from 'next';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { factoryAbi } from '@/abi/factoryAbi';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const AgentDetails: NextPage = () => {
    const { symbol } = useParams();
    const [amount, setAmount] = useState<string|null>(null);
    const { writeContractAsync } = useWriteContract();

    const { address: OwnerAddress, isConnected } = useAccount();


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

    const { data: currentTokenPrice, isLoading: isLoadingTokenPrice } = useReadContract({
        address: process.env.FACTORY_ADDRESS as `0x${string}`,
        abi: factoryAbi,
        functionName: 'getCurrentTokenPrice',
        args: [agentData?.address]
    });

    if (isLoading || !agentData || isLoadingTokenPrice) {
        return <div>Loading...</div>;
    }

    const priceInEth = currentTokenPrice;
    const calculateTokenAmount = (ethAmount: string | null) => {
        if (!ethAmount || !priceInEth) return "0";
        const tokens = (BigInt(parseFloat(ethAmount) * (10**18)) / priceInEth).toString();
        return tokens;
    };

    const tokensToReceive = calculateTokenAmount(amount);

    console.log(tokensToReceive);
    
    const handleBuy = async () => {
        const loadingToast = toast.loading('Buying...');
        const amountToBuy = BigInt(parseFloat(amount||'0')*10**18);
        try {
            await writeContractAsync({
                address: process.env.FACTORY_ADDRESS as `0x${string}`,
                abi: factoryAbi,
                functionName: 'buyTokens',
                value: amountToBuy,
                args: [agentData?.address, BigInt(1)*BigInt(10**18)]
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
    <div className="min-h-screen bg-white container mx-auto">
      {/* Top Navigation Bar */}
        <div className="bg-primary top-0 sm:top-12 border-border-primary border-b sm:border-b-0">
            <div className="py-2 sm:py-4 lg:px-4 pt-2 flex md:items-center justify-between gap-4 max-lg:px-4 flex-col md:flex-row mb-0 lg:mt-8 mx-auto">
                <div className="flex items-center gap-3 justify-between sm:justify-start">
                <div className="flex items-center gap-1">
                    <Link href="/" className="flex items-center gap-2">
                    <button className="flex items-center justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] text-button-text-default bg-button-bg-default hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed h-8 gap-1 text-sm rounded-full aspect-square px-0">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </button>
                    <div className="hidden sm:flex items-center border gap-1 rounded-full px-2 py-1">
                        <p className="text-text-primary text-sm font-medium">slothai.xyz</p>
                    </div>
                    </Link>
                    <div className="hidden sm:block">
                    <button className="flex items-center justify-center w-max font-sans antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary [&>svg]:w-[1em] [&>svg]:h-[1em] disabled:bg-transparent hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed px-2 py-1.5 h-8 gap-2 text-sm font-medium text-text-primary border border-border-secondary rounded-lg">
                        <img className="size-5 rounded-xs" alt="F" src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" loading="lazy" />
                        {agentData?.name}
                    </button>
                    </div>
                </div>
                <div className="sm:hidden">
                    <button className="flex items-center justify-center w-max font-sans antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary [&>svg]:w-[1em] [&>svg]:h-[1em] disabled:bg-transparent hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed px-2 py-1.5 h-8 gap-2 text-sm font-medium text-text-primary border border-border-secondary rounded-lg">
                    <img className="size-5 rounded-xs" alt="F" src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" loading="lazy" />
                    {agentData?.name}
                    </button>
                </div>
                <button className="flex items-center border justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] group-hover:bg-inverted-secondary active:bg-inverted-tertiary h-8 rounded-full px-3 group/star bg-quarternary gap-2 text-button-text-default text-sm hover:bg-tertiary aspect-square sm:aspect-auto">
                    <Star className="w-4 h-4" />
                    <span className="sm:block hidden">Add to watchlist</span>
                </button>
                </div>
                <div className="hidden md:block">
                <div role="group" dir="ltr" className="flex items-center justify-center border border-border-primary shadow-sm rounded-lg h-8 p-[1px] gap-0 !w-full md:!w-max md:!mx-0">
                    <button type="button" data-state="off" className="inline-flex items-center justify-center text-sm transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-badge-info-text data-[state=on]:bg-green-200 data-[state=on]:!font-medium data-[state=on]:!text-black hover:bg-secondary whitespace-nowrap border-none rounded-md font-medium px-3 data-[state=off]:!text-text-primary h-[28px] w-full">
                    24h
                    </button>
                    <button type="button" data-state="off" className="inline-flex items-center justify-center text-sm transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-badge-info-text data-[state=on]:bg-green-200 data-[state=on]:!font-medium data-[state=on]:!text-black hover:bg-secondary whitespace-nowrap border-none rounded-md font-medium px-3 data-[state=off]:!text-text-primary h-[28px] w-full">
                    3D
                    </button>
                    <button type="button" data-state="on" className="inline-flex items-center justify-center text-sm transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-badge-info-text data-[state=on]:bg-green-200 data-[state=on]:!font-medium data-[state=on]:!text-black hover:bg-secondary whitespace-nowrap border-none rounded-md font-medium px-3 data-[state=off]:!text-text-primary h-[28px] w-full">
                    7D
                    </button>
                    <button type="button" data-state="off" className="inline-flex items-center justify-center text-sm transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-badge-info-text data-[state=on]:bg-green-200 data-[state=on]:!font-medium data-[state=on]:!text-black hover:bg-secondary whitespace-nowrap border-none rounded-md font-medium px-3 data-[state=off]:!text-text-primary h-[28px] w-full">
                    14D
                    </button>
                    <button type="button" data-state="off" className="inline-flex items-center justify-center text-sm transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-badge-info-text data-[state=on]:bg-green-200 data-[state=on]:!font-medium data-[state=on]:!text-black hover:bg-secondary whitespace-nowrap border-none rounded-md font-medium px-3 data-[state=off]:!text-text-primary h-[28px] w-full">
                    30D
                    </button>
                </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className = "flex flex-col sm:mt-4 mb-6 lg:px-4 lg:mb-12">
            <div className="lg:mb-10 hidden sm:block">
                <div className="flex max-lg:p-2 h-full w-full lg:justify-between relative">
                    <div className="hidden lg:grid lg:grid-cols-[1fr,_420px] gap-4 w-full">
                        <div className="w-full lg:flex hidden flex-col">
                            <div className="lg:flex w-full items-center">                        
                                <div className="lg:flex items-center gap-3 h-full hidden">
                                    <Image 
                                        src={agentData?.imageUrl}
                                        alt="Token Logo"
                                        className="w-16 h-16 rounded-lg"
                                        loading="lazy"
                                        width={64}
                                        height={64}
                                    />
                                    <div className="lg:flex flex-col justify-center h-full">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-3xl font-medium mb-1">{agentData?.name}</h1>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a href="/d/categories/meme">
                                                        <div className="flex items-center justify-center font-sans font-medium w-fit gap-1 rounded-full px-2 py-0.5 text-xs h-6 bg-transparent border-border-secondary text-text-tertiary border">
                                                            {agentData?.ticker}
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-tertiary">{agentData?.ticker}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-col gap-2 mt-4 max-lg:mt-6">
                                <div className="text-text-primary text-sm">
                                    {agentData?.description}
                                </div>
                                {/* <div className="mt-4">
                                    <div className="flex items-center gap-2 ">
                                        <a href="https://x.com/FartCoinOfSOL" target="_blank">
                                            <button className="flex items-center border  justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] text-button-text-default bg-button-bg-default hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed h-8 gap-1 px-3 text-sm rounded-lg">
                                                𝕏
                                            </button>
                                        </a>
                                        <a href="https://www.geckoterminal.com/solana/tokens/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump" target="_blank">
                                            <button className="flex items-center border justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] text-button-text-default bg-button-bg-default hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed h-8 gap-1 text-sm rounded-lg px-2">
                                                <img height="16" width="16" className="rounded-full mr-0.5" src="/geckoterminal.png" />
                                                GeckoTerminal
                                            </button>
                                        </a>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <div className="ml-auto w-max hidden lg:block">
                            <div className="grid grid-cols-2 max-h-[86px]">
                                <div className="border px-4 py-3 w-52 h-[86px] justify-between flex flex-col">
                                    <div className="flex flex-col h-full">
                                        <div className="text-sm mb-auto flex items-center gap-1.5 font-medium">
                                            <img alt="Solana" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6" src="/assets/chains/a8.png" style={{ color: 'transparent' }} />
                                            Contract address
                                        </div>
                                        <Link href={`https://scanv2-testnet.ancient8.gg/address/${agentData?.address}`} target="_blank" className="flex text-sm items-center gap-1 mt-1.5">
                                            {agentData?.address.slice(0, 4)}...{agentData?.address.slice(-4)}
                                            <button className="ml-1 text-gray-400 hover:text-gray-600">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="border border-l-0  px-4 py-3 w-52 h-[86px] justify-between flex flex-col">
                                    <div>
                                        <div className="text-sm flex items-center gap-1.5 font-medium">
                                            <Clock className="w-4 h-4" />
                                            Created
                                        </div>
                                        <div className="flex text-sm items-center gap-1 mt-1.5">
                                            {agentData?.createdAt ? (
                                                <>
                                                    {agentData.createdAt.toLocaleDateString()} 
                                                    <span className="text-text-tertiary">
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
                                        <div className="flex items-center justify-center font-sans font-medium w-fit gap-1 rounded-full px-2 py-1 text-xs h-auto bg-transparent border-border-secondary text-text-tertiary border">
                                            {agentData?.ticker}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <h1 className="text-2xl font-medium font-display mb-1">{agentData?.name}</h1>
                                    </div>
                                    <p className="text-xs text-text-tertiary">{agentData?.ticker}</p>
                                    <div className="mt-2 flex items-center gap-1">
                                        <div className="flex items-center rounded justify-center font-sans font-medium w-fit bg-badge-success-bg text-badge-success-text h-6 gap-1 text-xs px-2">
                                            {agentData?.ticker}
                                        </div>
                                        <Link href={`https://scanv2-testnet.ancient8.gg/address/${agentData?.address}`} target="_blank" className="flex items-center rounded justify-center font-medium w-fit bg-quarternary text-text-primary text-[10px] leading-[12px] gap-1 px-1 font-mono h-auto py-1">
                                            <img alt="Solana" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-4" src="/assets/chains/a8.png" style={{ color: 'transparent' }} />
                                            {agentData?.address.slice(0, 4)}...{agentData?.address.slice(-4)}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs mt-2 text-text-tertiary">
                            {agentData?.description}
                        </p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <a href="https://x.com/FartCoinOfSOL" target="_blank">
                                    <button className="flex items-center justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] text-button-text-default bg-button-bg-default hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed h-8 gap-1 px-3 text-sm rounded-lg">
                                        𝕏
                                    </button>
                                </a>
                                <a href="https://www.geckoterminal.com/solana/tokens/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump" target="_blank">
                                    <button className="flex items-center justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] text-button-text-default bg-button-bg-default hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed h-8 gap-1 text-sm rounded-lg px-2">
                                        <img height="16" width="16" className="rounded-full mr-0.5" src="/geckoterminal.png" />
                                        GeckoTerminal
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>

                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className=" border-border-primary">
                <div className="">
                <Tabs defaultValue="trade" className="w-full">
                    <div className="flex items-center justify-between mb-4 border-b">
                        <TabsList className="h-[62px] w-full justify-start gap-6 bg-transparent">
                        <TabsTrigger 
                            value="trade"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-text-primary data-[state=active]:shadow-none rounded-none px-0 text-base font-medium"
                        >
                            <div className="flex items-center gap-1 text-base font-medium">Trade</div>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="overview"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-text-primary data-[state=active]:shadow-none rounded-none px-0 text-base font-medium"
                        >
                            <div className="flex text-base font-medium">Overview</div>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="social"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-text-primary data-[state=active]:shadow-none rounded-none px-0 text-base font-medium"
                        >
                            <div className="flex items-center gap-1 text-base font-medium">Social</div>
                        </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="trade" className="mt-4">
                        <div className="sm:hidden flex px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-medium">$0.60282</span>
                        </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="md:grid grid-cols-1 md:grid-cols-[1fr,_400px] gap-4 ">
                                <div className="h-[400px] md:h-[550px] md:border md:rounded-lg relative flex flex-col">
                                    <div className="h-[100px] hidden md:flex justify-between p-4 border-b">
                                        <div>
                                            <p className="text-4xl font-medium">$0.51033</p>
                                            <span className="text-sm flex gap-1 items-center text-change-negative">
                                                -20.15%
                                            <span>(7D)</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-[450px] w-full p-4 relative hidden md:block">
                                        <div className="flex flex-col w-full h-full relative pt-16">
                                            <Chart height="full" />
                                        </div>
                                    </div>
                                </div>
                                {/* Desktop Swap */}
                                <div className="hidden md:block border p-2 overflow-hidden h-[550px] rounded-lg">
                                    <Tabs defaultValue="buy" className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="w-[200px]">
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger 
                                                        value="buy"
                                                        className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                                                    >
                                                        Buy
                                                    </TabsTrigger>
                                                    <TabsTrigger value="sell">Sell</TabsTrigger>
                                                    <TabsTrigger value="auto">Auto</TabsTrigger>
                                                </TabsList>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Bal:</span>
                                                <span className="text-sm font-medium">—SOL</span>
                                            </div>
                                        </div>
                                        <TabsContent value="buy">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-500">Amount</span>
                                                    <div className="flex items-center gap-2 border px-2">
                                                        <Input 
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            placeholder="0.0"
                                                            value={amount||0}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        />
                                                        <span>ETH</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <button 
                                                            onClick={() => handleAmountClick(0.01)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            0.01
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.1)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            0.1
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.5)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            0.5
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(1)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            1
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>You will receive: {tokensToReceive} {agentData?.ticker}</span>
                                                </div>
                                                <Button onClick={handleBuy} className="w-full mt-2 bg-[#93E905]/20 text-black py-3 rounded-md font-medium hover:bg-[#93E905]/50 transition-colors">
                                                    Buy
                                                </Button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="sell">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-500">Amount</span>
                                                    <div className="flex items-center gap-2 border px-2">
                                                        <Input 
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            placeholder="0.0"
                                                            value={amount||0}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        />
                                                        <span>ETH</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <button 
                                                            onClick={() => handleAmountClick(0.01)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            25%
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.1)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            50%
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(0.5)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            75%
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAmountClick(1)}
                                                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                                                        >
                                                            100%
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>1 ETH = {currentTokenPrice} {agentData?.ticker}</span>
                                                </div>
                                                <button className="w-full mt-2 bg-gray-200 text-gray-800 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors">
                                                    Sell
                                                </button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="auto">
                                            <span>Coming Soon</span>
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
                        <Social />
                    </TabsContent>
                </Tabs>
                </div>

            {/* Mobile Navigation */}
            <div className="sm:hidden">
                <div className="border-t-2 border-tertiary grid grid-cols-3 h-[52px] bg-primary justify-evenly z-[999] w-full fixed bottom-0 gap-[1px]">
                    <button className="flex flex-col items-center justify-center gap-0.5 text-2xs font-medium bg-white text-text-primary">
                    <div className="flex items-center gap-1">Trade</div>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-0.5 text-2xs font-medium bg-quarternary text-text-quarternary">
                    <div className="flex">Overview</div>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-0.5 text-2xs font-medium bg-quarternary text-text-quarternary">
                    <div className="flex items-center gap-1">Social</div>
                    </button>
                </div>
            </div>
            </div>


            
        </div>

    </div>
    );
} 

export default AgentDetails;