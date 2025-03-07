'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Clock, Copy, Layout, Send, Star, User } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('chat');
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

  return (
    <div className="flex flex-col h-[89vh] bg-gray-950 border border-gray-800 w-full sm:w-3/4 text-gray-100 mx-auto mt-4">
      {/* Agent Header - Hidden after chat starts */}
        <div className="flex-shrink-0 border-b border-gray-800">
          <div className="sm:top-12 border-[#1F2937] border-b sm:border-b-0">
            <div className="container mx-auto sm:py-4 flex md:items-center justify-between gap-4 flex-col md:flex-row mb-0">
                <div className="flex items-center gap-2 justify-start">
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
                    
                    <div>
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
            <div className='flex mt-4 ml-4'>
              <div className="lg:flex w-full items-center">                        
                <div className="flex items-center gap-3 h-full">
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
              
            </div>
          )}
          <div>
            <div className="mb-4 ml-4 mr-4 mt-4">
                <div className="flex p-1 gap-2 bg-[#161B28] rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2
                            ${activeTab === 'chat'
                                ? 'bg-[#2196F3] text-white shadow-md shadow-[#2196F3]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <MessageSquare className='w-4 h-4' />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2
                            ${activeTab === 'overview'
                                ? 'bg-[#2196F3] text-white shadow-md shadow-[#2196F3]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <User className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2
                            ${activeTab === 'settings'
                                ? 'bg-[#2196F3] text-white shadow-md shadow-[#2196F3]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <User className="w-4 h-4" />
                        quẻn rồi
                    </button>
                </div>
            </div>
          </div>
        </div>
        <div className='flex-1 h-[60%] inline-block'>
            {activeTab === 'chat' && (
              <div className="flex flex-col flex-1 h-full">
                {/* Chat Messages */}
                <div className="flex-1 h-full overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <img 
                          src={agentsData?.data[0].imageUrl}
                          alt="Bot"
                          className="w-8 h-8 rounded-lg mr-2"
                        />
                      )}
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user' ? 'bg-[#2196F3] text-white' : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] opacity-50 mt-1 block">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start items-end">
                      <img 
                        src={agentsData?.data[0].imageUrl}
                        alt="Bot"
                        className="w-8 h-8 rounded-lg mr-2"
                      />
                      <div className="bg-gray-800 p-3 rounded-2xl">
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
                
                {/* Input Area */}
                <div className="border-t border-gray-800 bg-gray-900/50 p-6">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 bg-gray-800 border-gray-700 focus:border-gray-600 text-gray-100 rounded-xl"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      className="bg-[#2196F3] hover:bg-[#2196F3]/20 transition-colors rounded-xl px-6"
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
