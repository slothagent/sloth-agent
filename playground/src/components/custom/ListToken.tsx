import { Coins } from 'lucide-react';
import { Rocket } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Cat, Sparkles } from 'lucide-react';
import { Dog } from 'lucide-react';
import Link from 'next/link'

const tokens = [
    { icon: <Coins className="w-6 h-6" />, name: "BFC", color: "text-green-500", value: "58.82K%" },
    { icon: <Rocket className="w-6 h-6" />, name: "JUP", color: "text-red-500", value: "-1.47%" },
    { icon: <ArrowUpRight className="w-6 h-6" />, name: "ALPHA", color: "text-green-500", value: "28.25%" },
    { icon: <Sparkles className="w-6 h-6" />, name: "GYAT", color: "text-green-500", value: "121.40%" },
    { icon: <Cat className="w-6 h-6" />, name: "POPCAT", color: "text-green-500", value: "6.43%" },
    { icon: <Dog className="w-6 h-6" />, name: "Bonk", color: "text-red-500", value: "-6.64%" },
    { icon: <Dog className="w-6 h-6" />, name: "TRUMP", color: "text-red-500", value: "-7.65%" },
    { icon: <Dog className="w-6 h-6" />, name: "Ai16z", color: "text-red-500", value: "-6.64%" },
    { icon: <Dog className="w-6 h-6" />, name: "arc", color: "text-red-500", value: "-0.58%" },
    { icon: <Dog className="w-6 h-6" />, name: "wiflove", color: "text-red-500", value: "46.96%" },
    { icon: <Dog className="w-6 h-6" />, name: "GRIFFAIN", color: "text-red-500", value: "-6.64%" },
    { icon: <Dog className="w-6 h-6" />, name: "1DOLAR", color: "text-red-500", value: "-6.64%" },
    { icon: <Dog className="w-6 h-6" />, name: "Bonk", color: "text-red-500", value: "-6.64%" },
    { icon: <Dog className="w-6 h-6" />, name: "Bonk", color: "text-red-500", value: "-6.64%" },
];

export default function ListToken() {
    return (
        <div className="w-full flex gap-2 overflow-x-auto scrollbar-hide pb-4">
            {tokens.map((token) => (
                <Link
                    key={token.name}
                    href={`/token/${token.name.toLowerCase()}`}
                    className="whitespace-nowrap flex-shrink-0 px-4 py-2 bg-white border-2 border-neutral-700 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                    <div className="text-[#93E905]">{token.icon}</div>
                    <span>{token.name}</span>
                    <span className={parseFloat(token.value) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {token.value}
                    </span>
                </Link>
            ))}
        </div>
    )
}
