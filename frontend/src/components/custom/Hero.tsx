import { Card, CardContent } from "../ui/card";
import { useTokensData } from '../../hooks/useWebSocketData';
import TrendingCards from './TrendingCards';
import { formatNumber } from '../../utils/utils';
import { Loader2 } from "lucide-react";
import { useMemo } from 'react';
import { useNavigate } from "@tanstack/react-router";

const Hero: React.FC = () => {
  const { tokens, loading: tokensLoading } = useTokensData();
  const navigate = useNavigate();


  const sortedTokens = useMemo(() => {
    if (!tokens) return [];
    return [...tokens].sort((a, b) => {
      // Sort by creation date in descending order (most recent first)
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [tokens]);

  return (
    <div className="w-full bg-[#0B0E17] border-y border-[#1F2937]">
      <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Featured Agent Card */}
          <Card className="bg-[#161B28] border border-[#1F2937] rounded-lg h-auto min-h-[200px] w-full lg:w-[440px]">
            <CardContent className="p-4">
              <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                Recent Tokens
              </h2>
              {tokensLoading ? (
                <div className="text-white text-left flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTokens.slice(0, 5).map((token, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between cursor-pointer group" 
                      onClick={() => navigate({to: `/token/${token.address}`})}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">{index+1}</span>
                        <img src={token.imageUrl} alt={token.name} className="w-8 h-8 rounded-full" />
                        <div className="flex flex-col">
                          <span className="text-white group-hover:underline transition-colors">{token.name}</span>
                          <span className="text-gray-400 text-sm group-hover:underline transition-colors">{token.ticker}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-white">{formatNumber(Number(token.totalSupply)/10**18)} {token.ticker}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add TrendingCards component */}
          <div className="flex-1">
            <TrendingCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 