import { formatNumber } from '@/utils/format';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface PredictionData {
  Time: string;
  Decision: string;
  Amount: number;
  "Predicted Price": number;
  "Current Price": number;
}

interface PredictionBarProps {
  predictions: Record<string, PredictionData>;
}

export default function PredictionBar({ predictions }: PredictionBarProps) {
  return (
    <div className="w-full bg-gradient-to-r from-gray-100 to-white text-gray-800 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-6 items-center">
          {Object.entries(predictions).map(([symbol, data]) => {
            const priceDiff = data["Predicted Price"] - data["Current Price"];
            const percentChange = (priceDiff / data["Current Price"]) * 100;
            const isPositive = priceDiff > 0;

            return (
              <div key={symbol} className="flex-shrink-0 group">
                <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-50 transition-all duration-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold tracking-wide">{symbol.replace('USDT', '')}</span>
                    <span className="text-xs text-gray-500 font-medium">USDT</span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold tracking-tight">
                      ${formatNumber(data["Current Price"])}
                    </span>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium
                      ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {isPositive ? (
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-3 h-3" />
                      )}
                      {Math.abs(percentChange).toFixed(2)}%
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Predicted:</span>
                    <span className={`text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${formatNumber(data["Predicted Price"])}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${data.Decision === 'buy' ? 'bg-green-100 text-green-600' : 
                        data.Decision === 'sell' ? 'bg-red-100 text-red-600' : 
                        'bg-gray-100 text-gray-600'}`}>
                      {data.Decision}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 