"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// Demo agents data
const demoAgents = [
    {
        id: 'ai-writer',
        name: 'AI Writer',
        creator: 'OpenAI Team',
        description: 'Professional writing assistant that helps you create high-quality content, from blog posts to creative stories.',
        imageUrl: '/images/ai-writer.png',
        rating: 4.8,
        featured: true,
    },
    {
        id: 'code-companion',
        name: 'Code Companion',
        creator: 'Dev Tools Inc',
        description: 'Your personal programming assistant. Helps with code review, debugging, and learning new programming concepts.',
        imageUrl: '/images/code-assistant.png',
        rating: 4.9,
        featured: true,
    },
    {
        id: 'data-analyst',
        name: 'Data Analyst',
        creator: 'Data Science Pro',
        description: 'Analyze data, create visualizations, and generate insights from your datasets with natural language commands.',
        imageUrl: '/images/data-analyst.png',
        rating: 4.7,
    },
    {
        id: 'image-creator',
        name: 'Image Creator',
        creator: 'Creative AI Labs',
        description: 'Generate beautiful artwork and images from text descriptions. Perfect for designers and creative professionals.',
        imageUrl: '/images/image-creator.png',
        rating: 4.6,
    },
    {
        id: 'research-assistant',
        name: 'Research Assistant',
        creator: 'Academic AI',
        description: 'Your personal research companion. Helps with literature review, paper summaries, and citation management.',
        imageUrl: '/images/research.png',
        rating: 4.5,
    },
    {
        id: 'language-tutor',
        name: 'Language Tutor',
        creator: 'Language Learning AI',
        description: 'Interactive language learning assistant that helps you master new languages through conversation and exercises.',
        imageUrl: '/images/language-tutor.png',
        rating: 4.7,
    }
];

const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%236b7280"%3EAI Agent%3C/text%3E%3C/svg%3E';

const Agents = () => {
    const fetchAgents = async () => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return demo data
        return {
            data: demoAgents
        };
    }

    const { data: agents, isLoading } = useQuery({
        queryKey: ['agents'],
        queryFn: fetchAgents,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const agentsList = useMemo(() => {
        if (!agents?.data) return [];
        return agents.data;
    }, [agents]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E17] py-12 sm:py-12">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Your Agent</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
                        Discover and interact with powerful AI agents built by our community
                    </p>
                    <Link 
                        href="/agent/create"
                        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl rounded-lg sm:rounded-none"
                    >
                        <span className="mr-2">Create Agent</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </Link>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                    {agentsList.map((agent: any, index: number) => (
                        <div key={agent.id || index} 
                            className="flex flex-row bg-[#161B28] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="relative w-1/3 sm:w-full">
                                <Image 
                                    src={agent.imageUrl || DEFAULT_IMAGE}
                                    alt={`${agent.name} Preview`}
                                    className="w-full h-full sm:h-48 object-cover"
                                    width={150}
                                    height={200}
                                    priority={index < 6}
                                />
                            </div>
                            
                            <div className="w-2/3 sm:w-full p-4 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg text-gray-900">{agent.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500">{agent.creator}</p>
                                        </div>
                                        <div className="flex items-center sm:hidden">
                                            <span className="text-yellow-400 mr-1">★</span>
                                            <span className="text-xs text-gray-600">{agent.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 sm:mb-6">
                                        {agent.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Link 
                                        href={`/agent/${agent.id}`}
                                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 ml-auto"
                                    >
                                        Join Now
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {agentsList.length === 0 && (
                    <div className="text-center text-gray-500 mt-12">
                        No agents found. Be the first to create one!
                    </div>
                )}
            </div>
        </div>
    )
}

export default Agents;