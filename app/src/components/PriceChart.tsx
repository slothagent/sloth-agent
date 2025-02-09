import { 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Bar,
  Line,
  Area
} from 'recharts';
import { useState } from 'react';

interface ChartData {
    time: string;
    fullTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface PriceChartProps {
    data: ChartData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
    const [timeframe, setTimeframe] = useState('1m');
    const timeframes = ['1m', '1h'];

    // Tính toán giá trị min/max cho trục Y
    const yDomain = data.reduce(
        (acc, item) => ({
            min: Math.min(acc.min, item.low),
            max: Math.max(acc.max, item.high)
        }),
        { min: Infinity, max: -Infinity }
    );

    return (
        <div className="w-full">
            {/* Chart Controls */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2">
                    {timeframes.map((tf) => (
                        <button
                            key={tf}
                            className={`px-3 py-1 text-sm rounded ${
                                timeframe === tf 
                                    ? 'bg-[#2962FF] text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                                setTimeframe(tf);
                                // Emit event để parent component biết timeframe đã thay đổi
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('timeframeChange', { detail: tf }));
                                }
                            }}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                            fontSize: 10,
                            fill: '#666'
                        }}
                        interval={1}
                    />
                    <YAxis 
                        orientation="right"
                        domain={[yDomain.min * 0.999, yDomain.max * 1.001]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ 
                            fontSize: 10,
                            fill: '#666'
                        }}
                        tickFormatter={(value) => value.toFixed(7)}
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            padding: '8px 12px',
                            fontSize: '10px'
                        }}
                        labelStyle={{ 
                            color: '#666', 
                            marginBottom: '4px',
                            fontSize: '10px'
                        }}
                        labelFormatter={(label: any, payload: any) => {
                            if (payload && payload[0]) {
                                return payload[0].payload.fullTime;
                            }
                            return label;
                        }}
                        formatter={(value: any, name: string) => [
                            value.toFixed(7),
                            name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                    />
                    <Bar
                        dataKey="close"
                        fill="#2962FF"
                        shape={(props: any) => {
                            const { x, y, width, height } = props;
                            const { open, close, high, low } = props.payload;
                            const color = close >= open ? '#26A69A' : '#EF5350';
                            const barWidth = Math.max(width * 0.2, 1);
                            const centerX = x + (width - barWidth) / 2;
                            
                            return (
                                <g>
                                    <rect
                                        x={centerX}
                                        y={Math.min(
                                            props.height - (open - yDomain.min) / (yDomain.max - yDomain.min) * props.height,
                                            props.height - (close - yDomain.min) / (yDomain.max - yDomain.min) * props.height
                                        )}
                                        width={barWidth}
                                        height={Math.abs(
                                            (close - open) / (yDomain.max - yDomain.min) * props.height
                                        )}
                                        fill={color}
                                    />
                                    <line
                                        x1={centerX + barWidth / 2}
                                        y1={props.height - (high - yDomain.min) / (yDomain.max - yDomain.min) * props.height}
                                        x2={centerX + barWidth / 2}
                                        y2={props.height - (low - yDomain.min) / (yDomain.max - yDomain.min) * props.height}
                                        stroke={color}
                                        strokeWidth={1}
                                    />
                                </g>
                            );
                        }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart; 