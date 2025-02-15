"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Twitter } from 'lucide-react';
import { Agent } from '@/types/agent';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface TwitterError {
    error: string;
    code?: string;
    details?: string;
}

interface Tweet {
    _id: string;
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

const TwitterView: React.FC<{ agentData: Agent }> = ({ agentData }) => {
    if(!agentData) return null;

    const { data: tweets, isLoading, error, refetch } = useQuery<Tweet[] | null, TwitterError>({
        queryKey: ['tweets', agentData._id],
        queryFn: () => fetchTweets(agentData._id.toString()),
        enabled: !!agentData._id,
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

    return (
        <Card className="h-[500px] p-6 border-2 border-[#8b7355] rounded-lg bg-transparent">
            <div className="flex items-center gap-3 mb-4 border-b-2 border-[#8b7355]/20 pb-2">
                <Twitter className="w-5 h-5 text-[#8b7355]" />
                <h2 className="text-xl font-bold text-[#8b7355] font-mono tracking-tight">Twitter Feed</h2>
            </div>
            <div className="h-[400px] overflow-y-auto">
                {isLoading && (
                    <p className="text-muted-foreground">Loading tweets...</p>
                )}
                {error && (
                    <div className="text-red-500">
                        <p>Error: {error.error}</p>
                        <button 
                            onClick={handleRetry} 
                            className="mt-2 px-4 py-2 bg-[#8b7355] text-white rounded-md hover:bg-[#8b7355]/80"
                        >
                            Retry
                        </button>
                    </div>
                )}
                {!isLoading && !error && (!tweets || tweets.length === 0) && (
                    <p className="text-muted-foreground">
                        No tweets found
                    </p>
                )}
                {!isLoading && !error && tweets && tweets.length > 0 && (
                    <div className="space-y-4">
                        {tweets.map((tweet) => (
                            <div key={tweet._id} className="p-4 border border-[#8b7355]/20 rounded-lg">
                                <p className="text-sm text-[#8b7355]">{tweet.text}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {new Date(tweet.tweetCreatedAt).toLocaleDateString()}
                                </div>
                                {tweet.metrics && (
                                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                        <span>{tweet.metrics.retweets} retweets</span>
                                        <span>{tweet.metrics.replies} replies</span>
                                        <span>{tweet.metrics.likes} likes</span>
                                        <span>{tweet.metrics.views} views</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TwitterView; 