import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Lightbulb, ArrowUp, Image, Code, BookOpen, Wrench, Link2, ChevronDown, Mic, History } from "lucide-react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from "wagmi";
import { Chat, getUserChats } from "../lib/chat";
import { ChatHistoryDialog } from "../components/ChatHistoryDialog";
import { setInitialMessage } from "../lib/messageStore";

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
    // const [userChats, setUserChats] = useState<Chat[]>([]);

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
    // useEffect(() => {
    //     async function loadUserChats() {
    //         if (!address) return;
    //         try {
    //             const chats = await getUserChats(address);
    //             setUserChats(chats);
    //         } catch (error) {
    //             console.error('Error loading user chats:', error);
    //         }
    //     }

    //     loadUserChats();
    // }, [address]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !address) return;

        const chatId = uuidv4();
        setInitialMessage(chatId, inputValue);
        navigate({ 
            to: "/omni/$chatId", 
            params: { chatId }
        });
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
                        {/* History button commented out since chat history is disabled
                        <button 
                                type="button" 
                                className="p-2 text-[#7D8590] bg-[#2D333B] cursor-pointer"
                                onClick={() => setIsHistoryOpen(true)}
                            >
                                <History className="w-4 h-4" />
                        </button>
                        */}
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

            {/* Action Buttons */}
            {/* <div className="flex justify-center gap-6 mt-8">
                <ActionButton icon={<BookOpen className="w-4 h-4" />} label="Research" />
                <ActionButton icon={<Wrench className="w-4 h-4" />} label="How to" />
                <ActionButton icon={<Search className="w-4 h-4" />} label="Analyze" />
                <ActionButton icon={<Image className="w-4 h-4" />} label="Create images" />
                <ActionButton icon={<Code className="w-4 h-4" />} label="Code" />
            </div> */}

            {/* Chat History Dialog - Commented out since chat history is disabled */}
            {/* <ChatHistoryDialog
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                chats={[]}
                currentChatId=""
            /> */}
        </div>
    );
}

// Action Button Component
function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="flex items-center gap-2 px-3 py-1.5 text-[#7D8590] hover:text-white hover:bg-[#2D333B] rounded-lg transition-colors text-sm">
            {icon}
            <span>{label}</span>
        </button>
    );
}