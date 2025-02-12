"use client";
import { NextPage } from "next";
import Sidebar from "@/components/custom/Sidebar";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
    Plus,
    Coins,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Dog
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

const mainAgents = [
    {
        name: 'Copycat',
        description: 'Copycat trades on pump.fun',
        icon: <Cat className="w-6 h-6" />
    },
    {
        name: 'Kitsune',
        description: 'Meet Kitsune, pioneering agentic commerce with every interaction. Shop Raposa Coffee now.',
        icon: <Flame className="w-6 h-6" />
    },
    {
        name: 'Moby',
        description: 'The most powerful whale watching copilot from Whale Watch by AssetDash',
        icon: <Zap className="w-6 h-6" />
    },
    {
        name: 'Sniper',
        description: 'Snipe new tokens on pump.fun',
        icon: <Target className="w-6 h-6" />
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
        setIsLoading(true);<div className="grid grid-cols-3 gap-6">
        {mainAgents.map((agent) => (
            <Link
                key={agent.name}
                href={`/agents/${agent.name.toLowerCase().replace('agent ', '')}`}
                className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
            >
                <div className="flex items-center space-x-3 mb-3">
                    <div className="text-green-500 group-hover:scale-110 transition-transform">
                        {agent.icon}
                    </div>
                    <h3 className="text-graparamsy-700">{agent.name}</h3>
                </div>
                <p className="text-gray-500 text-sm">{agent.description}</p>
            </Link>
        ))}
    </div>   


    }

    return (
        <div className={`w-full bg-white text-gray-800`}>
            <div className="flex w-full h-screen">
                <div className="w-1/5">
                    <Sidebar />
                </div>
                <div className="flex-1 w-3/5 p-8">
                    {!isChatting ? (
                        <div className="w-full mx-auto">
                            <h1 className="text-center text-5xl font-mono text-green-500 mb-8">Memetrade Co.</h1>
                            <div className="flex justify-center mb-8">
                                <div className="relative flex items-center w-1/2">
                                    <input 
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Tell me what to do..." 
                                        className="w-full bg-white border-4 border-black text-gray-700 px-4 py-3 pr-12 focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-400"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && inputValue.trim()) {
                                                handleSendMessage(inputValue);
                                            }
                                        }}
                                    />
                                    <div className="absolute right-20 flex items-center gap-2">
                                        <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <button 
                                        className="ml-2 p-4 bg-green-500 hover:bg-green-600 transition-colors"
                                        onClick={() => handleSendMessage(inputValue)}
                                    >
                                        <Send className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="w-full mb-12">
                                <div className="    w-full flex gap-2 overflow-x-auto pb-4" >
                                    {tokens.map((token) => (
                                        <Link
                                            key={token.name}
                                            href={`/token/${token.name.toLowerCase()}`}
                                            className="whitespace-nowrap flex-shrink-0 px-4 py-2 bg-white border-4 border-black text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                        >
                                            <div className="text-green-500">{token.icon}</div>
                                            <span>{token.name}</span>   
                                            <span className={parseFloat(token.value) >= 0 ? 'text-green-500' : 'text-red-500'}>{token.value}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-green-500" />
                                        <h2 className="text-xl font-semibold">Featured Agents</h2>
                                    </div>
                                    <Link href="/store" className="ml-auto flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                                        The <span className="text-green-500">⚡</span> Store 
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-4">
                                    {mainAgents.map((agent) => (
                                        <Link
                                            key={agent.name}
                                            href={`/agents/${agent.name.toLowerCase()}`}
                                            className="group bg-white border-4 border-black p-4 hover:border-gray-700 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded-lg bg-white border border-black">
                                                        {agent.icon}
                                                    </div>
                                                    <p className="text-black font-semibold text-lg">{agent.name}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="p-1.5 border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors">
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-lg line-clamp-2">{agent.description}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-center text-5xl font-mono text-green-500 mb-8">Memetrade Co.</h1>
                            <div className="flex h-[calc(100vh-132px)]">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 overflow-y-auto px-4 py-8">
                                        {messages.map((msg, index) => (
                                            <div 
                                                key={index} 
                                                className={`flex ${msg.type == 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                                            >
                                               http://localhost:3000/playground <div 
                                                    className={`rounded-lg p-3 max-w-md ${
                                                        msg.type === 'user' 
                                                            ? 'bg-[#4ADE80] text-[#121212]' 
                                                            : 'bg-[#1A1A1A] text-gray-300'
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
                                    <div className="border-t border-[#2A2A2A] bg-[#121212] p-4">
                                        <div className="relative max-w-4xl mx-auto">
                                            <input 
                                                type="text" 
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Message Griffain" 
                                                className="w-full p-4 pr-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4ADE80] placeholder-gray-500"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && inputValue.trim()) {
                                                        handleSendMessage(inputValue);
                                                    }
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleSendMessage(inputValue)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ADE80] hover:text-[#3AA365] transition-colors"
                                            >
                                                <Send className="w-6 h-6" />
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
