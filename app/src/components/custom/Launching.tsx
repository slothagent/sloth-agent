import React from 'react';
import { Badge } from '../ui/badge';

interface BondingCurveHolder {
    address: string;
    tag?: string;
    percentage: number;
}

const mockBondingCurveHolders: BondingCurveHolder[] = [
    { address: '0xc8C5...f77C', tag: 'Bonding Curve', percentage: 54.78 },
    { address: '0x7a59...cec6', percentage: 10.66 },
    { address: '0x3f8D...2A57', tag: 'Dev', percentage: 4.36 },
    { address: '0x011a...7AbD', percentage: 4.32 },
    { address: '0x98Be...eDbE', percentage: 3.86 },
    { address: '0x61c8...b569', percentage: 3.70 },
    { address: '0xC373...8000', percentage: 2.14 },
    { address: '0x8B6a...ADa1', percentage: 1.46 },
    { address: '0x1301...AF94', percentage: 1.33 },
    { address: '0x7a6D...9039', percentage: 1.25 },
];

const Launching = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Cap Stats */}
            <div className="bg-black text-white rounded-lg p-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">Current Target MarketCap</h3>
                        <div className="text-3xl font-bold">34,044.44</div>
                        <div className="text-[#93E905] text-sm">USD</div>
                    </div>

                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">AGENT Needed for Launch</h3>
                        <div className="text-3xl font-bold">242,066.32</div>
                        <div className="text-[#93E905] text-sm">AGENT</div>
                    </div>

                    <div>
                        <h3 className="text-gray-400 text-sm mb-1">Tokens on Bonding Curve</h3>
                        <div className="text-3xl font-bold">547,843,120.62</div>
                        <div className="text-[#93E905] text-sm">VOLF</div>
                    </div>
                </div>
            </div>

            {/* Bonding Curve Holders */}
            <div className="bg-black text-white rounded-lg p-6">
                <div className="space-y-4">
                    {mockBondingCurveHolders.map((holder, index) => (
                        <div key={holder.address} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">{index + 1}.</span>
                                <span className="font-mono">{holder.address}</span>
                                {holder.tag && (
                                    <Badge variant="outline" className="bg-[#93E905]/10 text-[#93E905] border-[#93E905]">
                                        {holder.tag}
                                    </Badge>
                                )}
                            </div>
                            <span className="font-mono">{holder.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Launching;
