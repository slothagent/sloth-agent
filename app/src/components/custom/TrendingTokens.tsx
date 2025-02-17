import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPaginatedTokens } from "@/data/tokens";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TrendingTokens = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { data: tokens, metadata } = getPaginatedTokens(currentPage, pageSize);

  return (
    <div>
      <h2 className="text-2xl mt-8 font-bold mb-4 font-mono text-white">Trending Tokens</h2>
      <Card className="border-2 border-white bg-[#14161f] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black hover:bg-[#93E905]/10">
              <TableHead className="font-mono">Token</TableHead>
              <TableHead className="font-mono">Age</TableHead>
              <TableHead className="text-right font-mono">Liq $/MC</TableHead>
              <TableHead className="text-right font-mono">BlueChip</TableHead>
              <TableHead className="text-right font-mono">Holders</TableHead>
              <TableHead className="text-right font-mono">Smart $/KOL</TableHead>
              <TableHead className="text-right font-mono">1h TXs</TableHead>
              <TableHead className="text-right font-mono">1h Vol</TableHead>
              <TableHead className="text-right font-mono">Price</TableHead>
              <TableHead className="text-right font-mono">1m%</TableHead>
              <TableHead className="text-right font-mono">5m%</TableHead>
              <TableHead className="text-right font-mono">1h%</TableHead>
              <TableHead className="text-right font-mono">Degen Audit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((row) => (
              <TableRow key={row.id} className="border-b border-black text-black hover:bg-[#93E905]/10 cursor-pointer" onClick={() => router.push(`/agent/${row.token.symbol}`)}>
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <Image 
                      src={row.token.logo} 
                      alt={row.token.name} 
                      width={32} 
                      height={32} 
                      className="rounded-none"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate text-white">{row.token.name}</span>
                      <span className="text-sm text-white/60 truncate">{row.token.address}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-white">{row.age}</TableCell>
                <TableCell className="text-right font-mono text-white">
                  <div>{row.liquidity.amount} 🔥</div>
                  <div className="text-sm text-white/60">{row.liquidity.value}</div>
                </TableCell>
                <TableCell className="text-right text-white font-mono">{row.blueChipHolding}</TableCell>
                <TableCell className="text-right font-mono text-white">
                  <div>{row.holders.count}</div>
                  <div className="text-sm text-white/60">+{row.holders.change24h}</div>
                </TableCell>
                <TableCell className="text-right font-mono text-white">
                  <div>{row.smartMoney.value}</div>
                  <div className="text-sm text-white/60">{row.smartMoney.kol} KOL</div>
                </TableCell>
                <TableCell className="text-right font-mono text-white">
                  <div>{row.transactions.total}</div>
                  <div className="text-sm text-white/60">{row.transactions.buys}/{row.transactions.sells}</div>
                </TableCell>
                <TableCell className="text-right font-mono text-white">{row.volume.h1}</TableCell>
                <TableCell className="text-right font-mono text-white">{row.price.current}</TableCell>
                <TableCell className={`text-right font-mono text-white ${row.priceChanges.m1.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.priceChanges.m1.value}
                </TableCell>
                <TableCell className={`text-right font-mono ${row.priceChanges.m5.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.priceChanges.m5.value}
                </TableCell>
                <TableCell className={`text-right font-mono ${row.priceChanges.h1.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.priceChanges.h1.value}
                </TableCell>
                <TableCell className="text-right text-white">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#93E905] font-mono">{row.audit.noMint ? 'Yes' : 'No'}</span>
                    <span className="text-red-600 font-mono">{row.audit.blacklist ? 'Yes' : 'No'}</span>
                    <span className="text-[#93E905] font-mono">{row.audit.burn ? 'Yes' : 'No'}</span>
                    <Button size="sm" variant="outline" className=" text-white border-2 border-black rounded-none font-mono hover:bg-[#93E905] button-default">Buy</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex items-center justify-between px-4 py-4 border-t border-black">
          <div className="flex-1 text-sm text-white">
            Page {metadata.currentPage} of {metadata.totalPages}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 border-2 border-black rounded-none font-mono"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                {'<'}
              </Button>
              <div className="flex w-[100px] justify-center font-mono text-white">
                {currentPage} / {metadata.totalPages}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 border-2 border-black rounded-none font-mono"
                onClick={() => setCurrentPage(prev => Math.min(metadata.totalPages, prev + 1))}
                disabled={currentPage === metadata.totalPages}
              >
                {'>'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrendingTokens; 