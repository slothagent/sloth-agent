import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowUp, Mic, History } from "lucide-react";
import { ChatMessage, Chat, createChat, getChat, addMessage, getUserChats } from "../lib/chat";
import { useAccount, useBalance, useSwitchChain, useWriteContract } from "wagmi";
import { v4 as uuidv4 } from 'uuid';
import { getInitialMessage, clearInitialMessage } from "../lib/messageStore";
import { ChatHistoryDialog } from "../components/ChatHistoryDialog";
import { ProcessLogs } from "../components/ProcessLogs";
import { uploadImageToPinata } from "../utils/pinata";
import { parseEther } from "ethers";
import { factoryAbi } from "../abi/factoryAbi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/omni/$chatId")({
    component: OmniChat,
});

function OmniChat() {
    const { address, chain } = useAccount();
    const navigate = useNavigate();
    const { chatId } = useParams({ from: "/omni/$chatId" });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [isPriceOrSearchQuery, setIsPriceOrSearchQuery] = useState<boolean>(false);
    const { switchChain } = useSwitchChain();
    const [allChats, setAllChats] = useState<Chat[]>([]);
    const [processSteps, setProcessSteps] = useState<Array<{message: string, status: 'pending' | 'completed' | 'current'}>>([
        { message: "Processing chat message", status: 'pending' },
        { message: "Analyzing message intent", status: 'pending' },
        { message: "Token creation request detected", status: 'pending' },
        { message: "Generating token image", status: 'pending' },
        { message: "Uploading token image to IPFS", status: 'pending' },
        { message: "Deploying token", status: 'pending' }
    ]);
    const [searchSteps, setSearchSteps] = useState<Array<{message: string, status: 'pending' | 'completed' | 'current'}>>([
        { message: "Starting search process", status: 'pending' },
        { message: "Analyzing search query", status: 'pending' },
        { message: "Fetching search results", status: 'pending' },
        { message: "Processing results", status: 'pending' },
        { message: "Formatting response", status: 'pending' }
    ]);
    const [chatSteps, setChatSteps] = useState<Array<{message: string, status: 'pending' | 'completed' | 'current'}>>([
        { message: "Processing chat message", status: 'pending' },
        { message: "Generating response", status: 'pending' },
        { message: "Updating chat history", status: 'pending' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { writeContractAsync } = useWriteContract()

    // console.log(balance);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, processSteps]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [inputValue]);

    // Load all chats for history
    useEffect(() => {
        async function loadAllChats() {
            if (!address) return;
            try {
                const chats = await getUserChats(address);
                setAllChats(chats);
            } catch (error) {
                console.error('Error loading chats:', error);
            }
        }
        loadAllChats();
    }, [address]);

    // Helper functions for message type checking
    const checkIsGeneralChat = (messageNormalized: string): boolean => {
        return !(
            // Not a price/search query
            messageNormalized.includes('price') ||
            messageNormalized.includes('how much') ||
            messageNormalized.includes('btc') ||
            messageNormalized.includes('bitcoin') ||
            messageNormalized.includes('eth') ||
            messageNormalized.includes('ethereum') ||
            messageNormalized.includes('market') ||
            messageNormalized.includes('trading') ||
            messageNormalized.includes('volume') ||
            messageNormalized.includes('today') ||
            messageNormalized.includes('now') ||
            messageNormalized.includes('current') ||
            messageNormalized.includes('latest') ||
            
            // Not a token creation request
            messageNormalized.includes('deploy token') ||
            messageNormalized.includes('create token') ||
            messageNormalized.includes('mint token') ||
            messageNormalized.includes('launch token') ||
            messageNormalized.includes('generate token') ||
            messageNormalized.includes('make token') ||
            messageNormalized.includes('issue token') ||
            messageNormalized.includes('new token') ||
            messageNormalized.includes('token creation') ||
            messageNormalized.includes('token deployment')
        );
    };

    const checkIsPriceOrSearchQuery = (messageNormalized: string): boolean => {
        return (
            messageNormalized.includes('price') ||
            messageNormalized.includes('how much') ||
            messageNormalized.includes('btc') ||
            messageNormalized.includes('bitcoin') ||
            messageNormalized.includes('eth') ||
            messageNormalized.includes('ethereum') ||
            messageNormalized.includes('market') ||
            messageNormalized.includes('trading') ||
            messageNormalized.includes('volume') ||
            messageNormalized.includes('today') ||
            messageNormalized.includes('now') ||
            messageNormalized.includes('current') ||
            messageNormalized.includes('latest')
        );
    };

    // Load chat history when component mounts
    useEffect(() => {
        let mounted = true;

        async function loadChat() {
            if (!address) return;
            
            try {
                const initialMessage = getInitialMessage(chatId);
                // console.log('Initial message loaded:', initialMessage);
                
                // Check if chat exists first
                let chat = await getChat(chatId);
                // console.log('Retrieved chat:', chat);
                
                if (!chat) {
                    // Create chat if it doesn't exist
                    try {
                        chat = await createChat(chatId, address);
                    } catch (error) {
                        console.error('Error creating chat:', error);
                        // If creation fails, check one more time in case of race condition
                        chat = await getChat(chatId);
                        if (!chat) {
                            throw new Error('Failed to create or retrieve chat');
                        }
                    }
                }
                
                if (initialMessage && mounted) {
                    // Set loading to false since we'll process the message
                    setIsLoading(false);

                    // Always try to get the latest chat state
                    const latestChat = await getChat(chatId);
                    
                    // If chat exists and has messages, use those
                    if (latestChat && latestChat.messages && latestChat.messages.length > 0) {
                        // console.log('Using existing messages from chat:', latestChat.messages);
                        setMessages(latestChat.messages);

                        // Check if we only have user message and need to generate assistant response
                        if (latestChat.messages.length === 1 && latestChat.messages[0].role === 'user') {
                            // console.log('Only user message found, generating assistant response...');
                            const userMessage = latestChat.messages[0];
                            
                            // Process the message to get assistant response
                            const messageNormalized = userMessage.content.toLowerCase();
                            let assistantResponse = '';

                            if (checkIsGeneralChat(messageNormalized)) {
                                const chatResult = await processChat(userMessage.content);
                                assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                            } else if (checkIsPriceOrSearchQuery(messageNormalized)) {
                                const searchResult = await processSearch(userMessage.content);
                                if (searchResult.error && searchResult.shouldTryChat) {
                                    const chatResult = await processChat(userMessage.content);
                                    assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                                } else {
                                    assistantResponse = searchResult.error ? `Error: ${searchResult.error}` : searchResult.searchResults;
                                }
                            } else {
                                const tokenResult = await processTokenCreation(userMessage.content);
                                if (tokenResult === false) {
                                    const chatResult = await processChat(userMessage.content);
                                    assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                                } else if (tokenResult) {
                                    // Handle token creation response...
                                    if (tokenResult.error) {
                                        assistantResponse = `Error: ${tokenResult.error}`;
                                    } else if (tokenResult.needsMoreInfo) {
                                        const missingFields = [];
                                        if (tokenResult.missingFields.name) missingFields.push("token name");
                                        if (tokenResult.missingFields.description) missingFields.push("token description");
                                        if (tokenResult.missingFields.symbol) missingFields.push("token symbol");
                                        
                                        assistantResponse = `I see you want to create a token. Could you please provide the following information:\n${missingFields.join('\n')}\n\nFor example, you can say:\n"Create a token named TokenX with description This is a community token and symbol TKX on sonic chain"`;
                                    }
                                }
                            }

                            // Create and save assistant message
                            const assistantMessage: ChatMessage = {
                                id: uuidv4(),
                                content: assistantResponse,
                                role: 'assistant',
                                timestamp: new Date()
                            };

                            // console.log('Creating assistant message for existing chat:', assistantMessage);

                            // Add to UI first
                            setMessages(prev => [...prev, assistantMessage]);

                            // Save to database
                            try {
                                await addMessage(chatId, assistantMessage);
                                // console.log('Assistant message saved successfully');
                            } catch (error) {
                                console.error('Error saving assistant message:', error);
                            }
                        }

                        clearInitialMessage(chatId);
                        return;
                    }

                    // If no messages found, create and process new message
                    // console.log('No existing messages found, creating new message');
                    const userMessage: ChatMessage = {
                        id: uuidv4(),
                        content: initialMessage,
                        role: 'user',
                        timestamp: new Date()
                    };
                    
                    // Set only user message immediately
                    setMessages([userMessage]);
                    
                    // Process the message
                    const messageNormalized = initialMessage.toLowerCase();
                    
                    // First check if it's a general chat message (no special keywords)
                    const isGeneralChat = checkIsGeneralChat(messageNormalized);

                    let assistantResponse = '';

                    if (isGeneralChat) {
                        // Process general chat messages directly
                        const chatResult = await processChat(initialMessage);
                        assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                    } else {
                        // Check for search/price query
                        const isPriceOrSearchQuery = checkIsPriceOrSearchQuery(messageNormalized);

                        if (isPriceOrSearchQuery) {
                            const searchResult = await processSearch(initialMessage);
                            if (searchResult.error && searchResult.shouldTryChat) {
                                const chatResult = await processChat(initialMessage);
                                assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                            } else {
                                assistantResponse = searchResult.error ? `Error: ${searchResult.error}` : searchResult.searchResults;
                            }
                        } else {
                            const tokenResult = await processTokenCreation(initialMessage);
                            if (tokenResult === false) {
                                const chatResult = await processChat(initialMessage);
                                assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                            } else if (tokenResult) {
                                if (tokenResult.error) {
                                    assistantResponse = `Error: ${tokenResult.error}`;
                                } else if (tokenResult.needsMoreInfo) {
                                    const missingFields = [];
                                    if (tokenResult.missingFields.name) missingFields.push("token name");
                                    if (tokenResult.missingFields.description) missingFields.push("token description");
                                    if (tokenResult.missingFields.symbol) missingFields.push("token symbol");
                                    
                                    assistantResponse = `I see you want to create a token. Could you please provide the following information:\n${missingFields.join('\n')}\n\nFor example, you can say:\n"Create a token named TokenX with description This is a community token and symbol TKX on sonic chain"`;
                                } else {
                                    assistantResponse = `Successfully created token!\n\n${
                                        tokenResult?.imageUrl ? 
                                        `<img src="${tokenResult?.imageUrl}" alt="${tokenResult?.name}" class="w-32 h-32 rounded-lg mb-4" />\n` : 
                                        ''
                                    }Token Details:\n
• Name: ${tokenResult.name}
• Symbol: ${tokenResult.symbol}
• Description: ${tokenResult.description}
• Chain: ${tokenResult.chain}
• Transaction: <a href="${tokenResult.chain === 'sonic' ? 'https://testnet.sonicscan.org/tx/' : 'https://scanv2-testnet.ancient8.gg/tx/'}${tokenResult?.hash}" target="_blank" class="text-blue-500 hover:underline">${tokenResult?.hash?.slice(0, 6)}...${tokenResult?.hash?.slice(-4)}</a>

Your token has been deployed successfully! 🎉`;
                                }
                            }
                        }
                    }

                    // Create and save assistant message
                    const assistantMessage: ChatMessage = {
                        id: uuidv4(),
                        content: assistantResponse,
                        role: 'assistant',
                        timestamp: new Date()
                    };

                    // console.log('Creating assistant message for existing chat:', assistantMessage);

                    // Add to UI first
                    setMessages(prev => [...prev, assistantMessage]);

                    // Save to database
                    try {
                        await addMessage(chatId, assistantMessage);
                        // console.log('Assistant message saved successfully');
                    } catch (error) {
                        console.error('Error saving assistant message:', error);
                    }

                    clearInitialMessage(chatId);
                } else {
                    // No initialMessage but we have a chatId, try to load existing chat
                    if (chat && chat.messages && chat.messages.length > 0) {
                        // console.log('Loading existing chat history:', chat.messages);
                        setMessages(chat.messages);
                        setIsLoading(false);
                        return;
                    }
                    
                    // No messages found
                    if (mounted) {
                        setMessages([]);
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error loading chat:', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        loadChat();

        return () => {
            mounted = false;
        };
    }, [chatId, address, navigate]);

    const processChat = async (message: string) => {
        // Reset chat steps
        setChatSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));

        // Step 1: Processing chat message
        setChatSteps(steps => steps.map((step, index) => 
            index === 0 ? { ...step, status: 'current' } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Step 2: Generating response
            setChatSteps(steps => steps.map((step, index) => 
                index === 0 ? { ...step, status: 'completed' } :
                index === 1 ? { ...step, status: 'current' } : step
            ));

            const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/omni/chat/${address}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Chat request failed');
            }

            const data = await response.json();

            // Step 3: Updating chat history
            setChatSteps(steps => steps.map((step, index) => 
                index === 1 ? { ...step, status: 'completed' } :
                index === 2 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 500));

            // Complete all steps
            setChatSteps(steps => steps.map(step => ({ ...step, status: 'completed' })));

            if (!data.success) {
                throw new Error(data.error || 'Failed to process chat');
            }

            return {
                success: true,
                chatResponse: data.message,
                history: data.history
            };

        } catch (error) {
            console.error('Error processing chat:', error);
            setChatSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
            return {
                error: 'Chat request failed',
                shouldTrySearch: true
            };
        }
    };

    const processSearch = async (message: string) => {
        // Check if it's a real-time query
        const realTimeKeywords = [
            // Cryptocurrency specific
            'btc', 'bitcoin', 'eth', 'ethereum', 'price of', 'how much is',
            'what is the price', 'what\'s the price', 'whats the price',
            'coin price', 'token price', 'crypto price', 'cryptocurrency price',
            
            // Time-related keywords
            'real time', 'realtime', 'real-time', 'live', 'current', 'now', 'latest',
            'today', 'tonight', 'this morning', 'this afternoon', 'this evening',
            'right now', 'at the moment', 'currently', 'present', 'instant',
            
            // Price and market related
            'price', 'market price', 'trading at', 'exchange rate', 'current price',
            'market cap', 'volume', 'trading volume', 'market value',
            
            // Update related
            'update', 'latest update', 'recent', 'newest', 'fresh',
            'just in', 'breaking', 'trending', 'happening',
            
            // Status related
            'status', 'condition', 'state', 'situation',
            
            // Chart and analysis related
            'chart', 'graph', 'trend', 'movement', 'analysis',
            'performance', 'statistics', 'metrics', 'indicators',
            
            // Time periods
            'last hour', 'past hour', 'hourly',
            'today', 'daily', '24h', '24 hour',
            'this week', 'weekly', '7d', '7 day',
            
            // Market specific
            'bull', 'bear', 'bullish', 'bearish',
            'resistance', 'support', 'volatile', 'volatility',
            
            // News related
            'news', 'latest news', 'recent news', 'announcement',
            'update', 'development', 'progress'
        ];

        const messageNormalized = message.toLowerCase();
        
        // Check for cryptocurrency price queries specifically
        const isPriceQuery = (
            (messageNormalized.includes('price') || messageNormalized.includes('how much')) &&
            (messageNormalized.includes('btc') || messageNormalized.includes('bitcoin') ||
             messageNormalized.includes('eth') || messageNormalized.includes('ethereum') ||
             messageNormalized.includes('coin') || messageNormalized.includes('token'))
        );

        // If it's a price query or contains any real-time keywords
        const isRealTimeQuery = isPriceQuery || realTimeKeywords.some(keyword => messageNormalized.includes(keyword));

        if (!isRealTimeQuery) {
            return {
                error: 'Not a real-time query',
                shouldTryChat: true
            };
        }

        // Reset search steps at the start
        setSearchSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
        
        // Step 1: Starting search process
        setSearchSteps(steps => steps.map((step, index) => 
            index === 0 ? { ...step, status: 'current' } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Step 2: Analyzing search query
            setSearchSteps(steps => steps.map((step, index) => 
                index === 0 ? { ...step, status: 'completed' } :
                index === 1 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 3: Fetching search results
            setSearchSteps(steps => steps.map((step, index) => 
                index === 1 ? { ...step, status: 'completed' } :
                index === 2 ? { ...step, status: 'current' } : step
            ));

            const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/omni/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: message }),
            });

            if (!response.ok) {
                throw new Error('Search request failed');
            }

            const data = await response.json();

            // Step 4: Processing results
            setSearchSteps(steps => steps.map((step, index) => 
                index === 2 ? { ...step, status: 'completed' } :
                index === 3 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (!data.success) {
                throw new Error(data.error || 'Failed to process search results');
            }

            // Step 5: Formatting response
            setSearchSteps(steps => steps.map((step, index) => 
                index === 3 ? { ...step, status: 'completed' } :
                index === 4 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Complete all steps
            setSearchSteps(steps => steps.map(step => ({ ...step, status: 'completed' })));

            return {
                success: true,
                searchResults: data.results.output_text
            };

        } catch (error) {
            console.error('Error processing search:', error);
            setSearchSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
            return {
                error: 'Failed to process search request. Please try again.'
            };
        }
    };

    const processTokenCreation = async (message: string) => {
        // Reset process steps at the start
        setProcessSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
        
        // Step 1: Starting process
        setProcessSteps(steps => steps.map((step, index) => 
            index === 0 ? { ...step, status: 'current' } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if message is about token creation using multiple keywords
        const tokenKeywords = [
            'deploy token',
            'create token',
            'mint token',
            'launch token',
            'generate token',
            'make token',
            'issue token',
            'new token',
            'token creation',
            'token deployment'
        ];
        
        const messageNormalized = message.toLowerCase();
        const isTokenCreation = tokenKeywords.some(keyword => messageNormalized.includes(keyword));
        
        // Step 2: Analyzing intent
        setProcessSteps(steps => steps.map((step, index) => 
            index === 0 ? { ...step, status: 'completed' } :
            index === 1 ? { ...step, status: 'current' } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // If basic keyword check fails, use AI to check intent
        if (!isTokenCreation) {
            try {
                const intentResponse = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/omni/check-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message }),
                });

                if (intentResponse.ok) {
                    const { isTokenCreationIntent } = await intentResponse.json();
                    if (!isTokenCreationIntent) {
                        setProcessSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
                        return false;
                    }
                }
            } catch (error) {
                console.error('Error checking intent:', error);
                // Fall back to keyword matching if AI check fails
                if (!isTokenCreation) {
                    setProcessSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
                    return false;
                }
            }
        }

        // Step 3: Token creation detected
        setProcessSteps(steps => steps.map((step, index) => 
            index === 1 ? { ...step, status: 'completed' } :
            index === 2 ? { ...step, status: 'current' } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Enhanced token detail extraction
            const extractTokenDetails = (message: string) => {
                // Extract token name - look for "token A" or "token named A" pattern
                const nameMatch = message.match(/token\s+(?:named\s+)?([^\s]+)|(?:name|called|named)\s+([^\s]+)/i);
                
                // Extract description - look for text after "description" until "on chain" or end
                const descriptionMatch = message.match(/description\s+(.+?)(?:\s+(?:on\s+chain|symbol)\s+|$)/i);
                
                // Extract symbol - look for "symbol X" pattern
                const symbolMatch = message.match(/symbol\s+([^\s]+)/i);
                
                // Extract chain name - specifically look for "on chain" followed by the name
                const chainPattern = /on\s+chain\s+([a-zA-Z0-9]+(?:\s*[a-zA-Z0-9]+)*)/i;
                const chainMatch = message.match(chainPattern);

                // Clean and sanitize the extracted values
                const sanitizeText = (text: string) => {
                    return text
                        .replace(/[^\w\s-]/g, '') // Remove special characters except hyphen
                        .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
                        .trim();
                };

                const name = nameMatch ? sanitizeText(nameMatch[1] || nameMatch[2] || '') : '';
                const description = descriptionMatch ? sanitizeText(descriptionMatch[1]) : '';
                const symbol = symbolMatch ? sanitizeText(symbolMatch[1]).toUpperCase() : '';
                
                // Get chain name with improved extraction
                let chain = 'sonic'; // Default chain
                if (chainMatch && chainMatch[1]) {
                    chain = chainMatch[1].replace(/\s+/g, '').toLowerCase();
                }
                
                // console.log('Raw chain match:', chainMatch);
                // console.log('Extraction results:', {
                //     name,
                //     description,
                //     chain
                // });

                return {
                    name: name || '',
                    description: description || '',
                    symbol: symbol || '',
                    chain: chain.toLowerCase() || 'sonic'
                };
            };

            // Step 4: Generating token image
            setProcessSteps(steps => steps.map((step, index) => 
                index === 2 ? { ...step, status: 'completed' } :
                index === 3 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 1000));

            const { name, description, symbol, chain: chainName } = extractTokenDetails(message);

            // If we don't have required fields, ask for clarification
            if (!name || !description || !symbol) {
                setProcessSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
                return {
                    needsMoreInfo: true,
                    missingFields: {
                        name: !name,
                        description: !description,
                        symbol: !symbol
                    }
                };
            }

            // Call API to create token
            const prompt = `Create a funny, anime-style logo for a token named "${name}" (${symbol}) and description "${description}". The design should be playful and meme-inspired, incorporating elements like exaggerated facial expressions, chibi characters, or internet meme aesthetics. It should still maintain a modern and minimalist look, making it suitable for a crypto token. Ensure the logo is clear, memorable, and scalable across different sizes.`;
                
            const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                setProcessSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
                throw new Error('Failed to generate image');
            }
            const data = await response.json();
            
            const generatedImageUrl = data.imageUrl;

            if (!generatedImageUrl) {
                throw new Error('No image URL received');
            }

            // Add a small delay to ensure the image is ready
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Download the image with proper headers
            const imageResponse = await fetch(generatedImageUrl);

            if (!imageResponse.ok) {
                throw new Error('Failed to download generated image');
            }

            const contentType = imageResponse.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error('Invalid image response');
            }

            const imageBlob = await imageResponse.blob();
            const file = new File([imageBlob], `${name}.png`, { type: 'image/png' });

            // Step 5: Uploading token image to IPFS
            setProcessSteps(steps => steps.map((step, index) => 
                index === 3 ? { ...step, status: 'completed' } :
                index === 4 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Upload to Pinata
            const ipfsUrl = await uploadImageToPinata(file, name);
            if (!ipfsUrl) {
                throw new Error('Failed to upload to IPFS');
            }

            // Step 6: Deploying token
            setProcessSteps(steps => steps.map((step, index) => 
                index === 4 ? { ...step, status: 'completed' } :
                index === 5 ? { ...step, status: 'current' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 1000));

            if(chainName.toLowerCase() == 'sonic' || chainName.toLowerCase() == 'soniclabs') {
                switchChain({
                    chainId: 57054
                })
            }else{
                switchChain({
                    chainId: 28122024
                })
            }

            const price = chainName.toLowerCase() == 'sonic' || chainName.toLowerCase() == 'soniclabs' ? parseEther('1') : parseEther('0.001');

            const tx = await writeContractAsync({
                address: chainName.toLowerCase() == 'sonic' || chainName.toLowerCase() == 'soniclabs' ? process.env.PUBLIC_FACTORY_ADDRESS_SONIC as `0x${string}` : process.env.PUBLIC_FACTORY_ADDRESS_ANCIENT8 as `0x${string}`,
                abi: factoryAbi,
                functionName: 'createTokenAndCurve',
                value: price,
                args: [name, symbol, parseEther("0")]
            });

            // Complete all steps
            setProcessSteps(steps => steps.map(step => 
                step.status === 'current' ? { ...step, status: 'completed' } : step
            ));
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                success: true,
                name: name,
                description: description,
                symbol: symbol,
                chain: chainName,
                hash: tx,
                imageUrl: ipfsUrl,
                contractAddress: '0x'
            }
        } catch (error) {
            console.error('Error creating token:', error);
            setProcessSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
            return {
                error: 'Failed to create token. Please try again.'
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
            // Show user message immediately
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");

            // Check message type and process accordingly
            const messageNormalized = inputValue.toLowerCase();
            
            // First check if it's a general chat message (no special keywords)
            const isGeneralChat = checkIsGeneralChat(messageNormalized);

            let assistantResponse = '';

            if (isGeneralChat) {
                // Process general chat messages directly
                const chatResult = await processChat(inputValue);
                assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
            } else {
                // Check for search/price query
                const isPriceOrSearchQuery = checkIsPriceOrSearchQuery(messageNormalized);

                if (isPriceOrSearchQuery) {
                    // If it's a price/search query, try search
                    const searchResult = await processSearch(inputValue);
                    setIsPriceOrSearchQuery(true);
                    
                    if (searchResult.error && searchResult.shouldTryChat) {
                        // Only try chat if search fails and it's not a real-time query
                        const chatResult = await processChat(inputValue);
                        setIsPriceOrSearchQuery(false);
                        assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                    } else {
                        assistantResponse = searchResult.error ? `Error: ${searchResult.error}` : searchResult.searchResults;
                    }
                } else {
                    setIsPriceOrSearchQuery(false);
                    // If not a search query, try token creation
                    const tokenResult = await processTokenCreation(inputValue);
                    
                    if (tokenResult === false) {
                        // If not a token creation request, try chat
                        const chatResult = await processChat(inputValue);
                        assistantResponse = chatResult.error ? `Error: ${chatResult.error}` : chatResult.chatResponse;
                    } else if (tokenResult) {
                        if (tokenResult.error) {
                            assistantResponse = `Error: ${tokenResult.error}`;
                        } else if (tokenResult.needsMoreInfo) {
                            const missingFields = [];
                            if (tokenResult.missingFields.name) missingFields.push("token name");
                            if (tokenResult.missingFields.description) missingFields.push("token description");
                            if (tokenResult.missingFields.symbol) missingFields.push("token symbol");
                            
                            assistantResponse = `I see you want to create a token. Could you please provide the following information:\n${missingFields.join('\n')}\n\nFor example, you can say:\n"Create a token named TokenX with description This is a community token and symbol TKX on sonic chain"`;
                        } else {
                            assistantResponse = `Successfully created token!\n\n${
                                tokenResult?.imageUrl ? 
                                `<img src="${tokenResult?.imageUrl}" alt="${tokenResult?.name}" class="w-32 h-32 rounded-lg mb-4" />\n` : 
                                ''
                            }Token Details:\n
• Name: ${tokenResult.name}
• Symbol: ${tokenResult.symbol}
• Description: ${tokenResult.description}
• Chain: ${tokenResult.chain}
• Transaction: <a href="${tokenResult.chain === 'sonic' ? 'https://testnet.sonicscan.org/tx/' : 'https://scanv2-testnet.ancient8.gg/tx/'}${tokenResult?.hash}" target="_blank" class="text-blue-500 hover:underline">${tokenResult?.hash?.slice(0, 6)}...${tokenResult?.hash?.slice(-4)}</a>

Your token has been deployed successfully! 🎉`;
                        }
                    }
                }
            }

            const assistantMessage: ChatMessage = {
                id: uuidv4(),
                content: assistantResponse,
                role: 'assistant',
                timestamp: new Date()
            };

            console.log('Creating assistant message:', assistantMessage);

            // Add assistant message to existing messages
            setMessages(prev => {
                console.log('Previous messages:', prev);
                const newMessages = [...prev, assistantMessage];
                console.log('New messages state:', newMessages);
                return newMessages;
            });

            // Save chat and message to the database
            try {
                console.log('Saving chat and messages to database...');
                // Create chat if it doesn't exist
                await createChat(address, chatId);
                
                // Save user message first
                console.log('Saving user message:', userMessage);
                await addMessage(chatId, userMessage);

                // Wait a moment to ensure user message is saved
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Then save assistant message
                console.log('Saving assistant message:', assistantMessage);
                await addMessage(chatId, assistantMessage);
                
                // Verify final state
                const finalChat = await getChat(chatId);
                console.log('Final chat state after both messages:', finalChat);
                
                // Update local state with server state if needed
                if (finalChat && finalChat.messages) {
                    setMessages(finalChat.messages);
                }
                
                console.log('Messages saved successfully');
            } catch (error) {
                console.error('Error saving chat:', error);
                // Show error in UI
                setMessages(prev => [...prev, {
                    id: uuidv4(),
                    content: 'Error saving messages. Please try again.',
                    role: 'assistant',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Show error message
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
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                                message.role === 'user' 
                                    ? 'bg-[#161B28] text-white' 
                                    : 'text-[#b4b5b6]'
                            }`}>
                                {isPriceOrSearchQuery ? (
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Add styling to markdown elements
                                            p: ({node, ...props}) => <p className="text-[#b4b5b6]" {...props} />,
                                            a: ({node, ...props}) => <a target="_blank" className="text-blue-500 hover:underline" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-4" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal pl-4" {...props} />,
                                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic" {...props} />,
                                            code: ({node, ...props}) => <code className="bg-gray-800 rounded px-1" {...props} />
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <div 
                                        className="whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: message.content }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Show process logs when processing token creation */}
                    {processSteps.some(step => step.status !== 'pending') && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl p-4">
                                <ProcessLogs steps={processSteps} />
                            </div>
                        </div>
                    )}

                    {/* Show process logs when processing search */}
                    {searchSteps.some(step => step.status !== 'pending') && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl p-4">
                                <ProcessLogs steps={searchSteps} />
                            </div>
                        </div>
                    )}

                    {/* Show process logs when processing chat */}
                    {chatSteps.some(step => step.status !== 'pending') && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl p-4">
                                <ProcessLogs steps={chatSteps} />
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
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What do you want to know?"
                                rows={1}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#7D8590] text-[15px] px-2 resize-none overflow-hidden min-h-[24px] max-h-[200px] leading-6"
                                style={{
                                    height: 'auto',
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