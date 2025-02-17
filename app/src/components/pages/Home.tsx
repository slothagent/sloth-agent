"use client";

import Hero from "@/components/custom/Hero";
import TrendingTokens from "@/components/custom/TrendingTokens";

const Home: React.FC = () => {
  return (
    <main className="min-h-screen mx-auto flex flex-col bg-[#0a0d16] pb-10">   
      <div className="w-full">
        <Hero />
        <div className="container mx-auto pt-10">
          <TrendingTokens />
        </div>
      </div>
    </main>
  );
}

export default Home;