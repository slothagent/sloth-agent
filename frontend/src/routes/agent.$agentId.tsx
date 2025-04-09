import { useState, useRef, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ArrowLeft, MessageSquare,Send, User, RotateCcw, Copy, Upload, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAgents } from '../hooks/useAgents';
import axios from 'axios';
import { Connection, PublicKey } from "@solana/web3.js";
import { createFileRoute, Link, useParams} from '@tanstack/react-router';
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%236b7280"%3EAI Agent%3C/text%3E%3C/svg%3E';
const typingMessages = [
    "Composing a message...",
    "Looking for information...",
    "Almost done..."
  ];
const connection = new Connection("https://api.devnet.solana.com/", "confirmed");

export const Route = createFileRoute("/agent/$agentId")({
    component: AgentDetails
});

interface Message {
  id: string;
  content: string | { texts: string[] };
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'tweets';
}

export default function AgentDetails() {
    const [typingIndex, setTypingIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [page] = useState(1);
    const [search] = useState('');
    const pageSize = 10;
    const [activeTab, setActiveTab] = useState('chat');
    const { agentId } = useParams({ from: "/agent/$agentId" });
    const [messages, setMessages] = useState<Message[]>([
        {
        id: '1',
        content: 'Hello! How can I help you today?',
        role: 'assistant',
        timestamp: new Date(),
        },
    ]);
    const { data: agentsData } = useAgents({
        page,
        pageSize,
        search,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedAgent = agentsData?.data
    ? agentsData.data.find((agent) => agent._id?.toString() === agentId)
    : null;
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isLoading) {
          const interval = setInterval(() => {
            setTypingIndex((prev) => (prev + 1) % typingMessages.length);
          }, 1000);
          return () => clearInterval(interval);
        }
      }, [isLoading]);
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
    
        if (showHeader) {
            setShowHeader(false);
        }
    
        const userMessage: Message = {
            id: Date.now().toString(),
            content: message,
            role: "user",
            timestamp: new Date(),
        };
    
        setMessages((prev) => [...prev, userMessage]);
        setMessage("");
        setIsLoading(true);
    
        try {
            // Check if the user requests to check wallet balance
            const balanceRegex = /check balance (\w+)/i;
            const match = message.match(balanceRegex);
    
            if (match && match[1]) {
                const walletAddress = match[1];
    
                try {
                    const balance = await connection.getBalance(new PublicKey(walletAddress));
                    const solBalance = balance / 1e9;
    
                    const balanceResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        content: `Balance of wallet ${walletAddress}: ${solBalance} SOL`,
                        role: "assistant",
                        timestamp: new Date(),
                        type: "text",
                    };
    
                    setMessages((prev) => [...prev, balanceResponse]);
                } catch (err) {
                    console.error("Error retrieving balance:", err);
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: (Date.now() + 1).toString(),
                            content: `Unable to retrieve the balance of wallet ${walletAddress}. Please check the address!`,
                            role: "assistant",
                            timestamp: new Date(),
                            type: "text",
                        },
                    ]);
                }
            }
    
            // If the message is not a balance check, call the chatbot API
            if (!match) {
                const response = await axios.post(
                    "https://api.slothai.xyz/generate_post",
                    {
                        name: agentsData?.data[0].name,
                        prompt: message,
                        image: false,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
    
                if (response.status !== 200) {
                    throw new Error("Chatbot API error");
                }
    
                const data = await response.data;
    
                const botResponse: Message = {
                    id: Date.now().toString(),
                    content: { texts: [data.texts[0]] },
                    role: "assistant",
                    timestamp: new Date(),
                    type: "tweets",
                };
    
                setMessages((prev) => [...prev, botResponse]);
            }
        } catch (error) {
            let errorMessage = "API error or no response";
    
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                errorMessage = error.response.data.detail || errorMessage;
            }
    
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    content: errorMessage,
                    role: "assistant",
                    timestamp: new Date(),
                    type: "text",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };
    
    

    const handlePostTweet = async (tweet: string) => {
        try {
        const tweetText = encodeURIComponent(tweet);
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
        window.open(twitterShareUrl, '_blank');
        } catch (error) {
        console.error("Failed to open Twitter:", error);
        alert("Failed to open Twitter. Please try again.");
        }
    };

    return (
        <div className="container flex flex-col h-[89vh] w-full text-gray-100 mx-auto mt-4">
        {/* Agent Header - Hidden after chat starts */}
            <div className="flex-shrink-0 border-b border-gray-800">
                <div className="sm:top-12 border-[#1F2937] border-b sm:border-b-0">
                    <div className=' md:mt-6 p-4 pt-0'>
                        <div className="flex items-center gap-2 justify-start">
                            <Link to="/agent" className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    <div className="w-7 h-7 bg-[#161B28] flex items-center justify-center border border-[#1F2937] hover:border-gray-600">
                                        <ArrowLeft className="w-4 h-4" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {showHeader && (
                    <div className='flex mt-4'>
                        {selectedAgent && (
                            <div key={selectedAgent._id?.toString() || ''} 
                                className="overflow-hidden hover:border-blue-600 transition-all duration-300"
                            >
                                <div className="flex justify-center items-center p-4 space-x-4 h-full">
                                    {/* Left - Image */}
                                    <img 
                                        src={selectedAgent.imageUrl || DEFAULT_IMAGE}
                                        alt={selectedAgent.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-28 h-28"
                                    />

                                    {/* Right - Content */}
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                                <h3 className="text-3xl font-medium mb-1 text-white">{selectedAgent.name}</h3>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                                            {selectedAgent.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
                <div>
                    <div className="mb-4 mt-4 pb-4 border-b border-b-[#1F2937]">
                        <div className="flex w-fit">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`px-2 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
                                    ${activeTab === 'chat'
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                            <MessageSquare className='w-4 h-4' />
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-2 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
                                    ${activeTab === 'overview'
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" />
                                Overview
                            </button>
                            {/* <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2
                                    ${activeTab === 'settings'
                                        ? 'bg-[#2196F3] text-white shadow-md shadow-[#2196F3]/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" />
                                quẻn rồi
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex-1 border border-[#1F2937] bg-[#0B0E17] flex flex-col'>
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        {/* Messages container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => {
                                const isFirstInGroup = index === 0 || messages[index - 1].role !== msg.role;
                                
                                return (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && isFirstInGroup && (
                                    <img 
                                        src={selectedAgent?.imageUrl || DEFAULT_IMAGE}
                                        alt="Bot"
                                        className="w-8 h-8 rounded-lg mr-2"
                                    />
                                    )}
                                    
                                    <div
                                    className={`max-w-full overflow-x-hidden p-2 ${
                                        msg.role === 'user' ? 'bg-[#2196F3] text-white' : 'bg-[#233432] text-gray-100'
                                    }`}
                                    >
                                    {msg.type === 'tweets' && typeof msg.content === 'object' && 'texts' in msg.content ? (
                                        <div className="space-y-4">
                                        {msg.content.texts.map((tweet, index) => (
                                            <div key={index} className="border border-gray-700 p-3 ">
                                            <p className="text-sm whitespace-pre-wrap mb-2">{tweet}</p>
                                            <Button
                                                onClick={() => handlePostTweet(tweet)}
                                                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white text-xs py-1 px-3 rounded-full"
                                            >
                                                Post Tweet
                                            </Button>
                                            </div>
                                        ))}
                                        </div>
                                    ) : (
                                        <div className='w-full'>
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content as string}</p>
                                        </div>
                                    )}
                                    {msg.role === 'assistant' && (
                                      <span className="text-[10px] opacity-50 mt-2 flex gap-2">
                                        <RotateCcw className='w-4 h-4'/>
                                        <Copy className='w-4 h-4'/>
                                        <Upload className='w-4 h-4'/>
                                        <ThumbsUp className='w-4 h-4'/>
                                        <ThumbsDown className='w-4 h-4'/>
                                      </span>
                                    )}
                                    </div>
                                </div>
                                );
                            })}
                          {isLoading && selectedAgent && (
                              <div className="flex justify-start items-center">
                                <img 
                                  src={selectedAgent.imageUrl || DEFAULT_IMAGE} 
                                  alt={selectedAgent.name || "Bot"} 
                                  className="w-8 h-8 mr-2 rounded-full object-cover"
                                  onError={(e) => e.currentTarget.src = DEFAULT_IMAGE} 
                                />
                                <div className="bg-gray-800 p-3 rounded-2xl">
                                 <p className="text-sm text-gray-400 animate-pulse">{typingMessages[typingIndex]}</p>
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Input container */}
                        <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/50 p-6">
                        <div className="flex gap-2">
                            <Input
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            className="flex-1  bg-gray-800 rounded-none border-gray-700 focus:border-gray-600 text-gray-100"
                            />
                            <Button 
                            onClick={handleSendMessage}
                            disabled={isLoading || !message.trim()}
                            className="bg-[#2196F3] rounded-none hover:bg-[#2196F3]/20 transition-colors px-6"
                            >
                            <Send className="h-5 w-5" />
                            </Button>
                        </div>
                        </div>  
                    </div>
                )}
            </div>
        
        </div>
    );
}