"use client"

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Token } from '@/models';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TwitterError {
    error: string;
    code?: string;
    details?: string;
}

interface Tweet {
    tweet_id: string;
    text: string;
    user_name: string;
    user_screen_name: string;
    created_at: string;
    retweet_count: number;
    favorite_count: number;
}

interface TwitterResponse {
    total_results: number;
    tweets: Tweet[];
}

const TwitterView: React.FC<{ tokenData: Token }> = ({ tokenData }) => {
    // Ensure we have a ticker, default to "DOR" if not available
    const ticker = tokenData?.ticker || "SLOTH";

    // console.log(ticker);

    const requestData = {
        query: [
            {
                category: "Latest",
                query: `#SlothAgent #${ticker}`,
            }
        ]
    };
    
    const {data, isLoading, error, refetch} = useQuery<{ data: TwitterResponse }>({
        queryKey: ['twitter-tweets', ticker], // Include ticker in the queryKey
        queryFn: () => axios.post(`${process.env.NEXT_PUBLIC_API_TWITTER}/search`, requestData),
        enabled: !!ticker, // Only run the query if ticker is available
    });

    // Manually trigger refetch when tokenData.ticker changes
    useEffect(() => {
        if (ticker) {
            refetch();
        }
    }, [ticker, refetch]);

    // Format date to display like "Mar 4, 2025, 03:04 AM"
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        return `${date.toLocaleDateString('en-US', options)}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
    };

    return (
        <Card className="w-full border border-[#1F2937] rounded-lg overflow-hidden bg-[#0F1724] text-white">
            <div className="flex items-center gap-3 p-4 border-b border-[#1F2937]">
                <img src="/assets/icon/x-light.svg" alt="twitter" className='w-5 h-5' />
                <h2 className="text-xl font-bold text-white">Tweets {ticker && `#${ticker}`}</h2>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex p-4 space-x-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full h-[200px]">
                            <p>Loading tweets...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center w-full h-[200px]">
                            <p>Error loading tweets</p>
                        </div>
                    ) : data?.data?.tweets && data.data.tweets.length > 0 ? (
                        data.data.tweets.map((tweet) => (
                            <div key={tweet.tweet_id} className="min-w-[350px] max-w-[400px] border border-[#1F2937] rounded-lg bg-[#0F1724] p-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-white">
                                            {tweet.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center">
                                                <p className="font-bold text-white">{tweet.user_name}</p>
                                                {tweet.user_name.includes("Ghost") && (
                                                    <span className="ml-1">👻</span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm">@{tweet.user_screen_name}</p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-white whitespace-pre-wrap">{tweet.text}</p>
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        {formatDate(tweet.created_at)}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[#1F2937]"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center w-full h-[200px]">
                            <p>No tweets found</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default TwitterView; 