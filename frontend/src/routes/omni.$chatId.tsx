import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowUp, History } from "lucide-react";
import { ChatMessage, Chat, getChat, addMessage, getUserChats } from "../lib/chat";
import { useAccount } from "wagmi";
import { v4 as uuidv4 } from 'uuid';
import { getInitialMessage, clearInitialMessage } from "../lib/messageStore";
import { ChatHistoryDialog } from "../components/ChatHistoryDialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProcessLogs } from "../components/ProcessLogs";


export const Route = createFileRoute("/omni/$chatId")({
    component: OmniChat,
});

function OmniChat() {
    const { address } = useAccount();
    const navigate = useNavigate();
    const { chatId } = useParams({ from: "/omni/$chatId" });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [messageProcessed, setMessageProcessed] = useState<boolean>(false);
    const [allChats, setAllChats] = useState<Chat[]>([]);
    const [processSteps, setProcessSteps] = useState<Array<{message: string, status: 'pending' | 'completed' | 'current'}>>([
        { message: "", status: 'pending' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>(null);
    const [textareaHeight, setTextareaHeight] = useState<number>(24);

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
        // Scroll immediately for new messages
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

    // Load all chats for history
    useEffect(() => {
        async function loadAllChats() {
            if (!address) return;
            try {
                const chats = await getUserChats(address);
                // console.log(chats);
                setAllChats(chats);
            } catch (error) {
                console.error('Error loading chats:', error);
            }
        }
        loadAllChats();
    }, [address]);

    // Load chat history when component mounts
    useEffect(() => {
        let mounted = true;

        async function loadChat() {
            if (!address) return;
            
            try {
                setIsLoading(true);
                const chat = await getChat(chatId);
                const initialMessage = getInitialMessage(chatId);
                
                if (!chat) {
                    throw new Error('Chat not found');
                }

                // Load existing messages first
                if (chat.messages && chat.messages.length > 0) {
                    setMessages(chat.messages);
                    setIsLoading(false);

                    // Only process initial message if conditions are met and message hasn't been processed
                    if (!messageProcessed && 
                        initialMessage && 
                        chat.messages.length === 1 && 
                        chat.messages[0].role === 'user' &&
                        chat.messages[0].content === initialMessage &&
                        !chat.messages.some(m => m.role === 'assistant')) {
                        
                        setMessageProcessed(true); // Mark as processed immediately
                        
                        try {
                            const result = await processMessage(initialMessage);
                            
                            if (mounted) {
                                const assistantMessage: ChatMessage = {
                                    id: uuidv4(),
                                    content: result.success ? result.message ?? 'Sorry, there was an error processing your message.' : 'Sorry, there was an error processing your message.',
                                    role: 'assistant',
                                    timestamp: new Date()
                                };

                                setMessages(prev => [...prev, assistantMessage]);
                                await addMessage(chatId, assistantMessage);
                            }
                        } catch (error) {
                            console.error('Error processing initial message:', error);
                        } finally {
                            if (mounted) {
                                clearInitialMessage(chatId);
                            }
                        }
                    } else {
                        // Clear initial message in all other cases
                        clearInitialMessage(chatId);
                    }
                } else {
                    setMessages([]);
                    setIsLoading(false);
                    clearInitialMessage(chatId);
                }
            } catch (error) {
                console.error('Error loading chat:', error);
                setIsLoading(false);
                if (mounted) {
                    navigate({ to: "/omni" });
                }
            }
        }

        loadChat();

        return () => {
            mounted = false;
        };
    }, [chatId, address, navigate, messageProcessed]);

    const processMessage = async (message: string, shouldUpdateUI = true) => {
        // Reset process step
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
        if (!inputValue.trim() || !address) return;

        const userMessage: ChatMessage = {
            id: uuidv4(),
            content: inputValue,
            role: 'user',
            timestamp: new Date()
        };

        try {
            // Add user message to UI immediately
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");

            // Start processing message immediately with streaming enabled
            const processPromise = processMessage(inputValue, true);
            
            // Save user message to database in parallel
            const saveUserMessagePromise = addMessage(chatId, userMessage);
            
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
                await addMessage(chatId, assistantMessage);
            } catch (error) {
                console.error('Error saving messages:', error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                id: uuidv4(),
                content: 'Sorry, there was an error processing your message.',
                role: 'assistant',
                timestamp: new Date()
            }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Optimized input handling
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);
        
        // Update height only when needed
        const scrollHeight = e.target.scrollHeight;
        if (scrollHeight !== textareaHeight) {
            setTextareaHeight(scrollHeight);
        }
    };

    if (!address) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0B0E17] text-white">
                <div className="text-xl">Please connect your wallet to continue.</div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0B0E17] text-white">
                <div className="text-xl">Loading chat...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-[#0B0E17] text-white">
            {/* Chat History Dialog */}
            <ChatHistoryDialog 
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                chats={allChats}
                currentChatId={chatId}
            />

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto pt-6 mt-20">
                <div className="max-w-[800px] mx-auto space-y-6 pb-6">
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
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-4 space-y-4 flex gap-6 flex-col" {...props} />,
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
                                {/* <div dangerouslySetInnerHTML={{ __html: message.content }} /> */}
                            </div>
                        </div>
                    ))}
                    
                    {/* Show process logs when processing */}
                    {processSteps.some(step => step.status !== 'pending') && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl p-4">
                                <ProcessLogs steps={processSteps} />
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Container */}
            <div className="pb-5">
                <div className="max-w-[800px] mx-auto p-4 bg-[#161B28]">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-between gap-4 h-full">
                        <div className="flex items-center flex-1 gap-2">
                            <textarea
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="What do you want to know?"
                                rows={1}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#7D8590] text-[15px] px-2 resize-none overflow-hidden min-h-[24px] max-h-[200px] leading-6"
                                style={{
                                    height: `${textareaHeight}px`
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <button 
                                type="button" 
                                className="p-2 text-[#7D8590] hover:bg-[#2D333B] cursor-pointer"
                                onClick={() => setIsHistoryOpen(true)}
                            >
                                <History className="w-4 h-4" />
                            </button>
                            <button 
                                type="submit"
                                className="p-1.5 text-[#7D8590] bg-[#2D333B] cursor-pointer hover:text-white transition-colors"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}