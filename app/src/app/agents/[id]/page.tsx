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

export default function AgentDetails({ params }: { params: { id: string } }) {
  // Mock data for the agent
const agent = {
    id: params.id,
    name: 'FARTCOIN',
    address: '9BB6NF...bgpump',
    description: 'Tokenising farts with the help of bots. Fartcoin dev orphaned it, we adopted $Fartcoin No TG, No cabal, Fart freely! 💨',
    created: 'Oct 18, 2024',
    createdAgo: '116d ago',
};

    return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
    <div className="bg-primary top-0 sm:top-12 border-border-primary border-b sm:border-b-0">
        <div className="py-2 sm:py-4 lg:px-4 pt-2 flex md:items-center justify-between gap-4 max-lg:px-4 flex-col md:flex-row mb-0 lg:mt-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 justify-between sm:justify-start">
            <div className="flex items-center gap-1">
              <Link href="/" className="flex items-center gap-2">
                <button className="flex items-center justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] text-button-text-default bg-button-bg-default hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed h-8 gap-1 text-sm rounded-full aspect-square px-0">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </button>
                <div className="hidden sm:flex items-center gap-0.5">
                  <p className="text-text-primary text-sm font-medium">cookie.fun</p>
                </div>
              </Link>
              <div className="hidden sm:block">
                <button className="flex items-center justify-center w-max font-sans antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary [&>svg]:w-[1em] [&>svg]:h-[1em] disabled:bg-transparent hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed px-2 py-1.5 h-8 gap-2 text-sm font-medium text-text-primary border border-border-secondary rounded-lg">
                  <img className="size-5 rounded-xs" alt="F" src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" loading="lazy" />
                  {agent.name}
                </button>
              </div>
            </div>
            <div className="sm:hidden">
              <button className="flex items-center justify-center w-max font-sans antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary [&>svg]:w-[1em] [&>svg]:h-[1em] disabled:bg-transparent hover:bg-button-bg-hover group-hover:bg-button-bg-hover active:bg-button-bg-pressed px-2 py-1.5 h-8 gap-2 text-sm font-medium text-text-primary border border-border-secondary rounded-lg">
                <img className="size-5 rounded-xs" alt="F" src="https://pbs.twimg.com/profile_images/1848028530099052545/urFxrFx__400x400.jpg" loading="lazy" />
                {agent.name}
              </button>
            </div>
            <button className="flex items-center justify-center w-max font-sans font-medium antialiased focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus transition-all disabled:cursor-not-allowed disabled:text-text-tertiary disabled:bg-quarternary [&>svg]:w-[1em] [&>svg]:h-[1em] group-hover:bg-inverted-secondary active:bg-inverted-tertiary h-8 rounded-full px-3 group/star bg-quarternary gap-2 text-button-text-default text-sm hover:bg-tertiary aspect-square sm:aspect-auto">
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
    <div className = " flex flex-col max-w-7xl mx-auto sm:mt-4  mb-6  lg:px-4 lg:mb-12">
        <div className=" lg:mb-10 hidden sm:block">
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
                                                    <div className="flex items-center justify-center font-sans font-medium w-fit gap-1 rounded-full px-2 py-0.5 text-xs h-6 bg-transparent border-border-secondary text-text-tertiary border">
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
                    <div className="ml-auto w-max hidden lg:block">
                        <div className="grid grid-cols-2 max-h-[72px]">
                            <div className="border rounded-l-xl px-4 py-3 w-52 h-[72px] justify-between flex flex-col">
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
                            <div className="border border-l-0 rounded-r-xl px-4 py-3 w-52 h-[72px] justify-between flex flex-col">
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
            <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="trade" className="w-full">
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

              {/* Mobile Buy Button */}
            <div className="sm:hidden px-4 absolute -translate-y-[68px] w-full">
                <button className="flex items-center justify-center font-sans font-medium w-full h-12 text-base mt-2 bg-[#BCF8D0] rounded-full">
                    Buy $FARTCOIN
                </button>
            </div>

                <TabsContent value="trade" className="mt-4">
                {/* Trade content */}
                </TabsContent>
                <TabsContent value="overview" className="mt-4">
                {/* Overview content */}
                </TabsContent>
                <TabsContent value="social" className="mt-4">
                {/* Social content */}
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

        {/*Highcharts*/}
        <div className="flex flex-col gap-4">
            <div className="sm:hidden flex px-4 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium">$0.60282</span>
                </div>
            </div>
            <div className="md:grid grid-cols-1 md:grid-cols-[1fr,_400px] gap-4">
                <div className="bg-secondary rounded-lg p-4">
                    <div className="h-[300px] w-full">
                        {/* Chart component would go here */}
                    </div>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span>Swap</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center p-3 bg-primary rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>SOL</span>
                                </div>
                                <span>0.0</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-primary rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span>Fartcoin</span>
                                </div>
                                <span>0.0</span>
                            </div>
                        </div>
                        <button className="w-full bg-white text-black py-3 rounded-full">
                            Connect wallet
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-4 pt-4 sm:hidden pb-[100px]"></div>
        </div>
        
    </div>

    </div>
    );
} 
