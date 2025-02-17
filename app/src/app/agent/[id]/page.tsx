"use client";

import Image from 'next/image';
import Link from 'next/link';
import { 
    ChevronRight, 
    ChevronDown, 
    Star,
    Clock,
    Copy,
    Twitter,
    ExternalLink 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from 'next/navigation';
import Chart from '@/components/chart';
import Overview from '@/components/custom/Overview';
import Social from '@/components/custom/Social';
import { Button } from "@/components/ui/button";
import Message from '@/components/custom/Message';
import Launching from '@/components/custom/Launching';

export default function AgentDetails() {
    const { id } = useParams();

  // Mock data for the agent
    const agent = {
        id: id,
        name: 'FARTCOIN',
        address: '9BB6NF...bgpump',
        description: 'Tokenising farts with the help of bots. Fartcoin dev orphaned it, we adopted $Fartcoin No TG, No cabal, Fart freely! 💨',
        created: 'Oct 18, 2024',
        createdAgo: '116d ago',
    };

    return (
    <div className="min-h-screen bg-white container mx-auto">
      {/* Top Navigation Bar */}
        <div className="bg-primary top-0 sm:top-12 border-border-primary border-b sm:border-b-0">
            <div className="py-2 sm:py-4 lg:px-4 pt-2 flex md:items-center justify-between gap-4 max-lg:px-4 flex-col md:flex-row mb-0 lg:mt-8 mx-auto ">
                <div className="flex items-center gap-3 justify-between sm:justify-start">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-black px-4 py-2 "></div>
                        </Button>
                        <div className="hidden sm:flex items-center gap-2  border-2 border-black px-4 py-2 ">
                            <p className="text-text-primary text-sm font-medium">cookie.fun</p>
                        </div>
                    </Link>
                    <div className="hidden sm:block">
                        <Button  className="flex items-center gap-2 border-2 border-black px-4 py-2 h-[40px]">
                            <img className="size-5 rounded-xs" alt="F" src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" loading="lazy" />
                            {agent.name}
                        </Button>
                    </div>
                </div>
                <div className="sm:hidden">
                    <Button variant="outline" className="flex items-center gap-2">
                        <img className="size-5 rounded-xs" alt="F" src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" loading="lazy" />
                        {agent.name}
                    </Button>
                </div>
                <Button variant="ghost" className="group/star">
                    <Star className="w-4 h-4" />
                    <span className="sm:block hidden border-2 border-black px-4 py-2 h-[40px]">Add to watchlist</span>
                </Button>
                </div>
                <div className="hidden md:block">
                <div role="list" dir="ltr" className="flex items-center justify-center border-border-primary shadow-sm rounded-lg p-[1px] gap-0 !w-full md:!w-max md:!mx-0 border-2 border-black py-2  h-[40px]">
                    <Button variant="ghost" size="sm" className="data-[state=on]:bg-green-200 data-[state=on]:text-black">24h</Button>
                    <Button variant="ghost" size="sm" className="data-[state=on]:bg-green-200 data-[state=on]:text-black">3D</Button>
                    <Button variant="ghost" size="sm" className="data-[state=on]:bg-green-200 data-[state=on]:text-black">7D</Button>
                    <Button variant="ghost" size="sm" className="data-[state=on]:bg-green-200 data-[state=on]:text-black">14D</Button>
                    <Button variant="ghost" size="sm" className="data-[state=on]:bg-green-200 data-[state=on]:text-black">30D</Button>
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
                                    <img 
                                        src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg"
                                        alt="Token Logo"
                                        className="w-16 h-16 rounded-lg"
                                        loading="lazy"
                                    />
                                    <div className="lg:flex flex-col justify-center h-full">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-3xl font-medium mb-1">Fartcoin</h1>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a href="/d/categories/meme">
                                                        <div className="flex items-center justify-center font-sans font-medium w-fit gap-1 text-xs text-text-tertiary border-2 border-black p-1  ">
                                                            Meme
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-tertiary">@FartCoinOfSOL</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-col gap-2 mt-4 max-lg:mt-6">
                                <div className="text-text-primary text-sm">
                                    Tokenising farts with the help of bots. Fartcoin dev orphaned it, we adopted $Fartcoin No TG, No cabal, Fart freely! 💨
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 ">
                                        <Button variant="ghost" asChild>
                                            <a href="https://x.com/FartCoinOfSOL" target="_blank" className="border-2 border-black  ">
                                                𝕏
                                            </a>
                                        </Button>
                                        <Button variant="ghost" asChild className="flex items-center gap-1 border-2 border-black px-4 py-2 ">
                                            <a href="https://www.geckoterminal.com/solana/tokens/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump" target="_blank">
                                                <img height="16" width="16" className="rounded-full mr-0.5 " src="/geckoterminal.png" />
                                                GeckoTerminal
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ml-auto w-max hidden lg:block">
                            <div className="grid grid-cols-2 max-h-[86px]">
                                <div className=" w-52 h-[86px] justify-between flex flex-col border-2 border-black px-4 py-2  ">
                                    <div className="flex flex-col h-full">
                                        <div className="text-sm mb-auto flex items-center gap-1.5 font-medium">
                                            <img alt="Solana" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6" src="/chains/solana.svg" style={{ color: 'transparent' }} />
                                            Contract address
                                        </div>
                                        <div className="flex text-sm items-center gap-1 mt-1.5">
                                            9BB6NF...bgpump
                                            <button className="ml-1 text-gray-400 hover:text-gray-600">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className=" border-l-0 w-52 h-[86px] justify-between flex flex-col border-2 border-black px-4 py-2  ">
                                    <div>
                                        <div className="text-sm flex items-center gap-1.5 font-medium">
                                            <Clock className="w-4 h-4" />
                                            Created
                                        </div>
                                        <div className="flex text-sm items-center gap-1 mt-1.5">
                                            Oct 18, 2024 <span className="text-text-tertiary">(116d ago)</span>
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
                                            Meme
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <h1 className="text-2xl font-medium font-display mb-1">Fartcoin</h1>
                                    </div>
                                    <p className="text-xs text-text-tertiary">@FartCoinOfSOL</p>
                                    <div className="mt-2 flex items-center gap-1">
                                        <div className="flex items-center rounded justify-center font-sans font-medium w-fit bg-badge-success-bg text-badge-success-text h-6 gap-1 text-xs px-2">
                                            $FARTCOIN
                                        </div>
                                        <div className="flex items-center rounded justify-center font-medium w-fit bg-quarternary text-text-primary text-[10px] leading-[12px] gap-1 px-1 font-mono h-auto py-1">
                                            <img alt="Solana" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-4" src="/chains/solana.svg" style={{ color: 'transparent' }} />
                                            9BB6NF...bgpump
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs mt-2 text-text-tertiary">
                            Tokenising farts with the help of bots. Fartcoin dev orphaned it, we adopted $Fartcoin No TG, No cabal, Fart freely! 💨
                        </p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" asChild>
                                    <a href="https://x.com/FartCoinOfSOL" target="_blank">
                                        𝕏
                                    </a>
                                </Button>
                                <Button variant="ghost" asChild className="flex items-center gap-1">
                                    <a href="https://www.geckoterminal.com/solana/tokens/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump" target="_blank">
                                        <img height="16" width="16" className="rounded-full mr-0.5" src="/geckoterminal.png" />
                                        GeckoTerminal
                                    </a>
                                </Button>
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
                        <TabsTrigger 
                            value="message"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-text-primary data-[state=active]:shadow-none rounded-none px-0 text-base font-medium"
                        >
                            <div className="flex items-center gap-1 text-base font-medium">Message</div>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="launching"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-text-primary data-[state=active]:shadow-none rounded-none px-0 text-base font-medium"
                        >
                            <div className="flex items-center gap-1 text-base font-medium">Launching</div>
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
                                <div className="h-[400px] md:h-[550px] md:border-2 md:rounded-lg relative flex flex-col border-2 border-black px-4 py-2 ">
                                    <div className="h-[100px] hidden md:flex justify-between p-4 border-b">
                                        <div>
                                            <p className="text-4xl font-medium">$0.51033</p>
                                            <span className="text-sm flex gap-1 items-center text-change-negative">
                                                -20.15%
                                            <span>(7D)</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-[450px] w-full p-4 relative hidden md:block ">
                                        <div className="flex flex-col w-full h-full relative pt-3">
                                            <Chart height="full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Swap */}
                                <div className="hidden md:block p-2 overflow-hidden h-[550px]  rounded-lg border-2 border-black px-4 py-2 ">
                                    <div className="flex flex-col gap-4">
                                        <div className="border-b border-border-primary pb-2 flex justify-between items-center">
                                            <span className="text-lg font-medium">Swap</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col p-4 border bg-primary ">
                                                <div className="text-xs text-text-tertiary mb-1">From</div>
                                                <div className="flex items-center gap-2">
                                                    <img src="/chains/solana.svg" className="w-6 h-6" />
                                                    <span className="font-medium">SOL</span>
                                                </div>
                                                <div className="text-2xl font-medium mt-2">0.0</div>
                                            </div>
                                            <div className="flex justify-center -my-2 z-10">
                                                <div className="bg-primary p-2 rounded-lg">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 3L8 13M8 13L13 8M8 13L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex flex-col p-4 border bg-primary ">
                                                <div className="text-xs text-text-tertiary mb-1">To</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                                                    <span className="font-medium">Fartcoin</span>
                                                </div>
                                                <div className="text-2xl font-medium mt-2">0.0</div>
                                            </div>
                                        </div>
                                        <Button  className="mt-4 border-2 border-black px-4 py-2 ">
                                            Connect wallet 
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </TabsContent>
                    <TabsContent value="overview" className="mt-4">
                    {/* Overview content */}
                    <Overview />
                    </TabsContent>
                    <TabsContent value="social" className="mt-4">
                    {/* Social content */}
                    <Social />
                    </TabsContent>
                    <TabsContent value="message" className="mt-4">
                    {/* Message content */}
                    <Message />
                    </TabsContent>
                    <TabsContent value="launching" className="mt-4">
                        <Launching />
                    </TabsContent>
                </Tabs>
                </div>

            {/* Mobile Navigation */}
            <div className="sm:hidden">
                <div className="border-t-2 border-tertiary grid grid-cols-3 h-[52px] bg-primary justify-evenly z-[999] w-full fixed bottom-0 gap-[1px]">
                    <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 text-2xs font-medium bg-white text-text-primary">
                    <div className="flex items-center gap-1">Trade</div>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 text-2xs font-medium bg-quarternary text-text-quarternary">
                    <div className="flex">Overview</div>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center justify-center gap-0.5 text-2xs font-medium bg-quarternary text-text-quarternary">
                    <div className="flex items-center gap-1">Social</div>
                    </Button>
                </div>
            </div>
            </div>
            
        </div>      
    
    </div>
    );
} 

