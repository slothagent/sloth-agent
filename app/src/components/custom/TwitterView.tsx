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
    id: string;
    text: string;
    created_at: string;
}

const fetchTweets = async (accessToken: string | undefined): Promise<Tweet[] | null> => {
    if (!accessToken) return null;
    
    const response = await fetch('/api/twitter/tweets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
    });

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
};

const TwitterView: React.FC<{ agentData: Agent }> = ({ agentData }) => {
    if(!agentData) return null;

    const { data: tweets, isLoading, error, refetch } = useQuery<Tweet[] | null, TwitterError>({
        queryKey: ['tweets', agentData.twitterAuth?.accessToken],
        queryFn: () => fetchTweets(agentData.twitterAuth?.accessToken),
        enabled: !!agentData.twitterAuth?.accessToken,
        retry: (failureCount, error) => {
            // Don't retry for auth errors
            if (error.code === 'TWITTER_AUTH_FAILED') {
                toast.error('Twitter authentication failed. Please reconnect your account.', {
                    duration: 5000,
                });
                return false;
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    });

    const handleRetry = async () => {
        if (error?.code === 'TWITTER_AUTH_FAILED') {
            try {
                // Check if we have a refresh token
                if (agentData.twitterAuth?.refreshToken) {
                    const response = await fetch('/api/twitter/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            refreshToken: agentData.twitterAuth.refreshToken
                        }),
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        // Update the agent's Twitter auth data in the database
                        await fetch('/api/agent/twitter/update', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                agentId: agentData.id,
                                twitterAuth: data.data
                            }),
                        });

                        // Refetch tweets with new token
                        refetch();
                        toast.success('Successfully refreshed Twitter connection');
                    } else {
                        // If refresh failed, we need to reconnect
                        toast.error('Please reconnect your Twitter account');
                    }
                } else {
                    // No refresh token, need to reconnect
                    toast.error('Please reconnect your Twitter account');
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                toast.error('Failed to refresh Twitter connection');
            }
        } else {
            refetch();
        }
    };

    return (
        <Card className="h-full p-6 border-2 border-[#8b7355] rounded-lg bg-transparent">
            <div className="flex items-center gap-3 mb-4 border-b-2 border-[#8b7355]/20 pb-2">
                <Twitter className="w-5 h-5 text-[#8b7355]" />
                <h2 className="text-xl font-bold text-[#8b7355] font-mono tracking-tight">Twitter Feed</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
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
                            {error.code === 'TWITTER_AUTH_FAILED' 
                                ? 'Reconnect Twitter' 
                                : 'Retry'}
                        </button>
                    </div>
                )}
                {!isLoading && !error && (!tweets || tweets.length === 0) && (
                    <p className="text-muted-foreground">
                        {agentData.twitterAuth?.accessToken 
                            ? 'No tweets found' 
                            : 'Connect your Twitter account to view your feed'}
                    </p>
                )}
                {!isLoading && !error && tweets && tweets.length > 0 && (
                    <div className="space-y-4">
                        {tweets.map((tweet) => (
                            <div key={tweet.id} className="p-4 border border-[#8b7355]/20 rounded-lg">
                                <p className="text-sm text-[#8b7355]">{tweet.text}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {new Date(tweet.created_at).toLocaleDateString()}
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