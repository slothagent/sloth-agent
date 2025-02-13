"use client";
import { NextPage } from "next";
import Sidebar from "@/components/custom/Sidebar";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
    Menu,
    X,
} from "lucide-react";
import ListToken from "@/components/custom/ListToken";
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
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className={`w-full bg-white text-gray-800 ${spaceGrotesk.className}`}>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
                <button 
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-semibold text-green-500">Sloth Ai</h1>
                <div className="w-10" /> {/* Spacer for alignment */}
            </div>

            {/* Mobile Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out
                lg:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Menu</h2>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <Sidebar />
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile sidebar */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="flex flex-col lg:flex-row w-full min-h-screen">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:w-[240px] flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-8">
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Remove duplicate header on mobile */}
                        <h1 className="hidden lg:block text-center text-5xl font-mono text-green-500 mb-8">
                            Sloth Ai
                        </h1>

                        {/* Search Bar */}
                        <div className="flex justify-center mb-6 lg:mb-8">
                            <div className="relative flex items-center w-full lg:w-1/2">
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Search for a token..." 
                                    className="w-full bg-white border-2 border-neutral-700 text-gray-700 px-3 lg:px-4 py-2 lg:py-3 pr-12 focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-400 text-base lg:text-lg"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && inputValue.trim()) {
                                            handleSendMessage(inputValue);
                                        }
                                    }}
                                />
                                <div className="absolute right-16 lg:right-20 flex items-center">
                                    <Search className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                                </div>
                                <button 
                                    className="ml-2 p-2 lg:p-4 bg-[#93E905] hover:bg-[#93E905]/80 transition-colors"
                                    onClick={() => handleSendMessage(inputValue)}
                                >
                                    <Search className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* List Token Section */}
                        <div className="w-full mb-8 lg:mb-12 overflow-x-auto">
                            <ListToken />
                        </div>

                        {/* Featured Agents Section */}
                        <div className="mb-6 lg:mb-8">
                            <div className="flex items-center justify-between mb-4 lg:mb-6 px-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-[#93E905]" />
                                    <h2 className="text-lg lg:text-xl font-semibold">Featured Agents</h2>
                                </div>
                                <Link 
                                    href="/store" 
                                    className="flex items-center gap-1 text-xs lg:text-sm text-gray-600 hover:text-gray-800"
                                >
                                    The <span className="text-green-500">⚡</span> Store 
                                    <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4" />
                                </Link>
                            </div>
                            
                            {/* Agents Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                                {mainAgents.map((agent) => (
                                    <Link
                                        key={agent.name}
                                        href={`/agents/${agent.name.toLowerCase()}`}
                                        className="group bg-white border-2 border-neutral-700 p-3 lg:p-4 hover:border-gray-700 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2 lg:mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-lg bg-white border border-neutral-700">
                                                    {agent.icon}
                                                </div>
                                                <p className="text-neutral-700 font-semibold text-base lg:text-lg">{agent.name}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-1 lg:p-1.5 border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors">
                                                    <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                                                </button>
                                                <button className="p-1 lg:p-1.5 border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors">
                                                    <Crown className="w-3 h-3 lg:w-4 lg:h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm lg:text-lg line-clamp-2">
                                            {agent.description}
                                        </p>
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
