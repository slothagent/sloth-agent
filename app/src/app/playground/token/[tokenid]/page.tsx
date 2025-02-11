"use client";
import Sidebar from "@/components/custom/Sidebar";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { 
  Send, 
  Bot, 
  Search,
  CircleDot,
  Blocks 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export default function TokenPage({ params }: { params: { tokenid: string } }) {
  const CookieDaoContent = () => (
    <div className="flex-1">
      {/* Cookie Dao Content */}
      <div className="space-y-4 mb-6">
        <div className="space-y-4 border-b pb-4 border-gray-300">
          <h2 className="text-2xl font-semibold">Mindshare</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">2.92</span>
            <span className="text-red-500 bg-red-100 px-2 py-1 rounded">-7.61%</span>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold mb-6">Trading</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-gray-500 mb-2">Market Cap</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$186.59M</p>
                <p className="text-red-500">-11.49%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Price</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$0.19</p>
                <p className="text-red-500">-11.67%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Volume 24 Hours</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$40.95M</p>
                <p className="text-green-500">31.77%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Holders Count</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">64.65K</p>
                <p className="text-red-500">-0.19%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Liquidity</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$6.25M</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartContent = () => (
    <div className="flex-1">
      {/* Time interval buttons */}
      <div className="flex gap-4 mb-6">
        {["5m", "15m", "1H", "1D"].map((interval) => (
          <button
            key={interval}
            className={`px-6 py-2 text-lg ${
              interval === "15m"
                ? "border-2 border-black text-gray-900 font-medium"
                : "text-gray-500 hover:border-2 hover:border-black"
            }`}
          >
            {interval}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="w-full h-[500px] rounded-lg bg-white border border-gray-200 relative">
        {/* Grid lines would be implemented with the chart library */}
        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between text-base text-gray-500 py-4">
          <span>0.24</span>
          <span>0.22</span>
          <span>0.20</span>
          <span>0.18</span>
          <span>0.16</span>
          <span>0.14</span>
          <span>0.12</span>
          <span>0.10</span>
        </div>
      </div>

      {/* Time range buttons */}
      <div className="flex gap-4 mt-6 w-full">
        {["30m", "1h", "2h", "4h"].map((range) => (
          <button
            key={range}
            className="flex-1 px-8 py-3 text-2xl bg-gray-200 hover:border-2 hover:border-black hover:bg-gray-300 text-gray-700 font-medium"
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );

  const MobyContent = () => (
    <div className="flex-1">
      {/* Stats Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-6">Stats</h2>
          <div className="grid grid-cols-3 gap-12">
            <div>
              <p className="text-gray-500 mb-2">Total Whale Buys</p>
              <p className="text-3xl font-bold">3.40K</p>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Total Whale Sells</p>
              <p className="text-3xl font-bold">7.83K</p>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Total Whale Volume</p>
              <p className="text-3xl font-bold">$191.44M</p>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Largest Trade</p>
              <p className="text-3xl font-bold">$679.78K</p>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Avg Market Cap</p>
              <p className="text-3xl font-bold">$367.37M</p>
            </div>
          </div>
        </div>

        {/* Top 10 Traders Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Top 10 Traders</h2>
          <div className="space-y-4">
            {[
              { rank: 1, trades: 381, volume: "$90.40K", address: "K0EhCW" },
              { rank: 2, trades: 135, volume: "$7.38M", address: "XXFSB0" },
              { rank: 3, trades: 245, volume: "$5.92M", address: "9XKP2W" },
              { rank: 4, trades: 198, volume: "$4.76M", address: "M7NHV5" },
              { rank: 5, trades: 167, volume: "$3.89M", address: "R4TUQ8" },
              { rank: 6, trades: 156, volume: "$3.45M", address: "B2YJL9" },
              { rank: 7, trades: 134, volume: "$2.98M", address: "E6WKS3" },
              { rank: 8, trades: 122, volume: "$2.54M", address: "H9VFD4" },
              { rank: 9, trades: 108, volume: "$2.12M", address: "U3ZMC7" },
              { rank: 10, trades: 95, volume: "$1.87M", address: "G5XNA1" },
              // Add more traders as needed
            ].map((trader) => (
              <div 
                key={trader.rank}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-semibold">
                    {trader.rank}
                  </div>
                  <div>
                    <p className="font-medium">Trades: {trader.trades}</p>
                    <p className="text-gray-500">Volume: {trader.volume}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{trader.address}</span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-full">
                      <CircleDot className="w-5 h-5 text-green-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-full">
                      <Send className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen bg-white ${spaceGrotesk.className}`}>
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0">
        <Sidebar/>
      </div>

      {/* Main content */}
      <div className="flex-grow p-6">
        {/* Search bar */}
        <div className="flex w-full mb-4 gap-2">
          <input 
            type="text"
            placeholder="Search for a token" 
            className="w-full bg-white border-4 border-black text-gray-700 px-4 py-3 pr-12 focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-400 text-lg"
          />
          <div className="flex items-center p-4 bg-green-400">
            <Search className="w-6 h-6 text-green-700" />
          </div>
        </div>

        {/* Header with token info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-3">
            <Blocks className="w-10 h-10 text-gray-700" />
          </div>
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">test griffain.com</h1>
            <p className="text-gray-500 text-lg">GRIFFAIN</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger 
              value="overview"
              className="text-xl font-medium data-[state=active]:border-b-4 data-[state=active]:border-gray-900"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="cookie"
              className="text-xl font-medium data-[state=active]:border-b-4 data-[state=active]:border-gray-900"
            >
              Cookie Dao
            </TabsTrigger>
            <TabsTrigger 
              value="moby"
              className="text-xl font-medium data-[state=active]:border-b-4 data-[state=active]:border-gray-900"
            >
              Moby
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <ChartContent />
          </TabsContent>
          
          <TabsContent value="cookie">
            <CookieDaoContent />
          </TabsContent>
          
          <TabsContent value="moby">
            <MobyContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat sidebar */}
      <div className="w-[480px] flex-shrink-0 border-l border-gray-200 p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Bot className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h2 className="text-gray-900 font-medium text-xl">Chat with Agent Dora</h2>
              <p className="text-gray-500 text-base">
                Google for tokens. Search for a token and swap it just by typing.
              </p>
            </div>
          </div>

          {/* Chat messages will go here */}
          <div className="flex-1"></div>

          {/* Message input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Message Dora"
              className="w-full px-5 py-4 bg-gray-100 rounded-lg pr-14 text-lg text-gray-900 placeholder-gray-500 border-none focus:ring-1 focus:ring-gray-300"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#4ade80] p-3 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Token Search button */}
          <button className="mt-4 w-full py-3 px-5 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center gap-3 hover:bg-gray-200 text-lg font-medium">
            <CircleDot className="w-5 h-5" />
            Token Search
          </button>
        </div>
      </div>
    </div>
  );
}

