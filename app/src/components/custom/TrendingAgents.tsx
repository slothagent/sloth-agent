import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const tableData = [
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
];

const TrendingAgents = () => {
  return (
    <div>
      <h2 className="text-2xl mt-16 font-bold mb-4 font-mono text-black">Trending AI Agents</h2>
      <Card className="border-2 text-black border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black hover:bg-[#93E905]/10">
              <TableHead className="font-mono">Token</TableHead>
              <TableHead className="text-right font-mono">Price</TableHead>
              <TableHead className="text-right font-mono">Change</TableHead>
              <TableHead className="text-right font-mono">Market Cap</TableHead>
              <TableHead className="text-right font-mono">Market Cap ATH</TableHead>
              <TableHead className="text-right font-mono">Liquidity</TableHead>
              <TableHead className="text-right font-mono">Volume 24H</TableHead>
              <TableHead className="text-right font-mono">Volume 24H ATH</TableHead>
              <TableHead className="text-right font-mono">Holders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow 
                key={row.id} 
                className="cursor-pointer border-b border-black hover:bg-[#93E905]/10"
                onClick={() => window.location.href = `/agents/${row.token.name.toLowerCase()}`}
              >
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-none bg-black flex-shrink-0"></div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{row.token.name}</span>
                      <span className="text-sm text-black/60 truncate">{row.token.address}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{row.price}</TableCell>
                <TableCell className={`text-right font-mono ${row.change.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.change.value}
                </TableCell>
                <TableCell className="text-right font-mono">{row.marketCap}</TableCell>
                <TableCell className="text-right font-mono">{row.marketCapATH}</TableCell>
                <TableCell className="text-right font-mono">{row.liquidity}</TableCell>
                <TableCell className="text-right font-mono">{row.volume24h}</TableCell>
                <TableCell className="text-right font-mono">{row.volume24hATH}</TableCell>
                <TableCell className="text-right font-mono">{row.holders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TrendingAgents; 