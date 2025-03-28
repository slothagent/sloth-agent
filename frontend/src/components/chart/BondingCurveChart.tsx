import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useCalculateBin } from '../../hooks/useCalculateBin';

interface BondingCurveChartProps {
  height?: number;
  width?: string | number;
  tokenAddress?: string;
  refreshTrigger?: number;
  network?: string;
}

const formatToMillions = (value: string) => {
  if (!value || value === "0") return "0";
  
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  
  const rounded = Math.round(num);
  if (Math.abs(num - rounded) < 0.000001) {
    if (rounded >= 1_000_000) {
      return (rounded / 1_000_000).toFixed(2) + 'M';
    }
    return rounded.toString();
  }
  
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }

  if (num < 0.01) {
    return num.toFixed(6);
  }
  return num.toFixed(2);
};

const BondingCurveChart: React.FC<BondingCurveChartProps> = ({
  height = 350,
  width = '100%',
  tokenAddress = '0x21D0a122e3bF9fFc7E8A7C34F250211B1139306C',
  network = 'Sonic',
  refreshTrigger = 0
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(false);

  const { getBinDetails } = useCalculateBin();
  
  useEffect(() => {
    const fetchTokenDetails = async () => {
      setLoading(true);
      try {
        const rpcUrl = network == "Sonic" ? "https://rpc.blaze.soniclabs.com" : "https://rpcv2-testnet.ancient8.gg";
        const addressSlothFactory = network == "Sonic" ? process.env.PUBLIC_FACTORY_ADDRESS_SONIC as `0x${string}` : process.env.PUBLIC_FACTORY_ADDRESS_ANCIENT8 as `0x${string}`;
        // Get token details 
        const details = await getBinDetails(tokenAddress, rpcUrl, addressSlothFactory);
        // console.log("details", details);
        setTokenData(details);
        // console.log(details);
        setHasData(details.formattedData && 
          typeof details.formattedData === 'object' && 
          Object.keys(details.formattedData).length > 0);
      } catch (error) {
        console.error(error);
        
        // Set to no data when API call fails
        setTokenData(null);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokenDetails();
  }, [tokenAddress, refreshTrigger]);
  
  // Pre-calculate the chart data only when tokenData changes
  const chartData = useMemo(() => {
    if (!hasData || !tokenData) {
      return Array.from({ length: 19 }, (_, i) => ({
        name: i.toString(),
        value: 150 * Math.pow(1.05, i) + 10,
        noData: true,
        token: `token${i}`,
        tokenValue: "0",
        sonic: "SONIC",
        sonicValue: "0",
        binIndex: i.toString(),
      }));
    }
    
    // Use the distribution from the bins calculation
    const binsData = tokenData.allBinsDistribution || [];
    
    // If we have bins data, use it for the chart
    if (binsData.length > 0) {
      return binsData.map((bin: any, i: number) => {  
        // Visual height for chart - make it proportional to token amount
        const value = 150 * Math.pow(1.05, i) + 10;
        
        if(Number(tokenData.formattedData.currentBin) === i) {
          const sonicValue = Number(bin.formattedData.sonicNeeded) - Number(tokenData.formattedData.sonicNeeded);
          return {
            name: i.toString(),
            value: value,
            noData: false,
            token: `token${i}`,
            tokenValue: formatToMillions(tokenData.formattedData.tokensInBin),
            sonic: "SONIC",
            sonicValue: sonicValue.toFixed(2),
            binIndex: i.toString(),
            tokenFullAmount: tokenData.formattedData.tokensInBin,
            sonicFullAmount: tokenData.formattedData.sonicNeeded,
            tokensPerSonic: tokenData.formattedData.tokensPerSonic,
            sonicPrice: tokenData.formattedData.sonicPrice,
          }
        }
        
        return {
          name: i.toString(),
          value: value,
          noData: false,
          token: `token${i}`,
          tokenValue: formatToMillions(bin.formattedData.tokensInBin),
          sonic: "SONIC",
          sonicValue: 0,
          binIndex: i.toString(),
          tokenFullAmount: bin.formattedData.tokensInBin,
          sonicFullAmount: bin.formattedData.sonicNeeded
        };
      });
    }
  
    
    // Create data with minimal calculations
    return Array.from({ length: 19 }, (_, i) => { 
      // Visual height for chart
      const value = 150 * Math.pow(1.05, i) + 10;
      
      return {
        name: i.toString(),
        value: value,
        noData: i !== 0, // Only bin 0 has data in fallback
        token: `token${i}`,
        tokenValue: i === 0 ? formatToMillions(tokenData.formattedData.tokensInBin) : "0",
        sonic: "SONIC",
        sonicValue: i === 0 ? tokenData.formattedData.sonicNeeded : "0",
        binIndex: i.toString(),
        tokenFullAmount: i === 0 ? tokenData.formattedData.tokensInBin : "0",
        sonicFullAmount: i === 0 ? tokenData.formattedData.sonicNeeded : "0"
      };
    });
  }, [hasData, tokenData]);

  const handleMouseOver = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasTokens = parseFloat(data.tokenValue) > 0;

      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'var(--chakra-colors-cardHover, #2D3748)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '220px'
        }}>
          <p style={{ 
            color: '#f8f8f8', 
            margin: '0', 
            fontSize: '14px',
            fontWeight: 'bold' 
          }}>
            {`Number of tokens in bin`}
          </p>
          
          <div style={{ marginTop: '6px', marginBottom: '6px' }}>
            <p style={{ 
              color: '#f8f8f8', 
              margin: '0', 
              fontSize: '14px'
            }}>
              {data.tokenValue} {hasTokens && data.percentageOfTotal}
            </p>
          </div>
          
          <div style={{ marginTop: '6px' }}>
            <p style={{ 
              color: '#f8f8f8', 
              margin: '0', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              SONIC
            </p>
            <p style={{ 
              color: '#f8f8f8', 
              margin: '0', 
              fontSize: '14px' 
            }}>
              {data.sonicValue}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render no data overlay if needed
  const renderNoDataOverlay = () => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(45, 55, 72, 0.8)',
          padding: '8px 16px',
          borderRadius: '8px',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <p
          style={{
            color: '#f8f8f8',
            fontSize: '14px',
            margin: 0
          }}
        >
          No data available
        </p>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chakra-colors-blue-500, #3182CE)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--chakra-colors-blue-500, #3182CE)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chakra-colors-blue-500, #3182CE)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--chakra-colors-blue-500, #3182CE)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="noDataGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B0E17" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0B0E17" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="noDataGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B0E17" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0B0E17" stopOpacity={0.2} />
            </linearGradient>
            {chartData.map((entry: any, index: number) => {
              const percentageOfTotal = (Number(entry.sonicValue) / (Number(entry.sonicFullAmount) + Number(entry.sonicValue))) * 100;
              return (
                <linearGradient key={`percentageGradient-${index}`} id={`percentageGradient-${index}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="var(--chakra-colors-blue-500, #3182CE)" stopOpacity={0.8} />
                  <stop offset={`${percentageOfTotal}%`} stopColor="var(--chakra-colors-blue-500, #3182CE)" stopOpacity={0.8} />
                  <stop offset={`${percentageOfTotal}%`} stopColor="#0B0E17" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#0B0E17" stopOpacity={0.2} />
                </linearGradient>
              );
            })}
          </defs>
          
          {/* Transparent X and Y axes */}
          <XAxis dataKey="name" hide />
          <YAxis hide />
          
          {/* Custom tooltip */}
          <Tooltip 
            content={<CustomTooltip />}
            cursor={false}
            position={{ y: height / 2 }}
          />
          
          {/* Main bars */}
          <Bar
            dataKey="value"
            radius={[8, 8, 8, 8]}
            barSize={24}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
          >
            {chartData.map((entry: any, index: number) => {
              const hasActualData = !entry.noData && parseFloat(entry.tokenValue) > 0;
              let fillGradient, hoverGradient;
              if (!hasData) {
                fillGradient = "url(#noDataGradient)";
                hoverGradient = "url(#noDataGradientHover)";
              } else if (hasActualData) {
                fillGradient = `url(#percentageGradient-${index})`;
                hoverGradient = `url(#percentageGradient-${index})`;
              } else {
                fillGradient = "url(#noDataGradient)";
                hoverGradient = "url(#noDataGradientHover)";
              }
              
              return (
                <Cell
                  key={`value-cell-${index}`}
                  fill={index === activeIndex ? hoverGradient : fillGradient}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Show no data overlay if needed */}
      {!loading && !hasData && renderNoDataOverlay()}
    </div>
  );
};

export default BondingCurveChart;
