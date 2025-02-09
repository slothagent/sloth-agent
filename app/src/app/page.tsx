'use client'
import Header from '@/components/Header';
import TokenCard from '@/components/TokenCard';
import Link from "next/link";
import { PlusIcon } from '@heroicons/react/24/outline';
import { useState,useEffect, useCallback } from 'react';
import axios from 'axios';
import PredictionBar from '@/components/PredictionBar';

export default function Home() {
  const [width, setWidth] = useState<number>(0);
  const [dataTokens, setDataTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setWidth(window.innerWidth);
    
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await fetch('/api/tokens');
      const data = await response.json();
      console.log(data);
      setDataTokens(data || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setDataTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const fetchTokenByName = useCallback(async () => {
    const response = await fetch(`/api/tokens/searchByName`, {
      method: 'POST',
      body: JSON.stringify({ name: search })
    });
    const data = await response.json();
    setDataTokens(data.data);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(search.length > 1){
      fetchTokenByName();
    }else{
      fetchTokens();
    }
  };

  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const [activeTab, setActiveTab] = useState<'all' | 'contribution' | 'advanced'>('all');

  const [predictions, setPredictions] = useState<any[]>([]);
  const [isPredictionLoading, setIsPredictionLoading] = useState(true);

  const fetchTokensPrediction = useCallback(async () => {
    try {
      const response = await axios.get('/api/prediction');
      // console.log(response.data);
      setPredictions(response.data.files_data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      // setPredictions([]);
      // Optionally show user-friendly error message
      // You could add a state for error messages if needed
    } finally {
      setIsPredictionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokensPrediction(); // Initial fetch
    
    // Set up interval to fetch every minute
    const interval = setInterval(() => {
      fetchTokensPrediction();
    }, 60000); // 60000ms = 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchTokensPrediction]);

  // console.log(predictions);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search */}
      <Header handleSearch={handleSearch} search={search} setSearch={setSearch} />
      {!isPredictionLoading && predictions && (
        <PredictionBar predictions={predictions as any} />
      )}

      {/* Main Content */}
      <main className="p-2 sm:p-3 md:p-4">
        <div className="md:max-w-7xl md:mx-auto w-full max-w-[480px]                                                          ">
          {/* Filter Controls */}
          <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 w-full">
            {/* Filter Buttons */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide relative w-full">
              <button 
                onClick={() => setActiveTab('all')}
                className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-sm rounded-lg ${
                  activeTab === 'all' 
                    ? 'bg-neon-pink text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveTab('contribution')}
                className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-sm rounded-lg whitespace-nowrap ${
                  activeTab === 'contribution' 
                    ? 'bg-neon-pink text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Your Contribution
              </button>
              <button 
                onClick={() => setActiveTab('advanced')}
                className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-sm rounded-lg whitespace-nowrap ${
                  activeTab === 'advanced' 
                    ? 'bg-neon-pink text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Advanced Mode
              </button>
              {isDesktop && (
                <Link 
                  href="/token/create" 
                  className="shrink-0 w-[140px] sm:w-[160px] px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-sm bg-neon-pink text-white rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90"
                >
                  <PlusIcon className="w-4 h-4" /> New Token
                </Link>
              )}
            </div>
              {isMobile && (
                <Link 
                  href="/token/create" 
                  className="w-full px-2.5 py-1.5 sm:py-2.5 text-sm bg-neon-pink text-white rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90"
                >
                  <PlusIcon className="w-4 h-4" /> New Token
                </Link>
              )}
          </div>

          {/* Token Grid */}
          <div className="grid md:grid-cols-3 grid-cols-[repeat(auto-fill)] gap-2 sm:gap-3 md:gap-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              dataTokens.length > 0 ? dataTokens.map((token: any) => (
                <TokenCard key={token._id} token={token} />
              )) : <div>No tokens found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
