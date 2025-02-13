"use client";

import Hero from "@/components/custom/Hero";
import TrendingTokens from "@/components/custom/TrendingTokens";
import TrendingAgents from "@/components/custom/TrendingAgents";

const Home: React.FC = () => {
  return (
    <main className="min-h-screen mx-auto flex flex-col bg-white pb-10">   
      <div className="w-full">
        <Hero />
        <div className="container mx-auto pt-10">
          <TrendingTokens />
          <TrendingAgents />
        </div>
      </div>
    </main>
  );
}

export default Home;