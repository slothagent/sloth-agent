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
    const { switchChain } = useSwitchChain();
    const [allChats, setAllChats] = useState<Chat[]>([]);
    const [processSteps, setProcessSteps] = useState<Array<{message: string, status: 'pending' | 'completed' | 'current'}>>([
        { message: "Starting token creation process", status: 'pending' },
        { message: "Analyzing message intent", status: 'pending' },
        { message: "Token creation request detected", status: 'pending' },
        { message: "Generating token image", status: 'pending' },
        { message: "Uploading token image to IPFS", status: 'pending' },
        { message: "Deploying token", status: 'pending' }
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
    // useEffect(() => {
    //     async function loadAllChats() {
    //         if (!address) return;
    //         try {
    //             const chats = await getUserChats(address);
    //             setAllChats(chats);
    //         } catch (error) {
    //             console.error('Error loading chats:', error);
    //         }
    //     }
    //     loadAllChats();
    // }, [address]);

    // Load chat history when component mounts
    useEffect(() => {
        let mounted = true;

        async function loadChat() {
            if (!address) return;
            
            try {
                const initialMessage = getInitialMessage(chatId);
                console.log('Initial message loaded:', initialMessage);
                
                if (initialMessage && mounted) {
                    // Create and immediately display user message
                    const userMessage: ChatMessage = {
                        id: uuidv4(),
                        content: initialMessage,
                        role: 'user',
                        timestamp: new Date()
                    };
                    
                    // Set initial user message
                    setMessages([userMessage]);
                    setIsLoading(false);

                    // Process token creation
                    const tokenResult = await processTokenCreation(initialMessage);
                    
                    if (mounted) {
                        let assistantResponse = '';
                        if (tokenResult) {
                            if (tokenResult.error) {
                                assistantResponse = `Error: ${tokenResult.error}`;
                            } else if (tokenResult.needsMoreInfo) {
                                const missingFields = [];
                                if (tokenResult.missingFields.name) missingFields.push("token name");
                                if (tokenResult.missingFields.description) missingFields.push("token description");
                                if (tokenResult.missingFields.symbol) missingFields.push("token symbol");
                                
                                assistantResponse = `I see you want to create a token. Could you please provide the following information:\n${missingFields.join('\n')}\n\nFor example, you can say:\n"Create a token named TokenX with description This is a community token and symbol TKX"`;
                            } else {
                                assistantResponse = `Successfully created token!\n\n${
                                    tokenResult.imageUrl ? 
                                    `<img src="${tokenResult.imageUrl}" alt="${tokenResult.name}" class="w-32 h-32 rounded-lg mb-4" />\n` : 
                                    ''
                                }Token Details:\n
• Name: ${tokenResult.name}
• Symbol: ${tokenResult.symbol}
• Description: ${tokenResult.description}
• Chain: ${tokenResult.chain}
• Contract Address: ${tokenResult.contractAddress}
• Transaction: <a href="${tokenResult.chain === 'sonic' ? 'https://explorer.sonic.so/tx/' : 'https://testnet.a8scan.io/tx/'}${tokenResult.hash}" target="_blank" class="text-blue-500 hover:underline">${tokenResult.hash}</a>

Your token has been deployed successfully! 🎉`;
                            }
                        } else {
                            assistantResponse = "I understand you're asking about: " + initialMessage + "\nI'm currently processing your request and will respond shortly...";
                        }

                        const assistantMessage: ChatMessage = {
                            id: uuidv4(),
                            content: assistantResponse,
                            role: 'assistant',
                            timestamp: new Date()
                        };

                        // Add assistant message to existing messages
                        setMessages(prevMessages => [...prevMessages, assistantMessage]);
                        
                        // Clear the initial message after processing
                        clearInitialMessage(chatId);
                    }
                } else {
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
                const intentResponse = await fetch('/api/omni/check-intent', {
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
            setMessages(prev => [...prev, userMessage]);
            setInputValue("");

            // Process token creation if applicable
            const tokenResult = await processTokenCreation(inputValue);
            // console.log(tokenResult);
            let assistantResponse = '';
            if (tokenResult) {
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
            } else {
                assistantResponse = "I understand you're asking about: " + inputValue + "\nI'm currently processing your request and will respond shortly...";
            }

            const assistantMessage: ChatMessage = {
                id: uuidv4(),
                content: assistantResponse,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
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
                <div className="max-w-[800px] mx-auto px-4 space-y-6 pb-6">
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
                                <div 
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                />
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