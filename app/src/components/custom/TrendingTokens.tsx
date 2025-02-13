import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const TrendingTokens = () => {
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
            {tableData.map((row) => (
              <TableRow key={row.id} className="border-b border-black text-black hover:bg-[#93E905]/10">
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-none bg-black flex-shrink-0"></div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate text-black">{row.token.name}</span>
                      <span className="text-sm text-black/60 truncate">{row.token.address}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{row.age}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{row.liq.amount} 🔥</div>
                  <div className="text-sm text-black/60">{row.liq.value}</div>
                </TableCell>
                <TableCell className="text-right text-black font-mono">{row.blueChip}</TableCell>
                <TableCell className="text-right font-mono">{row.holders}</TableCell>
                <TableCell className="text-right font-mono">{row.smart}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{row.txs.total}</div>
                  <div className="text-sm text-black/60">{row.txs.split}</div>
                </TableCell>
                <TableCell className="text-right font-mono">{row.vol}</TableCell>
                <TableCell className="text-right font-mono">{row.price}</TableCell>
                <TableCell className={`text-right font-mono ${row.changes.m1.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.changes.m1.value}
                </TableCell>
                <TableCell className={`text-right font-mono ${row.changes.m5.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.changes.m5.value}
                </TableCell>
                <TableCell className={`text-right font-mono ${row.changes.h1.isPositive ? 'text-[#93E905]' : 'text-red-600'}`}>
                  {row.changes.h1.value}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#93E905] font-mono">{row.audit.nomint ? 'Yes' : 'No'}</span>
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