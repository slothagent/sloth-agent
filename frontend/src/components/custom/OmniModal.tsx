import { X, ArrowUp, PlusCircle, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { createChat, addMessage, ChatMessage } from "../../lib/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProcessLogs } from "../ProcessLogs";

interface OmniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TemplateQuestion {
  category: string;
  question: string;
}

// Add LoadingBar component
const LoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return 90; // Stop at 90% and wait for actual response
        }
        return prev + 5; // Slower increment for smoother animation
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="text-[#7D8590] text-sm mb-3">Searching Omni</div>
      <div className="w-full h-[2px] rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export function OmniModal({ isOpen, onClose }: OmniModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [processSteps, setProcessSteps] = useState<Array<{message: string, status: 'pending' | 'completed' | 'current'}>>([]);
  const [textareaHeight, setTextareaHeight] = useState<number>(24);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const templateQuestions: TemplateQuestion[] = [
    { category: "Market Data", question: "How far away from its all time high is Ethereum?" },
    { category: "Market Data", question: "Which assets over $1 billion market cap have reached an all time high in the last 3 months?" },
    { category: "Developments", question: "What protocols have deployed to Arbitrum in the past year?" },
    { category: "Market Data", question: "What are the top 10 DePIN projects by marketcap?" },
    { category: "Diligence", question: "What is Ethena used for?" },
    { category: "News", question: "What is ZK email?" },
    { category: "Diligence", question: "Compare and contrast the native asset functions of BitTensor vs Render" },
    { category: "Fundraising", question: "What are the five latest fundraising rounds that Multicoin Capital participated in?" },
    { category: "Diligence", question: "How was Solana funded or bootstrapped?" },
    { category: "News", question: "What's the latest news with the Base L2?" }
  ];

  // Debounced scroll function
  const scrollToBottom = (immediate = false) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: immediate ? 'auto' : 'smooth',
          block: 'end'
        });
      }
    }, immediate ? 0 : 100);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Modified scroll effect
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      scrollToBottom(lastMessage.role === 'user');
    }
  }, [messages]);

  // Separate scroll effect for process steps
  useEffect(() => {
    if (processSteps.some(step => step.status !== 'pending')) {
      scrollToBottom(false);
    }
  }, [processSteps]);

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [inputValue]);

  if (!isOpen) return null;

  const processMessage = async (message: string, shouldUpdateUI = true) => {
    setIsSearching(true);
    setProcessSteps([{ message: "", status: 'pending' }]);
    let finalMessage = '';
    
    try {
      // Get current step from check-action API
      const checkResponse = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/omni/check-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check action');
      }

      const checkData = await checkResponse.json();
      setIsSearching(false);
      if (checkData.success && checkData.step) {
        setProcessSteps([{ message: checkData.step, status: 'current' }]);
      }

      // Process the actual message
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/omni/resolve-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to process message');
      }

      // Check if response is stream
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)) as {
                  done?: boolean;
                  message?: string;
                  content?: string;
                };
                
                if (data.done) {
                  // Final data received
                  finalMessage = data.message ?? finalMessage;
                  // Mark step as completed
                  setProcessSteps([{ message: checkData.step, status: 'completed' }]);
                  break;
                } else if (data.content) {
                  // Append new content
                  finalMessage += data.content;
                  // Update messages in real-time only if shouldUpdateUI is true
                  if (shouldUpdateUI) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        lastMessage.content = finalMessage;
                        // Don't force immediate scroll during streaming
                        scrollToBottom(false);
                      } else {
                        newMessages.push({
                          id: uuidv4(),
                          content: finalMessage,
                          role: 'assistant',
                          timestamp: new Date()
                        });
                        // Scroll immediately for new message
                        scrollToBottom(true);
                      }
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json() as { message?: string };
        finalMessage = data?.message ?? 'Sorry, I could not process your request.';
        // Mark step as completed
        setProcessSteps([{ message: checkData.step, status: 'completed' }]);
      }

      return {
        success: true,
        message: finalMessage
      };

    } catch (error) {
      setIsSearching(false);
      console.error('Error processing message:', error);
      setProcessSteps([{ message: "", status: 'pending' }]);
      return {
        success: false,
        error: 'Failed to process message'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsProcessing(true);

    try {
      // Create new chat if none exists
      if (!chatId) {
        const newChatId = uuidv4();
        await createChat(newChatId);
        setChatId(newChatId);
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: messageContent,
        role: 'user',
        timestamp: new Date()
      };

      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage]);

      // Start processing message immediately with streaming enabled
      const processPromise = processMessage(messageContent, true);
      
      // Save user message to database in parallel
      const saveUserMessagePromise = addMessage(chatId!, userMessage);
      
      // Wait for processing to complete
      const result = await processPromise;
      
      // After streaming is complete, save the final assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: result.success && result.message ? result.message : 'Sorry, there was an error processing your message.',
        role: 'assistant',
        timestamp: new Date()
      };

      // Wait for user message to be saved and then save assistant message
      try {
        await saveUserMessagePromise;
        await addMessage(chatId!, assistantMessage);
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your message.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      if (chatId) {
        await addMessage(chatId, errorMessage);
      }
    } finally {
      setIsProcessing(false);
      setProcessSteps([]);
    }
  };

  const handleSelectTemplate = async (e: React.MouseEvent<HTMLButtonElement>, question: string) => {
    e.preventDefault();
    setInputValue(question);
    setShowTemplates(false);
    
    try {
      // Create new chat if none exists
      if (!chatId) {
        const newChatId = uuidv4();
        await createChat(newChatId);
        setChatId(newChatId);
      }

      // Create user message with the question directly
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: question,
        role: 'user',
        timestamp: new Date()
      };

      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage]);
      setIsProcessing(true);

      // Start processing message immediately with streaming enabled
      const processPromise = processMessage(question, true);
      
      // Save user message to database in parallel
      const saveUserMessagePromise = addMessage(chatId!, userMessage);
      
      // Wait for processing to complete
      const result = await processPromise;
      
      // After streaming is complete, save the final assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: result.success && result.message ? result.message : 'Sorry, there was an error processing your message.',
        role: 'assistant',
        timestamp: new Date()
      };

      // Wait for user message to be saved and then save assistant message
      try {
        await saveUserMessagePromise;
        await addMessage(chatId!, assistantMessage);
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your message.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      if (chatId) {
        await addMessage(chatId, errorMessage);
      }
    } finally {
      setIsProcessing(false);
      setProcessSteps([]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
    setInputValue("");
    setIsProcessing(false);
    setProcessSteps([]);
  };

  const handleSeeMore = () => {
    setShowTemplates(true);
  };

  const handleBack = () => {
    setShowTemplates(false);
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-full md:w-[600px] bg-[#0B0E17] border-l border-[#1F2937] shadow-xl z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
          {showTemplates ? (
            <>
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-[#2D333B] rounded transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <h2 className="text-xl font-semibold text-white absolute left-1/2 -translate-x-1/2">Sample Questions</h2>
            </>
          ) : (
            <>
              <button 
                onClick={handleNewChat}
                className="flex items-center gap-2 px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-[#2D333B] rounded transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                New Chat
              </button>
              <h2 className="text-xl font-semibold text-white absolute left-1/2 -translate-x-1/2">Omni Agent</h2>
            </>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {showTemplates ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <p className="text-[#7D8590] mb-2">Discover sample questions by category</p>
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#161B28] rounded-lg text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap">
                  <span className="text-[#7D8590]">∞</span>
                  All
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#161B28] rounded-lg text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap">
                  <span className="text-[#7D8590]">⟩</span>
                  Developments
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#161B28] rounded-lg text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap">
                  <span className="text-[#7D8590]">⊙</span>
                  Diligence
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#161B28] rounded-lg text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap">
                  <span className="text-[#7D8590]">$</span>
                  Fundraising
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#161B28] rounded-lg text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap">
                  <span className="text-[#7D8590]">◎</span>
                  Market Data
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#161B28] rounded-lg text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap">
                  <span className="text-[#7D8590]">□</span>
                  News
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {templateQuestions.map((template, index) => (
                <button
                  key={index}
                  onClick={(e) => handleSelectTemplate(e, template.question)}
                  className="w-full p-4 bg-[#161B28] hover:bg-[#1F2937] rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#7D8590] text-sm">{template.category}</span>
                  </div>
                  <p className="text-white text-sm">{template.question}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col">
                <div className="text-center mb-12 space-y-2">
                  <h1 className="text-[32px] font-normal text-white">Ask Omni</h1>
                  <p className="text-[20px] text-[#7D8590]">How can I help you today?</p>
                </div>

                {/* Chat Input for Empty State */}
                <div className="mx-auto w-full max-w-[600px] mb-8">
                  <div className="bg-[#161B28] rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-[#2D333B]/30">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-between gap-4 h-full">
                      <div className="flex items-start flex-1 gap-2">
                        <textarea
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            const scrollHeight = e.target.scrollHeight;
                            if (scrollHeight !== textareaHeight) {
                              setTextareaHeight(scrollHeight);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="What do you want to know?"
                          autoFocus
                          rows={1}
                          disabled={isProcessing}
                          className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#7D8590] text-[15px] resize-none overflow-hidden min-h-[24px] max-h-[200px] leading-6 disabled:opacity-50"
                          style={{
                            height: `${textareaHeight}px`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-end pt-4">
                        <button 
                          type="submit"
                          disabled={isProcessing}
                          className="px-2 py-2 bg-[#2D333B] text-white rounded hover:bg-[#444D56] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Template Questions */}
                <div className="text-center mb-6">
                  <p className="text-[#7D8590] mb-4">Or pick a question to see the power of Omni Agent</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto mb-6">
                    <button
                      onClick={(e) => handleSelectTemplate(e, "What companies have Polychain invested in recently that raised over $20 million?")}
                      className="bg-[#161B28] p-4 rounded-lg text-left hover:bg-[#1F2937] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#7D8590] text-sm">Fundraising</span>
                      </div>
                      <p className="text-white text-sm">What companies have Polychain invested in recently that raised over $20 million?</p>
                    </button>
                    <button
                      onClick={(e) => handleSelectTemplate(e, "How was Solana funded or bootstrapped?")}
                      className="bg-[#161B28] p-4 rounded-lg text-left hover:bg-[#1F2937] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#7D8590] text-sm">Diligence</span>
                      </div>
                      <p className="text-white text-sm">How was Solana funded or bootstrapped?</p>
                    </button>
                    <button
                      onClick={(e) => handleSelectTemplate(e, "Who are the largest block builders on Ethereum? Also, can you explain what LVR is and why it exists?")}
                      className="bg-[#161B28] p-4 rounded-lg text-left hover:bg-[#1F2937] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#7D8590] text-sm">Research</span>
                      </div>
                      <p className="text-white text-sm">Who are the largest block builders on Ethereum? Also, can you explain what LVR is and why it exists?</p>
                    </button>
                    <button
                      onClick={(e) => handleSelectTemplate(e, "What were the largest stories in Crypto last week?")}
                      className="bg-[#161B28] p-4 rounded-lg text-left hover:bg-[#1F2937] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#7D8590] text-sm">News</span>
                      </div>
                      <p className="text-white text-sm">What were the largest stories in Crypto last week?</p>
                    </button>
                  </div>
                  <button 
                    onClick={handleSeeMore} 
                    className="text-[#7D8590] text-sm hover:text-white transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    See More
                    <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-[2px]">
                      <path d="M1.5 9.5L5.5 5.5L1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user' 
                        ? 'bg-[#161B28] text-white max-w-[80%]' 
                        : 'text-[#b4b5b6]'
                    }`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="text-white text-sm mb-4" {...props} />,
                          a: ({node, ...props}) => <a target="_blank" className="text-blue-500 hover:underline" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-4" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                          li: ({node, ...props}) => <li className="mb-2 text-white text-sm" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4" {...props} />,
                          code: ({node, ...props}) => <code className="bg-gray-800 rounded px-1" {...props} />,
                          img: ({node, ...props}) => (
                            <img 
                              {...props} 
                              className="max-w-[100px] h-auto my-4 mt-6 rounded-lg"
                              loading="lazy"
                            />
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {/* Show loading state */}
                {isSearching && (
                  <div className="flex w-full">
                    <div className="w-full rounded-2xl p-4 bg-[#161B28]">
                      <LoadingBar />
                    </div>
                  </div>
                )}

                {/* Show process steps when processing */}
                {!isSearching && processSteps.some(step => step.status !== 'pending') && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl p-4">
                      <ProcessLogs steps={processSteps} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Chat Input for Non-Empty State */}
        {!showTemplates && messages.length > 0 && (
          <div className="p-4">
            <div className="bg-[#161B28] rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-[#2D333B]/30">
              <form onSubmit={handleSubmit} className="flex flex-col justify-between gap-4 h-full">
                <div className="flex items-start flex-1 gap-2">
                  <textarea
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      const scrollHeight = e.target.scrollHeight;
                      if (scrollHeight !== textareaHeight) {
                        setTextareaHeight(scrollHeight);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="What do you want to know?"
                    autoFocus
                    rows={1}
                    disabled={isProcessing}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#7D8590] text-[15px] px-2 resize-none overflow-hidden min-h-[24px] max-h-[200px] leading-6 disabled:opacity-50"
                    style={{
                      height: `${textareaHeight}px`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="px-2 py-2 bg-[#2D333B] text-white rounded hover:bg-[#444D56] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 