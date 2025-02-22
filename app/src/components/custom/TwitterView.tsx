"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Twitter } from 'lucide-react';
import { Agent } from '@/types/agent';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ObjectId } from 'mongodb';

interface TwitterError {
    error: string;
    code?: string;
    details?: string;
}

interface Tweet {
    _id: ObjectId;
    tweetId: string;
    text: string;
    tweetCreatedAt: string;
    metrics?: {
        retweets: number;
        replies: number;
        likes: number;
        views: number;
    };
}

const fetchTweets = async (agentId: string): Promise<Tweet[] | null> => {
    try {
        const response = await fetch(`/api/twitter/tweets?agentId=${agentId}`);
        const data = await response.json();
        
        if (!response.ok) {
            const error: TwitterError = {
                error: data.error,
                code: data.code,
                details: data.details,
            };
            throw error;
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching tweets:', error);
        throw error;
    }
};

const TwitterView: React.FC<{ tokenData: Agent }> = ({ tokenData }) => {
    if(!tokenData) return null;

    const { data: tweets, isLoading, error, refetch } = useQuery<Tweet[] | null, TwitterError>({
        queryKey: ['tweets', tokenData._id],
        queryFn: () => fetchTweets(tokenData._id.toString()),
        enabled: !!tokenData._id,
        staleTime: 30 * 1000, // Refetch after 30 seconds
        retry: (failureCount, error) => {
            if (error.code === 'TWITTER_AUTH_FAILED') {
                toast.error('Twitter authentication failed. Please reconnect your account.', {
                    duration: 5000,
                });
                return false;
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    });

    const handleRetry = () => {
        refetch();
    };

    console.log(tweets);

    return (
        <Card className="h-[500px] p-4 border border-[#1F2937] rounded-none text-white">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-800">
                <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                <h2 className="text-xl font-bold text-white">Tweets</h2>
            </div>
            <div className="h-[420px] overflow-y-auto scrollbar-hide">
                {isLoading && (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DA1F2]"></div>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                        <p className="text-red-500 mb-3">{error.error}</p>
                        <button 
                            onClick={handleRetry} 
                            className="px-4 py-2 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1A91DA] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                {!isLoading && !error && (!tweets || tweets.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <Twitter className="w-8 h-8 mb-2 opacity-50" />
                        <p>No tweets to display</p>
                    </div>
                )}
                {!isLoading && !error && tweets && tweets.length > 0 && (
                    <div className="space-y-1">
                        {tweets.map((tweet) => (
                            <div 
                                key={tweet._id.toString()} 
                                className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold hover:underline">@{tokenData.name}</span>
                                            <span className="text-gray-500 text-sm">·</span>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(tweet.tweetCreatedAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-[15px] mt-1 break-words">{tweet.text}</p>
                                        {tweet.metrics && (
                                            <div className="flex items-center gap-6 mt-3 text-gray-500 text-sm">
                                                <div className="flex items-center gap-2 hover:text-[#1DA1F2] transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>{tweet.metrics.replies}</span>
                                                </div>
                                                <div className="flex items-center gap-2 hover:text-green-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span>{tweet.metrics.retweets}</span>
                                                </div>
                                                <div className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    <span>{tweet.metrics.likes}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>{tweet.metrics.views}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TwitterView; 