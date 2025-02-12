"use client";
import React from 'react';
import { NextPage } from "next";
import Sidebar from "@/components/custom/Sidebar";
import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TypewriterEffect from "@/components/custom/TypewriterEffect";
import Link from "next/link";
import { 
    Target, 
    RefreshCw, 
    Cat,
    Search,
    Paintbrush,
    Zap,
    Flame,
    Gift,
    Code,
    Box,
    Users,
    Gamepad2,
    Crown,
    MessageSquare,
    Rocket,
    Send,
    Wallet,
    CircleDollarSign,
    BookOpen,
    Cat as CatIcon,
    BarChart,
    Menu,
    X,
} from "lucide-react";
import ListToken from "@/components/custom/ListToken";
interface Message {
    type: 'user' | 'bot';
    content: string;
}

interface ChatHistory {
    id: string;
    title: string;
    messages: Message[];
}

interface SummarizeSuggestion {
    type: string;
    text: string;
}

interface BotResponse {
    trigger: string[];
    response: string;
}

interface Token {
    name: string;
    symbol: string;
    balance: string;
    value: string;
    price: string;
    icon: React.ReactNode;
}

const agents = [
    {
        name: 'Warhol',
        icon: <Paintbrush className="w-5 h-5" />,
        description: 'Warhol is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Blink',
        icon: <Zap className="w-5 h-5" />,
        description: 'Blink is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Incinerator',
        icon: <Flame className="w-5 h-5" />,
        description: 'Incinerator is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Airdrop',
        icon: <Gift className="w-5 h-5" />,
        description: 'Airdrop is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Dev',
        icon: <Code className="w-5 h-5" />,
        description: 'Dev is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Baxus',
        icon: <Box className="w-5 h-5" />,
        description: 'Baxus is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Twoface',
        icon: <Users className="w-5 h-5" />,
        description: 'Twoface is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Wairdle',
        icon: <Gamepad2 className="w-5 h-5" />,
        description: 'Wairdle is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Sensei',
        icon: <Crown className="w-5 h-5" />,
        description: 'Sensei is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Lulo',
        icon: <MessageSquare className="w-5 h-5" />,
        description: 'Lulo is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Stake',
        icon: <Rocket className="w-5 h-5" />,
        description: 'Stake is a memecoin agent that can help you create memes and trade them on pump.fun'
    },
    {
        name: 'Dora',
        icon: <Search className="w-5 h-5" />,
        description: 'Dora is a memecoin agent that can help you create memes and trade them on pump.fun'
    }
];

const mainAgents = [
    {
        name: 'Agent Sniper',
        description: 'Snipe new tokens on pump.fun',
        icon: <Target className="w-6 h-6" />
    },
    {
        name: 'Agent Flipper',
        description: 'Snipe and auto-sell new tokens on pump.fun',
        icon: <RefreshCw className="w-6 h-6" />
    },
    {
        name: 'Agent Copycat',
        description: 'Copycat trades on pump.fun',
        icon: <Cat className="w-6 h-6" />
    }
];

const getBotResponses = (agentName: string): BotResponse[] => {
    const commonResponses = [
        {
            trigger: ['hello', 'hi', 'hey'],
            response: `Hi! I'm ${agentName}. How can I help you today?`
        },
        {
            trigger: ['how are you'],
            response: "I'm doing great! Ready to help you with trading."
        }
    ];

    const agentSpecificResponses: Record<string, BotResponse[]> = {
        'sniper': [
            {
                trigger: ['how to snipe', 'snipe token', 'token snipe'],
                response: "To snipe tokens, I'll monitor new listings and execute trades immediately when they appear. Would you like me to start monitoring?"
            }
        ],
        'copycat': [
            {
                trigger: ['copy trade', 'how to copy', 'copy trading'],
                response: "I can help you copy successful traders. Just provide the wallet address you want to track, and I'll mirror their trades."
            }
        ]
    };

    return [...commonResponses, ...(agentSpecificResponses[agentName.toLowerCase()] || [])];
};

const walletTokens: Token[] = [
    {
        name: "USD Coin",
        symbol: "USDC",
        balance: "0.006032",
        value: "$0.01",
        price: "$1.00",
        icon: <CircleDollarSign className="w-6 h-6 text-blue-500" />
    },
    {
        name: "Book of Harry Potter",
        symbol: "BOHP",
        balance: "300000",
        value: "$4.84",
        price: "$0.00",
        icon: <BookOpen className="w-6 h-6 text-purple-500" />
    },
    {
        name: "Shark Cat",
        symbol: "SC",
        balance: "0.186761",
        value: "$0.00",
        price: "$0.01",
        icon: <CatIcon className="w-6 h-6 text-orange-500" />
    },
    {
        name: "Pudgy Penguins",
        symbol: "PENGU",
        balance: "496.460981",
        value: "$17.04",
        price: "$0.03",
        icon: <Cat className="w-6 h-6 text-cyan-500" />
    },
    {
        name: "test griffain.com",
        symbol: "GRIFFAIN",
        balance: "1086.198467",
        value: "$410.79",
        price: "$0.38",
        icon: <BarChart className="w-6 h-6 text-green-500" />
    }
];

const Playground: NextPage = () => {
    const params = useParams();
    const agentIdFromPath = params.agentId as string;
    const [currentAgentId, setCurrentAgentId] = useState(agentIdFromPath || '');
    const [isChatting, setIsChatting] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const router = useRouter();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
    const [isMobileWalletOpen, setIsMobileWalletOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        // Update currentAgentId when URL parameters change
        setCurrentAgentId(agentIdFromPath || '');
    }, [agentIdFromPath]);

    const handleSendMessage = async (message: string) => {
        if (!message || !message.trim()) {
            return;
        }
    
        setIsChatting(true);
        const newUserMessage: Message = { type: 'user', content: message };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        const currentAgent = [...agents, ...mainAgents].find(agent => 
            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
        );

        setTimeout(() => {
            const botResponses = getBotResponses(currentAgent?.name || '');
            let botReply = "I'm not sure how to help with that. Could you try asking something else?";

            for (const resp of botResponses) {
                if (resp.trigger.some(t => message.toLowerCase().includes(t))) {
                    botReply = resp.response;
                    break;
                }
            }

            const botMessage: Message = { type: 'bot', content: botReply };
            setMessages(prev => [...prev, botMessage]);
            setIsLoading(false);
        }, 1000);
    };
    
    return (
        <div className="min-h-screen bg-white text-gray-800">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
                <button 
                    className="p-2"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">Agent</h1>
                <button 
                    className="p-2"
                    onClick={() => setIsMobileWalletOpen(true)}
                >
                    <Wallet className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Menu</h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="h-[calc(100vh-73px)] overflow-y-auto">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Wallet Overlay */}
            {isMobileWalletOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Wallet</h2>
                            <button 
                                onClick={() => setIsMobileWalletOpen(false)}
                                className="p-2"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <h3 className="text-gray-800 font-medium">Wallet</h3>
                                        <p className="text-gray-500 text-sm">DbK4bg</p>
                                    </div>
                                </div>
                                <span className="text-gray-800 font-medium">21.62 <span className="text-gray-500">≈</span></span>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
                                {walletTokens.map((token) => (
                                    <div key={token.symbol} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                {token.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-gray-800 font-medium">{token.name}</h4>
                                                <p className="text-gray-500 text-sm">{token.balance} {token.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-800">{token.value}</p>
                                            <p className="text-gray-500 text-sm">{token.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] lg:h-screen">
                {/* Sidebar - Hidden on mobile */}
                <div className="hidden lg:block lg:w-[240px] flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {!isChatting ? (
                        <div className="max-w-4xl mx-auto">
                            {/* Agent Header */}
                            <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg">
                                    {[...agents, ...mainAgents].find(agent => 
                                        agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                    )?.icon}
                                </div>
                                <div>
                                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">
                                        {[...agents, ...mainAgents].find(agent => 
                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                        )?.name}
                                    </h1>
                                    <p className="text-sm lg:text-base text-gray-500">
                                        {[...agents, ...mainAgents].find(agent => 
                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                        )?.description}
                                    </p>
                                </div>
                            </div>

                            {/* Input Section */}
                            <div className="flex items-center mb-6 lg:mb-8 gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Tell me what to do..." 
                                        className="w-full bg-white border-2 border-neutral-700 text-gray-700 px-3 lg:px-4 py-2 lg:py-3 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-base lg:text-lg"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && inputValue.trim()) {
                                                handleSendMessage(inputValue);
                                            }
                                        }}
                                    />
                                </div>
                                <button 
                                    className="p-2 lg:p-3 rounded-lg bg-[#93E905] border-2 border-neutral-700"
                                    onClick={() => handleSendMessage(inputValue)}
                                >
                                    <Send className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </button>       
                            </div>

                            {/* Agents Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                                {agents.map((agent) => (
                                    <Link
                                        key={agent.name}
                                        href={`/playground/agents/${agent.name.toLowerCase()}`}
                                        className="px-3 lg:px-4 py-2 lg:py-3 bg-white border-2 border-neutral-700 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        {agent.icon}
                                        <span className="text-sm lg:text-base">{agent.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Main Agents Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mainAgents.map((agent) => (
                                    <Link
                                        key={agent.name}
                                        href={`/agents/${agent.name.toLowerCase().replace('agent ', '')}`}
                                        className="bg-white border-2 border-neutral-700 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            {agent.icon}
                                            <h3 className="text-base lg:text-lg text-gray-700">{agent.name}</h3>
                                        </div>
                                        <p className="text-sm lg:text-base text-gray-500">{agent.description}</p>
                                    </Link>
                                ))}
                            </div>   
                        </div>
                    ) : (
                        // Chat Interface
                        <div className="max-w-[1200px] h-full w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-4">
                            {/* Chat Section */}
                            <div className="w-full lg:w-[calc(100%-320px)] flex flex-col h-full">
                                {/* Chat Header */}
                                <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6 border-b border-gray-200 pb-4">
                                    <div className="p-2 bg-white border border-gray-200 rounded-lg">
                                        {[...agents, ...mainAgents].find(agent => 
                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                        )?.icon}
                                    </div>
                                    <div>
                                        <h1 className="text-lg lg:text-2xl font-semibold text-gray-800">
                                            {[...agents, ...mainAgents].find(agent => 
                                                agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                            )?.name}
                                        </h1>
                                        <p className="text-sm lg:text-base text-gray-500">
                                            {[...agents, ...mainAgents].find(agent => 
                                                agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                            )?.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages Section */}
                                <div className="flex-1 overflow-y-auto min-h-0 px-2 lg:px-4">
                                    {messages.map((msg, index) => (
                                      <div
                                        key={index} 
                                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}
                                      >
                                        <div 
                                          className={`rounded-lg p-3 max-w-md ${
                                            msg.type === 'user' ? 'bg-[#93E905] text-white' : 'bg-gray-100'
                                          }`}
                                        >
                                          {msg.type === 'user' ? msg.content : <TypewriterEffect content={msg.content} />}
                                        </div>
                                      </div>
                                    ))}
                                    {isLoading && (
                                      <div className="flex justify-start mb-4 animate-slide-up">
                                        <div className="bg-gray-100 rounded-lg p-3">
                                          <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div ref={messagesEndRef}/>
                                </div>

                                {/* Input Section */}
                                <div className="mt-4 border-t bg-white p-3 lg:p-4">
                                    <div className="relative w-full rounded-lg border border-gray-300 gap-2">
                                        <div 
                                            onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                                            className="border border-gray-200 rounded-lg p-2 m-1 inline-block cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-1">
                                                <div className="p-0.5 bg-white border border-gray-200 rounded-lg">
                                                    {[...agents, ...mainAgents].find(agent => 
                                                        agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                                    )?.icon}
                                                </div>
                                                <div>
                                                    <h1 className="text-base font-medium text-gray-800">
                                                        {[...agents, ...mainAgents].find(agent => 
                                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                                        )?.name}
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Agent Menu Dropdown */}
                                        {isAgentMenuOpen && (
                                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                <div className="p-2 max-h-80 overflow-y-auto">
                                                    {agents.map((agent) => (
                                                        <div
                                                            key={agent.name}
                                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                            onClick={() => {
                                                                setCurrentAgentId(agent.name.toLowerCase());
                                                                setIsAgentMenuOpen(false);
                                                            }}
                                                        >
                                                            <div className="p-1 bg-white border border-gray-200 rounded-lg">
                                                                {agent.icon}
                                                            </div>
                                                            <span className="text-gray-700">{agent.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <input 
                                          type="text" 
                                          value={inputValue}
                                          onChange={(e) => setInputValue(e.target.value)}
                                          placeholder="Tin nhắn ChatGPT" 
                                          className="w-full p-4 pr-12 rounded-full outline-none mb-2"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && inputValue.trim()) {
                                              handleSendMessage(inputValue);
                                            }
                                          }}
                                        />
                                        <button 
                                          onClick={() => handleSendMessage(inputValue)}
                                          className="absolute right-4 bottom-1 border border-gray-200 rounded-lg p-2 bg-[#93E905] -translate-y-1/2 overflow-hidden cursor-pointer"
                                        >
                                          <Send className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                    <div className="w-full flex gap-2 overflow-x-auto pb-4 mt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                         <ListToken />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                 {/* Wallet Section - Hidden on mobile */}
                <div className="hidden lg:block w-[320px] sticky top-4 border-l border-gray-200">
                    <div className="bg-white p-6">
                        {/* Wallet Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                    <Wallet className="w-5 h-5 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-semibold">My Wallet</h3>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-gray-500 text-sm font-medium">DbK4bg</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-900 font-semibold">$21.62</p>
                                <p className="text-gray-500 text-sm">Total Balance</p>
                            </div>
                        </div>

                        {/* Token List */}
                        <div className="space-y-4">
                            {walletTokens.map((token) => (
                                <div 
                                    key={token.symbol} 
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 hover:border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gray-50 rounded-xl">
                                            {token.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 font-medium mb-0.5">{token.name}</h4>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-500 text-sm">{token.balance}</span>
                                                <span className="text-gray-400 text-sm font-medium">{token.symbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 font-medium mb-0.5">{token.value}</p>
                                        <p className="text-gray-500 text-sm">{token.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile overlays */}
            {(isMobileMenuOpen || isMobileWalletOpen) && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileWalletOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Playground;
