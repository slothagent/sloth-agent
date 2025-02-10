"use client";
import React from 'react';
import { NextPage } from "next";
import Sidebar from "@/components/custom/Sidebar";
import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    DollarSign,
    CircleDollarSign,
    BookOpen,
    Cat as CatIcon,
    BarChart,
    Coins,
    ArrowUpRight,
    Sparkles,
    Dog
} from "lucide-react";
import { Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    weight: ["300", "400", "500", "600", "700"],
  });

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

interface PageProps {
    params: {
        agentId: string;
    }
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

const Playground: NextPage<PageProps> = ({ params }) => {
    const [currentAgentId, setCurrentAgentId] = useState(params.agentId);
    const [isChatting, setIsChatting] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
    const tokens = [
        { icon: <Coins className="w-6 h-6" />, name: "BFC", color: "text-green-500", value: "58.82K%" },
        { icon: <Rocket className="w-6 h-6" />, name: "JUP", color: "text-red-500", value: "-1.47%" },
        { icon: <ArrowUpRight className="w-6 h-6" />, name: "ALPHA", color: "text-green-500", value: "28.25%" },
        { icon: <Sparkles className="w-6 h-6" />, name: "GYAT", color: "text-green-500", value: "121.40%" },
        { icon: <Cat className="w-6 h-6" />, name: "POPCAT", color: "text-green-500", value: "6.43%" },
        { icon: <Dog className="w-6 h-6" />, name: "Bonk", color: "text-red-500", value: "-6.64%" },
        { icon: <Dog className="w-6 h-6" />, name: "TRUMP", color: "text-red-500", value: "-7.65%" },
        { icon: <Dog className="w-6 h-6" />, name: "Ai16z", color: "text-red-500", value: "-6.64%" },
        { icon: <Dog className="w-6 h-6" />, name: "arc", color: "text-red-500", value: "-0.58%" },
        { icon: <Dog className="w-6 h-6" />, name: "wiflove", color: "text-red-500", value: "46.96%" },
        { icon: <Dog className="w-6 h-6" />, name: "GRIFFAIN", color: "text-red-500", value: "-6.64%" },
        { icon: <Dog className="w-6 h-6" />, name: "1DOLAR", color: "text-red-500", value: "-6.64%" },
        { icon: <Dog className="w-6 h-6" />, name: "Bonk", color: "text-red-500", value: "-6.64%" },
        { icon: <Dog className="w-6 h-6" />, name: "Bonk", color: "text-red-500", value: "-6.64%" },
    ];
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

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
            <div className={`min-h-screen bg-white text-gray-800 ${spaceGrotesk.className}`}>
            <div className="flex h-screen">
                <div className="w-1/5">
                    <Sidebar />
                </div>
                {/* Main Content */}
                <div className="flex-1 p-8">
                    {!isChatting ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg">
                                    {[...agents, ...mainAgents].find(agent => 
                                        agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                    )?.icon}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-800">
                                        {[...agents, ...mainAgents].find(agent => 
                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                        )?.name}
                                    </h1>
                                    <p className="text-gray-500">
                                        {[...agents, ...mainAgents].find(agent => 
                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                        )?.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center mb-8 gap-2">
                                <div className="relative w-full">
                                    <input 
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Tell me what to do..." 
                                        className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg pr-12 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && inputValue.trim()) {
                                                handleSendMessage(inputValue);
                                            }
                                        }}
                                    />
                                    <Search 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                                    />
                                </div>
                                <button 
                                    className="p-2 rounded-lg bg-green-500"
                                    onClick={() => handleSendMessage(inputValue)}
                                >
                                    <Send className="w-6 h-6 text-white" />
                                </button>       
                            </div>

                            <button className="block mx-auto mb-8 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                I'm Feeling Lucky
                            </button>

                            <div className="flex flex-wrap gap-2 justify-center mb-12">
                                {agents.map((agent) => (
                                    <Link
                                        key={agent.name}
                                        href={`/playground/agents/${agent.name.toLowerCase()}`}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                    >
                                        {agent.icon}
                                        <span>{agent.name}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {mainAgents.map((agent) => (
                                    <Link
                                        key={agent.name}
                                        href={`/playground/agents/${agent.name.toLowerCase().replace('agent ', '')}`}
                                        className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 mb-3">
                                            {agent.icon}
                                            <h3 className="text-gray-700">{agent.name}</h3>
                                        </div>
                                        <p className="text-gray-500 text-sm">{agent.description}</p>
                                    </Link>
                                ))}
                            </div>   
                        </div>
                    ) : (
                        <div className="max-w-[1200px] w-full mx-auto flex items-start">
                            <div className="flex w-[calc(100%-320px)] flex-col h-full">
                                <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                                    <div className="p-2 bg-white border border-gray-200 rounded-lg">
                                        {[...agents, ...mainAgents].find(agent => 
                                            agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                        )?.icon}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-semibold text-gray-800">
                                            {[...agents, ...mainAgents].find(agent => 
                                                agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                            )?.name}
                                        </h1>
                                        <p className="text-gray-500">
                                            {[...agents, ...mainAgents].find(agent => 
                                                agent.name.toLowerCase().replace('agent ', '') === currentAgentId
                                            )?.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex h-[calc(100vh-132px)]">
                                    <div className="flex-1 flex flex-col w-full">
                                        <div className="flex-grow overflow-y-auto flex flex-col px-4 py-8 min-h-0">
                                            {messages.map((msg, index) => (
                                              <div 
                                                key={index} 
                                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}
                                              >
                                                <div 
                                                  className={`rounded-lg p-3 max-w-md ${
                                                    msg.type === 'user' ? 'bg-green-500 text-white' : 'bg-gray-100'
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
                                        <div className="w-full border-t bg-white p-4 shrink-0">
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
                                              className="w-full p-4 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && inputValue.trim()) {
                                                  handleSendMessage(inputValue);
                                                }
                                              }}
                                            />
                                            <button 
                                              onClick={() => handleSendMessage(inputValue)}
                                              className="absolute right-4 top-1/2 -translate-y-1/2 overflow-hidden cursor-pointer"
                                            >
                                              <img width={25} src="/assets/icon/send.svg" alt="send" />
                                            </button>
                                          </div>
                                          <div className="w-full flex gap-2 overflow-x-auto pb-4 mt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                {tokens.map((token) => (
                                                    <Link
                                                        key={token.name}
                                                        href={`/playground/agents/${token.name.toLowerCase()}`}
                                                        className="whitespace-nowrap flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                                    >
                                                        <div className="text-green-500">{token.icon}</div>
                                                        <span>{token.name}</span>   
                                                        <span className={parseFloat(token.value) >= 0 ? 'text-green-500' : 'text-red-500'}>{token.value}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[300px] fixed right-40 top-24 ml-4">
                                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
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

                                    <div className="space-y-3">
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
                </div>
            </div>
        </div>
    );
};

export default Playground;
