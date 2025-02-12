"use client";
import { NextPage } from "next";
import Sidebar from "@/components/custom/Sidebar";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TypewriterEffect from "@/components/custom/TypewriterEffect";
import Link from "next/link";   
import { 
    Target, 
    Cat,
    Search,
    Zap,
    Flame,
    Crown,
    MessageSquare,
    Send,
    ArrowUpRight,
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
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const router = useRouter();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        // Thêm logic tìm kiếm token ở đây
        console.log("Searching for token:", value);
    };

    const handleSendMessage = (message: string) => {
        if (message.trim()) {
            handleSearch(message);
            setInputValue('');
        }
    };

    return (
        <div className={`w-full bg-white text-gray-800`}>
            <div className="flex w-full h-screen">
                <div className="w-1/5">
                    <Sidebar />
                </div>
                <div className="flex-1 w-3/5 p-8">
                    <div className="w-full mx-auto">
                        <h1 className="text-center text-5xl font-mono text-green-500 mb-8">Memetrade Co.</h1>
                        <div className="flex justify-center mb-8">
                            <div className="relative flex items-center w-1/2">
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Tìm kiếm token..." 
                                    className="w-full bg-white border-2 border-neutral-700 text-gray-700 px-4 py-3 pr-12 focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-400"
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
                                    className="ml-2 p-4 bg-[#93E905] hover:bg-[#93E905]/80 transition-colors"
                                    onClick={() => handleSendMessage(inputValue)}
                                >
                                    <Search className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="w-full mb-12">
                            <ListToken />
                        </div>
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-[#93E905]" />
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
                                        className="group bg-white border-2 border-neutral-700 p-4 hover:border-gray-700 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-lg bg-white border border-neutral-700">
                                                    {agent.icon}
                                                </div>
                                                <p className="text-neutral-700 font-semibold text-lg">{agent.name}</p>
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
                </div>
            </div>
        </div>
    );
};

export default Playground;
