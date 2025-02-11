"use client";
import { NextPage } from "next";
import Sidebar from "@/components/custom/Sidebar";
import { useRef, useState } from "react";
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
    Send
} from "lucide-react";

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

const agents = [
    {
        name: 'Warhol',
        icon: <Paintbrush className="w-5 h-5" />
    },
    {
        name: 'Blink',
        icon: <Zap className="w-5 h-5" />
    },
    {
        name: 'Incinerator',
        icon: <Flame className="w-5 h-5" />
    },
    {
        name: 'Airdrop',
        icon: <Gift className="w-5 h-5" />
    },
    {
        name: 'Dev',
        icon: <Code className="w-5 h-5" />
    },
    {
        name: 'Baxus',
        icon: <Box className="w-5 h-5" />
    },
    {
        name: 'Twoface',
        icon: <Users className="w-5 h-5" />
    },
    {
        name: 'Wairdle',
        icon: <Gamepad2 className="w-5 h-5" />
    },
    {
        name: 'Sensei',
        icon: <Crown className="w-5 h-5" />
    },
    {
        name: 'Lulo',
        icon: <MessageSquare className="w-5 h-5" />
    },
    {
        name: 'Stake',
        icon: <Rocket className="w-5 h-5" />
    },
    {
        name: 'Dora',
        icon: <Search className="w-5 h-5" />
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

const Playground: NextPage = () => {
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


    const handleSendMessage = async (message: string) => {
        if (!message || !message.trim()) {
            return;
        }
    
        setIsChatting(true);
        const newUserMessage: Message = { type: 'user', content: message };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);


    }

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <div className="flex h-screen">
                {/* Sidebar */}
                <Sidebar />
                {/* Main Content */}
                <div className="flex-1 p-8">
                    {!isChatting ? (
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-center text-5xl font-mono text-green-500 mb-8">Memetrade Co.</h1>
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
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-center text-5xl font-mono text-green-500 mb-8">Memetrade</h1>
                            <div className="flex h-[calc(100vh-132px)]">
                              <div className="flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto px-4 py-8">
                                  {messages.map((msg, index) => (
                                    <div 
                                      key={index} 
                                      className={`flex ${msg.type == 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                                    >
                                      <div 
                                        className={`rounded-lg p-3 max-w-md ${
                                          msg.type === 'user' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-100'
                                        }`}
                                      >
                                        {msg.type === 'user' ? (
                                          msg.content
                                        ) : (
                                          <TypewriterEffect content={msg.content} />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {isLoading && (
                                    <div className="flex justify-start mb-4">
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
                                <div className="border-t bg-white p-4">
                                  <div className="relative max-w-4xl mx-auto">
                                    <input 
                                      type="text" 
                                      value={inputValue}
                                      onChange={(e) => setInputValue(e.target.value)}
                                      placeholder="Tin nhắn ChatGPT" 
                                      className="w-full p-4 pr-12 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
