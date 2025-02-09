interface TradingInterfaceProps {
    progress: number;
    mcap: string;
}

const TradingInterface = ({ progress, mcap }: TradingInterfaceProps) => {
    return (
        <div className="bg-gray-50 p-4 rounded">
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <span>Bonding Curve Progress ({progress}%)</span>
                    <span>Mcap: {mcap}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                    <div 
                        className="h-full bg-pink-500 rounded" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <button className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
                        Buy
                    </button>
                    <button className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-100 transition">
                        Sell
                    </button>
                </div>
                <button className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition">
                    Connect Wallet
                </button>
            </div>
        </div>
    );
};

export default TradingInterface; 