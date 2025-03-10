"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAgents, useDeleteAgent, AgentResponse } from '@/hooks/useAgents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Edit2, Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Agent } from '@/models/agent';
import { useAccount } from 'wagmi';

const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%236b7280"%3EAI Agent%3C/text%3E%3C/svg%3E';

const Agents: React.FC = () => {
    const { address, isConnected } = useAccount();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string>('');
    const pageSize = 10;
    
    // Only fetch agents if the user is connected
    const { data: agentsData, isLoading } = useAgents(
        address && isConnected ? {
            page,
            pageSize,
            search,
            owner: address,
        } : {
            // Dummy values that won't return any results when not connected
            page: 0,
            pageSize: 0,
            owner: 'not-connected'
        }
    );

    const deleteAgent = useDeleteAgent();

    const handleDelete = async (id: string) => {
        try {
            await deleteAgent.mutateAsync(id);
            toast.success('Agent deleted successfully');
        } catch (error) {
            toast.error('Failed to delete agent');
        }
    };

    // Show login message if not connected
    if (!address || !isConnected) {
        return (
            <div className="min-h-screen bg-[#0B0E17] py-12 sm:py-12">
                <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="text-3xl font-bold text-white mb-4 text-center">Connect Your Wallet</h1>
                    <p className="text-gray-400 text-center mb-8">Please connect your wallet to view and manage your agents.</p>
                    <div className="w-full max-w-md">
                        {/* You can add a connect wallet button here if needed */}
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const agents = agentsData?.data || [];
    const { currentPage, totalPages } = agentsData?.metadata || { currentPage: 1, totalPages: 1 };

    return (
        <div className="min-h-screen bg-[#0B0E17] py-12 sm:py-12">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            My Agents
                        </h1>
                        <p className="text-gray-400">Manage and monitor your AI agents for blockchain technology.</p>
                    </div>
                    <Link 
                        href="/agent/create"
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Agent
                    </Link>
                </div>

                {/* Filters Section */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search your agents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-[#161B28] border-[#1F2937] text-white w-full h-11"
                        />
                    </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent: Agent) => (
                        <div key={agent._id?.toString() || ''} 
                            className="bg-[#161B28] border border-[#1F2937] overflow-hidden hover:border-blue-600 transition-all duration-300"
                        >
                            <div className="flex p-4 space-x-4 h-full">
                                {/* Left - Image */}
                                <img 
                                    src={agent.imageUrl || DEFAULT_IMAGE}
                                    alt={agent.name}
                                    width={80}
                                    height={80}
                                    className="object-contain w-28 h-28"
                                />
                                
                                {/* Right - Content */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-1 truncate">{agent.name}</h3>
                                            <p className="text-gray-400 text-sm truncate">{agent.ticker}</p>
                                        </div>
                                        <div className="flex space-x-1 ml-2 shrink-0">
                                            <Link href={`/agent/${agent._id?.toString() || ''}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#1F2937]">
                                                    <Edit2 className="w-4 h-4 text-gray-400 hover:text-white" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => handleDelete(agent._id?.toString() || '')}
                                                disabled={deleteAgent.isPending}
                                                className="h-8 w-8 hover:bg-[#1F2937]"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                                        {agent.description}
                                    </p>

                                    <Link 
                                        href={`/agent/${agent._id?.toString() || '' }`}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-medium justify-center"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination with smaller buttons */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 space-x-1.5">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-[#1F2937] text-gray-400 hover:text-white hover:border-blue-600 h-8 px-3 text-sm"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={p === page ? "default" : "outline"}
                                    onClick={() => setPage(p)}
                                    className={`h-8 w-8 text-sm ${p === page 
                                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                                        : "border-[#1F2937] text-gray-400 hover:text-white hover:border-blue-600"
                                    }`}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="border-[#1F2937] text-gray-400 hover:text-white hover:border-blue-600 h-8 px-3 text-sm"
                        >
                            Next
                        </Button>
                    </div>
                )}

                {agents.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">
                        You haven't created any agents yet. Create your first agent!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agents;