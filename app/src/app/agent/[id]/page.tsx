'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Clock, Copy, Send, Star } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 10;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const { data: agentsData, isLoading: isAgentsLoading } = useAgents({
    page,
    pageSize,
    search,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // TODO: Implement actual API call here
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'This is a sample response from the bot.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to get bot response:', error);
      setIsLoading(false);
    }
  };

  const getDaysAgo = (date: Date) => {
    const diffTime = Math.abs(Date.now() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gray-950 border border-gray-800 text-gray-100 max-w-6xl mx-auto">
      {/* Agent Header - Hidden after chat starts */}
        <div className="flex-shrink-0 border-b border-gray-800">
          <div className="sm:top-12 border-[#1F2937] border-b sm:border-b-0">
            <div className="container mx-auto sm:py-4 flex md:items-center justify-between gap-4 flex-col md:flex-row mb-0">
                <div className="flex items-center gap-2 justify-between sm:justify-start">
                    <Link href="/agent" className="flex items-center gap-3">
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
                    
                    <div className="hidden sm:block">
                        <button className="flex items-center justify-center gap-3 px-3 py-1 text-sm font-medium text-gray-400 border border-[#1F2937] hover:bg-[#1C2333] hover:border-gray-600 transition-all duration-200">
                            <img 
                                className="w-5 h-5 rounded-md" 
                                alt={agentsData?.data[0].name} 
                                src={agentsData?.data[0].imageUrl} 
                                loading="lazy" 
                            />
                            {agentsData?.data[0].name}
                        </button>
                    </div>
                </div>
            </div>
          </div>
          {showHeader && (
            <div className='flex mb-4 ml-4'>
              <div className="lg:flex w-full items-center">                        
                <div className="lg:flex items-center gap-3 h-full hidden">
                  <img 
                      src={agentsData?.data[0].imageUrl}
                      alt="Agent Logo"
                      className="w-28 h-28 rounded-xl"
                      loading="lazy"
                      width={64}
                      height={64}
                  />
                  <div className="lg:flex flex-col justify-center h-full">
                      <div>
                          <div className="flex items-center gap-2">
                              <h1 className="text-3xl font-medium mb-1 text-white">{agentsData?.data[0].name}</h1>
                          </div>
                          <p className="text-xs text-gray-400">{agentsData?.data[0].description}</p>
                      </div>
                  </div>
                </div>
              </div>
              <div className="-translate-x-20 min-w-[500px] hidden lg:block">
                <div className="w-full grid grid-cols-2 max-h-[86px]">
                    <div className="w-auto h-[86px] justify-between flex flex-col border border-[#1F2937] px-4 py-2 bg-[#161B28]">
                        <div className="flex flex-col h-full">
                            <div className="text-sm mb-auto flex items-center gap-1.5 font-medium text-gray-400">
                                <img alt="Chain" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6" src="https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" style={{ color: 'transparent' }} />
                                Contract address
                            </div>
                            <div className="flex text-sm items-center gap-1 mt-1.5 text-gray-400 hover:text-white">
                                <span>Address not available</span>
                                <button className="ml-1 text-gray-400 hover:text-white">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="border-l-0 w-auto h-[86px] justify-between flex flex-col border border-[#1F2937] px-4 py-2 bg-[#161B28]">
                        <div>
                            <div className="text-sm flex items-center gap-1.5 font-medium text-gray-400">
                                <Clock className="w-4 h-4" />
                                Created
                            </div>
                            <div className="flex text-sm items-center gap-1 mt-1.5 text-gray-400">
                              'N/A'
                            </div>
                        </div>
                    </div>
                </div>
              </div>  
            </div>
          )}
        </div>

      {/* Chat Container - Flexible height */}
      <div className={`flex-1 min-h-0 transition-all duration-300 ease-in-out ${showHeader ? '' : 'pt-4'}`}>
        {/* Chat Messages */}
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg mr-2 flex-shrink-0 overflow-hidden">
                    <img 
                      src={agentsData?.data[0].imageUrl}
                      alt="Bot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <span className="text-[10px] opacity-50 mt-2 block">
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full ml-2 flex-shrink-0 bg-gray-700 flex items-center justify-center">
                    <span className="text-sm text-gray-300">You</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-end">
                <div className="w-8 h-8 rounded-lg mr-2 flex-shrink-0 overflow-hidden">
                  <img 
                    src={agentsData?.data[0].imageUrl}
                    alt="Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-800 rounded-2xl rounded-bl-sm p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed height */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-gray-900/50">
        <div className="container mx-auto p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1 bg-gray-800/50 border-gray-700 focus:border-gray-600 text-gray-100 rounded-xl"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-green-600 hover:bg-green-700 transition-colors rounded-xl px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
