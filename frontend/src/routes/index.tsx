import { createFileRoute } from "@tanstack/react-router";
import Hero from "../components/custom/Hero";
import TransactionList from "../components/custom/TransactionList";
import TokenMarket from "../components/custom/TokenMarket";
import { useSolanaTokens } from "../hooks/useWebSocketData";
import { Loader2, Copy } from "lucide-react";
import { copyToClipboard } from "../utils/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { tokens, loading } = useSolanaTokens();
  // console.log(tokens[0],loading);
  return (
    <main className="min-h-screen mx-auto flex flex-col bg-[#0B0E17]">   
      <div className="w-full">
        <Hero />
        <div className="container mx-auto space-y-8 pb-10">
          <div className="space-y-2">
            <h1 className="text-white text-2xl font-bold mt-5">Solana Tokens</h1>
            <span className="text-gray-400 text-sm">🌱 New Creations</span>
            <div className="flex flex-row gap-4 overflow-x-auto py-2">
              {
                tokens.length == 0 && loading && (
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-sm flex flex-row items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                  </div>
                )
              } 
              {tokens.map((token,index) => (
                <div 
                  key={index} 
                  className="min-w-[350px] bg-[#1F2937] rounded-lg p-4 hover:bg-[#2D3748] transition-all cursor-pointer"
                  onClick={()=> window.open(`https://gmgn.ai/sol/token/${token?.mint}`, '_blank')}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-row items-start gap-2">
                        {token.metadata?.image && (
                          <img 
                            src={token.metadata.image} 
                            alt={token.metadata.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-white font-bold text-sm">{token.metadata?.name}</h3>
                          <p className="text-gray-400">{token.metadata?.symbol}</p>
                        </div>
                      </div>
                      <img src="/assets/icon/pump.png" alt="pump" className="w-6 h-6" />
                    </div>
                    <div className="flex flex-row gap-2">
                      <a 
                        href={`https://pump.fun/coin/${token?.mint}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 text-sm flex flex-row items-center gap-2 hover:underline"
                      >
                        {token?.mint?.slice(0,4)}...{token?.mint?.slice(-4)}
                      </a>
                      <Copy 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(token?.mint || '');
                        }} 
                        className="w-4 h-4 text-gray-400 cursor-pointer" 
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      {token.metadata?.twitter && (
                        <a 
                          href={token.metadata.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      
                      {token.metadata?.website && (
                        <a 
                          href={token.metadata.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TokenMarket />
          {/* <div className="border-b border-[#1F2937]"/> */}
          {/* <TrendingTokens /> */}
          <div className="border-b border-[#1F2937]"/>
          <TransactionList />
        </div>
      </div>
    </main>
  );
}

export default Index;