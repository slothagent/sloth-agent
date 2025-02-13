"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown, Edit2, Send, Bot, List, Menu, Wallet, X } from "lucide-react";
import Sidebar from "@/components/custom/Sidebar";
import { useState, useEffect, useRef } from "react";
import TabOverview from "@/components/custom/TabOverview";
import { Space_Grotesk } from "next/font/google";
import { Input } from "@/components/ui/input";
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    weight: ["300", "400", "500", "600", "700"],
});
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AgentDetails {
  name: string;
  description: string;
  image: string;
  isEditing: {
    name: boolean;
    description: boolean;
    instructions: boolean;
  };
  instructions: string;
}
interface Prompt {
  label: string;
  content: string;
}

interface TokenData {
  name: string;
  icon: string;
  price: number;
  change: number;
  volume: number;
}

const tokenData: TokenData[] = [
  {
    name: 'NAI',
    icon: '👤',
    price: 2.00,
    change: 0.00,
    volume: 3.39,
  },
  {
    name: 'Fartcoin',
    icon: '💨',
    price: 16.13,
    change: 0.62,
    volume: 26.19,
  },
  {
    name: 'TRUMP',
    icon: '🎭',
    price: 180.65,
    change: 15.76,
    volume: 11.46,
  },
  {
    name: 'GRIFFAIN',
    icon: 'G',
    price: 197.41,
    change: 0.16,
    volume: 1.20,
  },
  {
    name: 'JUP',
    icon: '🌐',
    price: 24.45,
    change: 0.83,
    volume: 29.30,
  },
];

export default function StudioPage() {
  const [showForm, setShowForm] = useState(false);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [label, setLabel] = useState('');
    const [content, setContent] = useState('');

    const handleCreate = () => {
        if (label && content) {
            setPrompts([...prompts, { label, content }]);
            setShowForm(false);
            setLabel('');
            setContent('');
        }
    };

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botReply: ChatMessage = {
        id: Date.now().toString() + "bot",
        content: "This is a placeholder response from Agent Trivia.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botReply]);
      setIsTyping(false);
    }, 1000);
  };

  // Thêm state để quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState("overview");

  // Thêm state để quản lý sidebar và token panel trên mobile
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileTokens, setShowMobileTokens] = useState(false);

  return (
    <div className={`flex flex-col md:flex-row h-screen ${spaceGrotesk.className}`}>
      {/* Sidebar - ẩn trên mobile, hiện trên desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col w-full p-4 md:p-6">
          {/* Header Section - Cập nhật layout */}
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {/* Menu button cho mobile */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setShowMobileSidebar(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <Brain className="w-8 h-8 md:w-12 md:h-12" />
                <h1 className="text-2xl md:text-4xl font-bold">Trivia</h1>
                <ChevronDown className="w-4 h-4" />
              </div>
              {/* Token button cho mobile */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileTokens(true)}
              >
                <Wallet className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Di chuyển nút New Thread lên header trên mobile */}
            <Button 
              className="md:hidden w-full bg-[#93E905] text-white hover:bg-[#93E905]/80"
              onClick={() => {
                setActiveTab("new-thread");
              }}
            >
              New Thread
            </Button>
          </div>

          {/* Mobile Sidebar */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
              <div className="absolute left-0 top-0 h-full w-[280px] bg-white">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowMobileSidebar(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="p-4">
                  <Sidebar />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Tokens Panel */}
          {showMobileTokens && (
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
              <div className="absolute right-0 top-0 h-full w-[280px] bg-white">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold">Tokens</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowMobileTokens(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {tokenData.map((token) => (
                      <div 
                        key={token.name}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            {token.icon}
                          </div>
                          <div>
                            <p className="text-black font-medium">{token.name}</p>
                            <p className="text-sm text-gray-400">{token.volume}K</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-black font-medium">${token.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-400">${token.change.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4 md:gap-0">
              <div className="grid grid-cols-3 md:flex md:flex-nowrap bg-gray-100 w-full md:w-auto rounded-lg gap-1 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white text-xs md:text-xl">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-white text-xs md:text-xl">
                  Actions  
                </TabsTrigger>
                <TabsTrigger value="instructions" className="data-[state=active]:bg-white text-xs md:text-xl">
                  Instructions
                </TabsTrigger>
                <TabsTrigger value="prompts" className="data-[state=active]:bg-white text-xs md:text-xl">
                  Prompts
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-white text-xs md:text-xl">
                  History
                </TabsTrigger>
                <TabsTrigger value="access" className="data-[state=active]:bg-white text-xs md:text-xl">
                  Access
                </TabsTrigger>
              </div>

              {/* Ẩn TabsTrigger New Thread trên mobile */}
              <TabsTrigger 
                value="new-thread" 
                className="hidden md:block md:w-auto md:ml-4 px-4 py-2 data-[state=active]:bg-white text-sm md:text-xl border border-gray-200"
                onClick={() => setActiveTab("new-thread")}
              >
                New Thread
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <TabOverview />
            </TabsContent>

            <TabsContent value="actions">
              <div className="grid grid-cols-1 translate-y-6 gap-6">
                <h2 className="text-lg font-semibold">Actions Content</h2>
              </div>
            </TabsContent>

            <TabsContent value="instructions">
              <div className="grid grid-cols-1 translate-y-6 gap-6">
                <h2 className="text-lg font-semibold">Instructions Content</h2>
              </div>
            </TabsContent>

            <TabsContent value="prompts">
            <div className="h-full w-full flex flex-col gap-8">
            <div className="flex justify-between items-center p-6">
                <div>
                    <h1 className="text-3xl font-bold">Prompt</h1>
                    <p className="text-base text-gray-500">Shortcut for commonly used messages</p>
                </div>
                <Button 
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 text-lg bg-[#93E905] text-white hover:border hover:border-black hover:text-white hover:bg-[#93E905]/80"
                >
                    Create
                </Button>
            </div>

            {prompts.length === 0 ? (
                <div className="w-full h-full flex flex-col justify-center items-center gap-4">
                    <List className="w-20 h-20 text-[#93E905]" />
                    <p className="text-2xl font-bold">Manage Agents Prompts</p>
                    <p className="text-xl text-gray-500">Create shortcut for commonly used messages</p>
                    <Button 
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 text-xl bg-[#93E905] text-black hover:border hover:border-black hover:text-white hover:bg-[#93E905]/80"
                    >
                        Create
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 px-6">
                    {prompts.map((prompt, index) => (
                        <div 
                            key={index}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200"
                        >
                            <div className="flex flex-col gap-1">
                                <h3 className="text-2xl font-bold">{prompt.label}</h3>
                                <p className=" text-gray-500">{prompt.content}</p>
                            </div>
                            <Button 
                                variant="outline"
                                className="text-gray-500"
                                onClick={() => {
                                    const newPrompts = [...prompts];
                                    newPrompts.splice(index, 1);
                                    setPrompts(newPrompts);
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="absolute top-0 right-0 left-0 bottom-0 w-screen h-screen bg-black/50 z-50 flex justify-center items-center">
                    <div className="w-full max-w-2xl mx-auto p-6 bg-white shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold">Create Prompt</h2>
                            <Button 
                                onClick={() => setShowForm(false)}
                                variant="outline"
                                className="text-lg text-gray-500"
                            >
                                Cancel
                            </Button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-lg font-medium">Label</label>
                                <Input 
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Enter a label" 
                                    className="w-full text-lg"
                                />
                                <p className="text-base text-gray-500">
                                    A short, human-readable name for the prompt displayed as a button to trigger the prompt
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-lg font-medium">Content</label>
                                <textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter prompt content"
                                    className="min-h-[150px] w-full p-2 text-lg"
                                />
                                <p className="text-base text-gray-500">
                                    The full text of the prompt that the agent will respond to
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <Button 
                                    className="px-6 py-2 bg-[#93E905] text-lg text-white hover:bg-[#93E905]/80"
                                    onClick={handleCreate}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="grid grid-cols-1 translate-y-6 gap-6">
                <h2 className="text-lg font-semibold">History Content</h2>
              </div>
            </TabsContent>

            <TabsContent value="access">
              <div className="grid grid-cols-1 translate-y-6 gap-6">
                <h2 className="text-lg font-semibold">Access Content</h2>
              </div>
            </TabsContent>

            <TabsContent value="new-thread" className="h-[calc(100vh-200px)] translate-y-6 md:h-[calc(100vh-180px)]">
              <div className="flex flex-col lg:flex-row gap-4 h-full">
                {/* Chat container */}
                <div className="flex-1 flex flex-col bg-background  border h-full">
                  {/* Chat messages area */}
                  <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                            <Bot className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] p-2 md:p-3  ${
                            message.sender === 'user'
                              ? 'bg-[#93E905] text-white ml-2'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm md:text-base break-words">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="max-w-[80%] p-3 bg-muted">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area - cập nhật cho mobile */}
                  <div className="border-t p-2 md:p-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Message Trivia" 
                        className="flex-1 text-sm md:text-base h-10"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inputMessage.trim()) {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button variant="default" size="icon" className="h-10 w-10" onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {prompts.map((prompt) => (
                        <Button 
                          key={prompt.label} 
                          variant="outline" 
                          size="sm"
                          className="text-xs py-1 px-2 h-auto"
                          onClick={() => {
                            setInputMessage(prompt.content);
                            handleSendMessage();
                          }}
                        >
                          {prompt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Token table - chỉ hiện trên desktop */}
                <div className="hidden lg:block w-[350px] bg-white border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-black text-lg">Thread from 02/11</h3>
                    <Button variant="ghost" className="text-black">
                      Tokens
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {tokenData.map((token) => (
                      <div 
                        key={token.name}
                        className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            {token.icon}
                          </div>
                          <div>
                            <p className="text-black font-medium">{token.name}</p>
                            <p className="text-sm text-gray-400">{token.volume}K</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-black font-medium">${token.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-400">${token.change.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
