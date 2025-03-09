import { createFileRoute } from "@tanstack/react-router";
import Hero from "../components/custom/Hero";
import TrendingTokens from "../components/custom/TrendingTokens";
import TransactionList from "../components/custom/TransactionList";
import TokenMarket from "../components/custom/TokenMarket";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen mx-auto flex flex-col bg-[#0B0E17]">   
      <div className="w-full">
        <Hero />
        <div className="container mx-auto space-y-8 pb-10">
          <TokenMarket />
          <div className="border-b border-[#1F2937]"/>
          <TrendingTokens />
          <div className="border-b border-[#1F2937]"/>
          <TransactionList />
        </div>
      </div>
    </main>
  );
}

export default Index;