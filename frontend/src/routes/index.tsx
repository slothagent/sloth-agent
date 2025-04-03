import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Hero from "../components/custom/Hero";
import TransactionList from "../components/custom/TransactionList";
import TokenMarket from "../components/custom/TokenMarket";
import { useSolanaTokens } from "../hooks/useWebSocketData";
import { Loader2, Copy } from "lucide-react";
import { copyToClipboard } from "../utils/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useState } from "react";
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const newsDatas = [
  {
    title: "FTX to repay $11.4 billion to creditors after a 27-month battle, addressing a massive backlog of claims.",
    source: "1 2",
  },
  {
    title: "Experts call for stablecoin regulations in the US before implementing crypto tax...",
    source: "2 Sources",
  },
];
const newsData = [
  {
    title: "Android malware ‘Crocodilus’ can take over phones to steal crypto",
    time: "39 minutes ago",
    source: "CoinTelegraph",
  },
  {
    title: "One in four S&P 500 firms will hold Bitcoin by 2030: Crypto advisory",
    time: "2 hours ago",
    source: "CoinTelegraph",
  },
  {
    title: "Bitcoin, Crypto Prices Slide as Trade Tensions, Inflation Risks Rattle Markets",
    time: "4 hours ago",
    source: "Decrypt",
  },
  {
    title: "Analysis of $700k oracle manipulation exploit highlights vulnerabilities in DeFi vaults",
    time: "5 hours ago",
    source: "The Block",
  },
  {
    title: "Centralization and the dark side of asset tokenization — MEXC exec",
    time: "8 hours ago",
    source: "CoinTelegraph",
  },
  {
    title: "Terraform Labs Creditors Have a Month to Submit Claims for Losses",
    time: "9 hours ago",
    source: "Decrypt",
  },
  {
    title: "PumpSwap DEX crosses $10 billion in cumulative volume 10 days after launch",
    time: "10 hours ago",
    source: "The Block",
  },
];
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [search, setSearch] = useState("");
  const { tokens, loading } = useSolanaTokens();
  const navigate = useNavigate()
  // console.log(tokens[0],loading);
  return (
    <main className="min-h-screen mx-auto flex flex-col bg-[#0B0E17]">   
      <div className="w-full mx-auto px-4">
        <Hero />
        <div className="container mx-auto space-y-8 pb-10">
        <div className="space-y-2">
          <Tabs defaultValue="home" className="w-full flex flex-col items-start justify-start">
            <TabsList className="flex mb-4 text-white md:w-auto lg:w-auto">
              <TabsTrigger value="home" className="px-3 whitespace-nowrap">Home</TabsTrigger>
              <TabsTrigger value="feed" className="px-3 whitespace-nowrap">Feed</TabsTrigger>
              <TabsTrigger value="top-assets" className="px-3 whitespace-nowrap">Top Assets</TabsTrigger>
              <TabsTrigger value="transactions" className="px-3 whitespace-nowrap">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="home" className="space-y-6 w-full flex gap-2">
            <div className="w-full">
            <h1 className="text-white text-2xl font-bold mt-5">Meme Pump</h1>
            <span className="text-gray-400 text-sm">🌱 New Creations</span>
            <div className="flex flex-col overflow-y-auto max-h-[500px] py-2 mt-10">
              {
                tokens.length == 0 && loading && (
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-sm flex flex-row items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                  </div>
                )
              } 
              {tokens.map((token,index) => (
                <div 
                  key={index} 
                  className="min-w-[350px] bg-[#161B28] rounded-lg p-4 hover:bg-[#2D3748] transition-all cursor-pointer md:border-b border-gray-600"
                  onClick={()=> navigate({to: `/sol/${token?.mint}`})}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-row items-start gap-2">
                        {token.metadata?.image && (
                          <img 
                            src={token.metadata.image} 
                            alt={token.metadata.name} 
                            className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <h3 className="text-white font-bold">{token.metadata?.name}</h3>
                              <div className="flex flex-row items-center gap-2">
                                <p className="text-gray-400 text-sm">@{token.metadata?.symbol}   ||</p>
                                <div className="flex flex-row gap-2">
                                  <a 
                                    href={`https://pump.fun/coin/${token?.mint}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-400 text-sm flex flex-row items-center gap-2 hover:underline"
                                  >
                                    {token?.mint?.slice(0,4)}...{token?.mint?.slice(-4)}
                                  </a>
                                  <Copy 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(token?.mint || '');
                                    }} 
                                    className="w-4 h-4 text-gray-400 cursor-pointer" 
                                  
                                  />
                                </div>
                              </div>
                              <div className="flex flex-row gap-2">
                                {token.metadata?.twitter && (
                                  <a 
                                    href={token.metadata.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                  </a>
                                )}

                                {token.metadata?.website && (
                                  <a 
                                    href={token.metadata.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <img src="/assets/icon/pump.png" alt="pump" className="w-6 h-6" />
                        </div>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <TokenMarket />
            </TabsContent>
                
            <TabsContent value="feed" className="space-y-4">
              <div className="flex flex-col w-full">
                <h2 className="text-white text-xl font-semibold mb-4">Activity Feed</h2>
                <div className="flex gap-2 h-3/4">
                  <div className="flex-1 mx-auto p-4 bg-[#161B28] max-h-[745px] overflow-y-auto  text-white">
                    <Input
                      type="text"
                      placeholder="Search the feed"
                      className="w-full p-2 mb-4 text-white rounded"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Card className="p-4 bg-transparent border-none max-h-[735px] overflow-y-auto">
                      <h2 className="text-lg text-white  font-bold border-b pb-2 mb-2">Daily News Recap</h2>
                      <p className="text-sm text-gray-400 mb-4">Updated 20 minutes ago</p>
                      <div className="space-y-3 ">
                        {newsData
                          .filter((news) =>
                            news.title.toLowerCase().includes(search.toLowerCase())
                          )
                          .map((news, index) => (
                            <div
                              key={index}
                              className="p-3 border-b border-gray-700 flex justify-between gap-2 items-center"
                            >
                              <div>
                                <h3 className="font-bold text-sm text-white">{news.title}</h3>
                                <p className="text-sm text-gray-400">{news.time} • News</p>
                              </div>
                              <span className="px-2 py-1 text-xs text-nowrap text-white bg-gray-700 rounded">{news.source}</span>
                            </div>
                          ))}
                      </div>
                    </Card>
                  </div>
              
                  <div className="max-w-2xl mx-auto p-4 bg-[#161B28] text-white">
                    <Card className="p-4 bg-transparent text-white border-none rounded-lg">
                      <h2 className="text-lg font-bold">Daily News Recap</h2>
                      <p className="text-2xl font-bold mt-1">Today, March 30</p>
                      <p className="text-sm text-gray-400 mt-2">Updated 43 minutes ago</p>
                      <a href="#" className="text-blue-400 mt-2 block">View All Recaps →</a>
                    </Card>
                    <Card className="p-4 bg-transparent border-none mt-4">
                      <p className="text-sm text-gray-400">Powered by MessariAI</p>
                      <p className="mt-2 text-white">Mentioned Assets: 🪙🔷❌💠 +2</p>
                      <ul className="mt-2 space-y-2">
                        {newsDatas.map((news, index) => (
                          <li key={index} className="border-b border-gray-700 pb-2">
                            <p className="text-white">{news.title}</p>
                            <span className="text-blue-400 text-sm">{news.source}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card className="p-4 bg-transparent border-none  mt-4 text-center border border-yellow-500">
                      <div className="flex justify-center">
                        <div className="p-2 bg-yellow-500 rounded-full">
                          🚀
                        </div>
                      </div>
                      <p className="mt-2 text-lg text-white font-bold">Upgrade to <span className="text-yellow-400">Lite</span> for Access to Daily Recaps</p>
                      <Button className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-lg">Upgrade to Lite</Button>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
                
                
            <TabsContent value="top-assets" className="space-y-4">
              <div className="flex justify-center items-center py-8">
                <span className="text-gray-400">Top Assets content coming soon</span>
              </div>
            </TabsContent>
                
            <TabsContent value="transactions" className="space-y-4">
              <TransactionList />
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </main>
  );
}

export default Index;