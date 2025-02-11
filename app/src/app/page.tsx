"use client";

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Link from 'next/link';

// Mock data for table
const tableData = [
  {
    id: 1,
    token: { name: 'YODA', address: 'J5Tqp...ump' },
    age: '19d',
    liq: { amount: '84K', value: '$596.9K' },
    blueChip: '2.1%',
    holders: '5.6K',
    smart: '--',
    txs: { total: '24,351', split: '12,188/12,163' },
    vol: '$3.7K',
    price: '$0.0003',
    changes: {
      m1: { value: '+0.1%', isPositive: true },
      m5: { value: '+0.6%', isPositive: true },
      h1: { value: '+1.7%', isPositive: true }
    },
    audit: { nomint: true, blacklist: false, burn: true }
  },
  {
    id: 2,
    token: { name: 'SLTH', address: 'FknP...3oo' },
    age: '257d',
    liq: { amount: '7.1K', value: '$3.6K' },
    blueChip: '8.6%',
    holders: '58',
    smart: '--',
    txs: { total: '21,767', split: '14,671/7,096' },
    vol: '$100.1K',
    price: '$0.03648',
    changes: {
      m1: { value: '0%', isPositive: true },
      m5: { value: '+0.8%', isPositive: true },
      h1: { value: '+3.4%', isPositive: true }
    },
    audit: { nomint: true, blacklist: false, burn: true }
  },
  {
    id: 3,
    token: { name: 'SATS', address: 'CKM4g...ump' },
    age: '36m',
    liq: { amount: '33.4K', value: '$65.2K' },
    blueChip: '0.3%',
    holders: '1.1K',
    smart: '--',
    txs: { total: '19,488', split: '10,056/9,432' },
    vol: '$3.2M',
    price: '$0.06637',
    changes: {
      m1: { value: '+5%', isPositive: true },
      m5: { value: '-39.5%', isPositive: false },
      h1: { value: '+995.8%', isPositive: true }
    },
    audit: { nomint: true, blacklist: false, burn: true }
  },
  {
    id: 4,
    token: { name: 'DAVEWIF', address: 'HpsF1...ump' },
    age: '53m',
    liq: { amount: '11.6K', value: '$9.5K' },
    blueChip: '1.7%',
    holders: '402',
    smart: '--',
    txs: { total: '15,137', split: '13,606/1,531' },
    vol: '$668.1K',
    price: '$0.09542',
    changes: {
      m1: { value: '-0.5%', isPositive: false },
      m5: { value: '+10.9%', isPositive: true },
      h1: { value: '-56.2%', isPositive: false }
    },
    audit: { nomint: true, blacklist: false, burn: true }
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const prints = [
    {
      id: 'MB1',
      name: 'MB1 Print',
      image: '/assets/nfts/nft-example.png',
      code: '07044',
    },  
    {
      id: 'MB2',
      name: 'MB2 Print',
      image: '/assets/nfts/nft-example.png',
      code: '07045',
    },    
    {
      id: 'MB3',
      name: 'MB3 Print',
      image: '/assets/nfts/nft-example.png',
      code: '07046',
    },  
    {
      id: 'MB4',
      name: 'MB4 Print',
      image: '/assets/nfts/nft-example.png',
      code: '07047',
    },
    // Add more prints here
  ];

  return (
    <main className="min-h-screen mx-auto flex flex-col">   
      <Header />   
      <div className="w-full">
        <div className="flex max-h-[700px] bg-gradient-to-b from-[#93E905]/10 to-white">
          <div className="container mx-auto relative flex items-center gap-4 py-8 pt-16">
                {/* Left Card */}
                <div className="w-full md:w-[400px] max-h-[700px] bg-[#F7F7F7]  border-2">
                
                {/* Image Container */}
                <div className="rounded-lg w-full h-[600px] relative">
                  <div className="w-full h-full relative rounded-lg overflow-hidden">
                    <Image
                      src="/assets/nfts/nft-example.png"
                      alt="MB1 Print"
                      fill
                      className="object-cover" 
                      priority
                    />
                    {/* Overlay Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#93E905] to-transparent">
                      <div className="flex flex-col">
                        <h2 className="text-8xl font-bold text-white mb-1">MB1</h2>
                        <div className="flex flex-col gap-1">
                          <p className="text-gray-400 text-xl">07044</p>
                          <div className="flex items-center gap-2 text-gray-200 text-lg">
                            <span>UNIQUE PRINT</span>
                            <span className="text-2xl">•</span>
                            <span>5" x 7.5"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>              
              
                <div className=" w-full h-[90px] grid grid-cols-2">
                  <button className=" text-black py-3 rounded-lg font-medium transition-colors">
                    ADD TO CART
                  </button>
                  <button className="items-center justify-center text-black py-3 rounded-lg ">
                    DOWNLOAD
                  </button>
                </div>
              
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col justify-between p-10">

                {/* Search */}
                <div className="mb-8">
                  <div className="">
                    <input
                      type="text"
                      placeholder="Search AI Agents or infrastructure"
                      className="w-full bg-[#93E905]/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Timer */}
                <div className="  mb-12">
                  <div className="flex gap-4 text-2xl font-bold ">
                    <div>12 D</div>
                    <div>08 H</div>
                    <div>53 M</div>
                  </div>
                </div>

                {/* Featured Print */}
                <div className=" mb-12">
                  <h1 className="text-6xl font-bold mb-4 ">SLOTH AI<br />PLATFORM</h1>
                  <p className="text-gray-300 mb-8">
                    A pioneering platform designed to revolutionize the meme coin and decentralized finance (DeFi) space by providing an intuitive, AI-powered ecosystem for token creation and automated trading.
                  </p>
                  
                  <div className="flex gap-4">
                    <button className="bg-[#93E905] hover:bg-[#93E905]/80 px-6 py-2 rounded-lg transition-colors">
                      LAUNCH APP
                    </button>
                    <button className="bg-transparent border border-white px-6 py-2 rounded-lg hover:bg-white/10 transition-colors">
                      LEARN MORE
                    </button>
                  </div>
                </div>
              

              {/* Prints Grid*/}
              <div className=" mt-auto">
                  <div className="grid grid-cols-4 gap-6 ">
                    {prints.map((print) => (
                      <div key={print.id} className="bg-[#93E905]/50 rounded-lg p-1 hover:bg-[#93E905]/50 transition-colors cursor-pointer">
                        <div className="aspect-square relative">
                          <Image
                            src={print.image}
                            alt={print.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#93E905] to-transparent">
                            <h3 className="font-bold text-black text-sm">{print.name}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto pt-10">
          {/* Table */}
          <h2 className="text-2xl mt-8 font-bold mb-4">Trending Tokens</h2>
          <div className="flex gap-4 border-2">
            <div className="w-full overflow-x-auto ">
              <table className="w-full min-w-max table-fixed">
                <colgroup>
                  <col className="w-[200px]" /> {/* Token */}
                  <col className="w-[80px]" />  {/* Age */}
                  <col className="w-[120px]" /> {/* Liq $/MC */}
                  <col className="w-[100px]" /> {/* BlueChip */}
                  <col className="w-[100px]" /> {/* Holders */}
                  <col className="w-[120px]" /> {/* Smart $/KOL */}
                  <col className="w-[140px]" /> {/* 1h TXs */}
                  <col className="w-[100px]" /> {/* 1h Vol */}
                  <col className="w-[100px]" /> {/* Price */}
                  <col className="w-[80px]" />  {/* 1m% */}
                  <col className="w-[80px]" />  {/* 5m% */}
                  <col className="w-[80px]" />  {/* 1h% */}
                  <col className="w-[180px]" /> {/* Degen Audit */}
                </colgroup>
                <thead>
                  <tr className="border-b border-neutral-700 whitespace-nowrap">
                    <th className="p-3 text-left font-medium">Token</th>
                    <th className="p-3 text-left font-medium">Age</th>
                    <th className="p-3 text-right font-medium">Liq $/MC</th>
                    <th className="p-3 text-right font-medium">BlueChip</th>
                    <th className="p-3 text-right font-medium">Holders</th>
                    <th className="p-3 text-right font-medium">Smart $/KOL</th>
                    <th className="p-3 text-right font-medium">1h TXs</th>
                    <th className="p-3 text-right font-medium">1h Vol</th>
                    <th className="p-3 text-right font-medium">Price</th>
                    <th className="p-3 text-right font-medium">1m%</th>
                    <th className="p-3 text-right font-medium">5m%</th>
                    <th className="p-3 text-right font-medium">1h%</th>
                    <th className="p-3 text-right font-medium">Degen Audit</th>
                  </tr>
                </thead>
                <tbody >
                  {tableData.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-700 hover:bg-neutral-800/50 whitespace-nowrap">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-neutral-700 flex-shrink-0"></div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{row.token.name}</span>
                            <span className="text-sm text-neutral-400 truncate">{row.token.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{row.age}</td>
                      <td className="p-3 text-right">
                        <div>{row.liq.amount} 🔥</div>
                        <div className="text-sm text-neutral-400">{row.liq.value}</div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="text-green-500">{row.blueChip}</div>
                      </td>
                      <td className="p-3 text-right">{row.holders}</td>
                      <td className="p-3 text-right">{row.smart}</td>
                      <td className="p-3 text-right">
                        <div>{row.txs.total}</div>
                        <div className="text-sm text-neutral-400">{row.txs.split}</div>
                      </td>
                      <td className="p-3 text-right">{row.vol}</td>
                      <td className="p-3 text-right">{row.price}</td>
                      <td className={`p-3 text-right ${row.changes.m1.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {row.changes.m1.value}
                      </td>
                      <td className={`p-3 text-right ${row.changes.m5.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {row.changes.m5.value}
                      </td>
                      <td className={`p-3 text-right ${row.changes.h1.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {row.changes.h1.value}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-green-500">{row.audit.nomint ? 'Yes' : 'No'}</span>
                          <span className="text-red-500">{row.audit.blacklist ? 'Yes' : 'No'}</span>
                          <span className="text-green-500">{row.audit.burn ? 'Yes' : 'No'}</span>
                          <button className="px-2 py-1 bg-green-500/20 text-green-500 rounded">Buy</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Second Table */}
          <h2 className="text-2xl mt-8 font-bold mb-4">Trending AI Agents</h2>
          <div className="flex gap-4 border-neutral-500 border-2">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-max table-fixed">
                <colgroup>
                  <col className="w-[200px]" /> {/* Token */}
                  <col className="w-[120px]" /> {/* Price */}
                  <col className="w-[100px]" /> {/* Change */}
                  <col className="w-[120px]" /> {/* Market Cap */}
                  <col className="w-[140px]" /> {/* Market Cap ATH */}
                  <col className="w-[120px]" /> {/* Liquidity */}
                  <col className="w-[120px]" /> {/* Volume 24H */}
                  <col className="w-[140px]" /> {/* Volume 24H ATH */}
                  <col className="w-[100px]" /> {/* Holders */}
                </colgroup>
                <thead>
                  <tr className="border-b border-neutral-700 whitespace-nowrap">
                    <th className="p-3 text-left font-medium">Token</th>
                    <th className="p-3 text-right font-medium">Price</th>
                    <th className="p-3 text-right font-medium">Change</th>
                    <th className="p-3 text-right font-medium">Market Cap</th>
                    <th className="p-3 text-right font-medium">Market Cap ATH</th>
                    <th className="p-3 text-right font-medium">Liquidity</th>
                    <th className="p-3 text-right font-medium">Volume 24H</th>
                    <th className="p-3 text-right font-medium">Volume 24H ATH</th>
                    <th className="p-3 text-right font-medium">Holders</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 1,
                      token: { name: 'PEPE', address: '0x123...abc' },
                      price: '$0.0000001',
                      change: { value: '-2.45%', isPositive: false },
                      marketCap: '$880.25M',
                      marketCapATH: '$1.2B',
                      liquidity: '$55.75M',
                      volume24h: '$4.6M',
                      volume24hATH: '$12.8M',
                      holders: '402,867'
                    },
                    {
                      id: 2,
                      token: { name: 'WOJAK', address: '0x456...def' },
                      price: '$0.000023',
                      change: { value: '+5.67%', isPositive: true },
                      marketCap: '$450.12M',
                      marketCapATH: '$890.5M',
                      liquidity: '$32.45M',
                      volume24h: '$2.8M',
                      volume24hATH: '$8.4M',
                      holders: '285,432'
                    },
                    {
                      id: 3,
                      token: { name: 'DOGE', address: '0x789...ghi' },
                      price: '$0.0845',
                      change: { value: '+1.23%', isPositive: true },
                      marketCap: '$11.2B',
                      marketCapATH: '$15.8B',
                      liquidity: '$245.67M',
                      volume24h: '$18.9M',
                      volume24hATH: '$45.2M',
                      holders: '1,245,789'
                    }
                  ].map((row) => (
                    <tr 
                      key={row.id} 
                      className="border-b border-neutral-700 hover:bg-neutral-800/50 whitespace-nowrap cursor-pointer" 
                      onClick={() => window.location.href = `/agents/${row.token.name.toLowerCase()}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-neutral-700 flex-shrink-0"></div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{row.token.name}</span>
                            <span className="text-sm text-neutral-400 truncate">{row.token.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">{row.price}</td>
                      <td className={`p-3 text-right ${row.change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {row.change.value}
                      </td>
                      <td className="p-3 text-right">{row.marketCap}</td>
                      <td className="p-3 text-right">{row.marketCapATH}</td>
                      <td className="p-3 text-right">{row.liquidity}</td>
                      <td className="p-3 text-right">{row.volume24h}</td>
                      <td className="p-3 text-right">{row.volume24hATH}</td>
                      <td className="p-3 text-right">{row.holders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}