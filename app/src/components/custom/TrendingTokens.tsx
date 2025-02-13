import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trendingTokens } from "@/data/tokens";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TrendingTokens = () => {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-2xl mt-8 font-bold mb-4 font-mono text-black">Trending Tokens</h2>
      <Card className="border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
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
            {trendingTokens.map((row) => (
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
                      <span className="font-medium truncate text-black">{row.token.name}</span>
                      <span className="text-sm text-black/60 truncate">{row.token.address}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{row.age}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{row.liquidity.amount} 🔥</div>
                  <div className="text-sm text-black/60">{row.liquidity.value}</div>
                </TableCell>
                <TableCell className="text-right text-black font-mono">{row.blueChipHolding}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{row.holders.count}</div>
                  <div className="text-sm text-black/60">+{row.holders.change24h}</div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div>{row.smartMoney.value}</div>
                  <div className="text-sm text-black/60">{row.smartMoney.kol} KOL</div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div>{row.transactions.total}</div>
                  <div className="text-sm text-black/60">{row.transactions.buys}/{row.transactions.sells}</div>
                </TableCell>
                <TableCell className="text-right font-mono">{row.volume.h1}</TableCell>
                <TableCell className="text-right font-mono">{row.price.current}</TableCell>
                <TableCell className={`text-right font-mono ${row.priceChanges.m1.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.priceChanges.m1.value}
                </TableCell>
                <TableCell className={`text-right font-mono ${row.priceChanges.m5.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.priceChanges.m5.value}
                </TableCell>
                <TableCell className={`text-right font-mono ${row.priceChanges.h1.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.priceChanges.h1.value}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#93E905] font-mono">{row.audit.noMint ? 'Yes' : 'No'}</span>
                    <span className="text-red-600 font-mono">{row.audit.blacklist ? 'Yes' : 'No'}</span>
                    <span className="text-[#93E905] font-mono">{row.audit.burn ? 'Yes' : 'No'}</span>
                    <Button size="sm" variant="outline" className="bg-white text-black border-2 border-black rounded-none font-mono hover:bg-[#93E905]">Buy</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TrendingTokens; 