"use client";
import Sidebar from "@/components/custom/Sidebar";
import { 
  Send, 
  Bot, 
  Search,
  CircleDot,
  Blocks 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from 'next/navigation';
import ChartContentpage from "@/components/custom/ChartContentpage";
import CookieContent from "@/components/custom/CookieContent";
import MobyContentpage from "@/components/custom/MobyContentpage";
import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function TokenPage() {
  const params = useParams();
  const tokenId = params.tokenid as string;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // TODO: Replace with actual API call
      const response = await simulateBotResponse(inputMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Handle error
      console.error('Failed to get bot response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simulate bot response - replace with actual API call
  const simulateBotResponse = async (message: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `I received your message about "${message}". How can I help you with this token?`;
  };

  const CookieDaoContent = () => (
    <CookieContent />
  );

  const ChartContent = () => (
    <ChartContentpage />
  );

  const MobyContent = () => (
    <MobyContentpage />
  );

  return (
    <div className={`flex h-screen bg-white`}>
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0">
        <Sidebar/>
      </div>

      {/* Main content */}
      <div className="flex-grow p-6 h-full overflow-y-auto scrollbar-hide">
        {/* Search bar */}
        <div className="flex w-full mb-4 gap-2">
          <input 
            type="text"
            placeholder="Search for a token" 
            className="w-full bg-white border-4 border-black text-gray-700 px-4 py-3 pr-12 focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-400 text-lg"
          />
          <div className="flex items-center p-4 bg-green-400">
            <Search className="w-6 h-6 text-green-700" />
          </div>
        </div>

        {/* Header with token info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-3">
            <Blocks className="w-10 h-10 text-gray-700" />
          </div>
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">test griffain.com</h1>
            <p className="text-gray-500 text-lg">GRIFFAIN</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger 
              value="overview"
              className="text-xl font-medium data-[state=active]:border-b-4 data-[state=active]:border-gray-900"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="cookie"
              className="text-xl font-medium data-[state=active]:border-b-4 data-[state=active]:border-gray-900"
            >
              Cookie Dao
            </TabsTrigger>
            <TabsTrigger 
              value="moby"
              className="text-xl font-medium data-[state=active]:border-b-4 data-[state=active]:border-gray-900"
            >
              Moby
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <ChartContent />
          </TabsContent>
          
          <TabsContent value="cookie">
            <CookieDaoContent />
          </TabsContent>
          
          <TabsContent value="moby">
            <MobyContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat sidebar */}
      <div className="w-[480px] flex-shrink-0 border-l border-gray-200 p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Bot className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h2 className="text-gray-900 font-medium text-xl">Chat with Agent Dora</h2>
              <p className="text-gray-500 text-base">
                Google for tokens. Search for a token and swap it just by typing.
              </p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 relative">
            <div className="absolute inset-0 overflow-y-auto">
              <div className="min-h-full pb-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-[#4ade80] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-900">
                      <span className="animate-pulse">Dora is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>
          </div>

          {/* Message input */}
          <div className="relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Message Dora"
              className="w-full px-5 py-4 bg-gray-100 rounded-lg pr-14 text-lg text-gray-900 placeholder-gray-500 border-none focus:ring-1 focus:ring-gray-300"
            />
            <button 
              onClick={handleSendMessage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#4ade80] p-3 rounded-lg"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Token Search button */}
          <button className="mt-4 w-full py-3 px-5 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center gap-3 hover:bg-gray-200 text-lg font-medium">
            <CircleDot className="w-5 h-5" />
            Token Search
          </button>
        </div>
      </div>
    </div>
  );
}

