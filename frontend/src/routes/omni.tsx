import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUp, History } from "lucide-react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from "wagmi";
import { Chat, getUserChats, createChat, addMessage, ChatMessage } from "../lib/chat";
import { ChatHistoryDialog } from "../components/ChatHistoryDialog";
import { setInitialMessage } from "../lib/messageStore";
import { Loading } from "../components/Loading";

export const Route = createFileRoute("/omni")({
    component: Omni
});

function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
}

function Omni() {
    const navigate = useNavigate();
    const { address } = useAccount();
    const [inputValue, setInputValue] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [currentGreeting, setCurrentGreeting] = useState(getTimeBasedGreeting());
    const [userChats, setUserChats] = useState<Chat[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [inputValue]);

    // Update greeting every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentGreeting(getTimeBasedGreeting());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    // Load user's chats
    useEffect(() => {
        async function loadUserChats() {
            if (!address) return;
            try {
                const chats = await getUserChats(address);
                setUserChats(chats);
            } catch (error) {
                console.error('Error loading user chats:', error);
            }
        }

        loadUserChats();
    }, [address]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !address) return;

        try {
            setIsTransitioning(true);
            const chatId = uuidv4();
            
            // Create chat first
            await createChat(chatId, address);

            // Create initial user message
            const userMessage: ChatMessage = {
                id: uuidv4(),
                content: inputValue,
                role: 'user',
                timestamp: new Date()
            };

            // Save the user message and wait for it to complete
            await addMessage(chatId, userMessage);
            
            // Wait a moment to ensure message is saved
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Set initial message and navigate
            setInitialMessage(chatId, inputValue);

            navigate({ 
                to: "/omni/$chatId", 
                params: { chatId }
            });
        } catch (error) {
            console.error('Error creating chat:', error);
            // Show error message to user
            alert('Failed to create chat. Please try again.');
            setIsTransitioning(false);
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

    return (
        <>
            {isTransitioning && <Loading />}
            {
                !isTransitioning && (
                    <div className="flex flex-col items-center justify-center min-h-screen -mt-20 bg-[#0B0E17] text-white">
                        {/* Header Text */}
                        <div className="text-center mb-6 space-y-2">
                            <h1 className="text-[40px] font-normal text-white">{currentGreeting}, {address.slice(0, 6)}...</h1>
                            <p className="text-[28px] text-[#7D8590]">How can I help you today?</p>
                        </div>

                        {/* Chat Container */}
                        <div className="w-full max-w-[800px] min-h-[140px] mx-auto bg-[#161B28] rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-[#2D333B]/30">
                            {/* Search Input */}
                            <form onSubmit={handleSubmit} className="flex flex-col justify-between gap-4 h-full">
                                <div className="flex items-start flex-1 gap-2">
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="What do you want to know?"
                                        autoFocus
                                        rows={1}
                                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#7D8590] text-[15px] px-2 resize-none overflow-hidden min-h-[24px] max-h-[200px] leading-6"
                                        style={{
                                            height: 'auto',
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-end float-end gap-2 pt-5">
                                    <button 
                                        type="button" 
                                        className="p-2 text-[#7D8590] bg-[#2D333B] cursor-pointer"
                                        onClick={() => setIsHistoryOpen(true)}
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            type="submit"
                                            className="p-2 text-[#7D8590] bg-[#2D333B] rounded-lg hover:text-white transition-colors"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Chat History Dialog */}
                        <ChatHistoryDialog
                            isOpen={isHistoryOpen}
                            onClose={() => setIsHistoryOpen(false)}
                            chats={userChats}
                            currentChatId=""
                        />
                    </div>
                )
            }
        </>
    );
}
