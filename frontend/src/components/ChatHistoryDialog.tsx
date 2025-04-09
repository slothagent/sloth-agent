import { useState } from 'react';
import { Search, Clock, Link2, Trash2, Plus } from 'lucide-react';
import { Chat, deleteChat } from '../lib/chat';
import { useNavigate } from '@tanstack/react-router';

interface ChatHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    chats: Chat[];
    currentChatId: string;
}

export function ChatHistoryDialog({ isOpen, onClose, chats, currentChatId }: ChatHistoryDialogProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredChat, setHoveredChat] = useState<Chat | null>(null);

    if (!isOpen) return null;

    const filteredChats = chats.filter(chat => {
        const hasMatchingMessage = chat.messages.some(message =>
            message.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return hasMatchingMessage;
    });

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const timestamp = new Date(date);
        const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            if (diffInHours < 1) {
                const minutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
                return `${minutes} minutes ago`;
            }
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return timestamp.toLocaleDateString();
        }
    };

    const handleChatClick = (chatId: string) => {
        navigate({ to: "/omni/$chatId", params: { chatId } });
        onClose();
    };

    const handleDeleteChat = async (chatId: string, address: string) => {
        await deleteChat(chatId, address);
        if (chatId === currentChatId) {
            navigate({ to: "/" });
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-[60%] h-[90vh] bg-[#0B0E17] flex flex-col rounded-lg mt-5 border border-[#2D333B]/30 z-50">
                <div className="flex h-full">
                    {/* Left Panel - Chat List */}
                    <div className="w-1/3 border-r border-[#2D333B] flex flex-col">
                        {/* Search Header */}
                        <div className="p-4 border-b border-[#2D333B]">
                            <div className="flex items-center gap-2 bg-[#161B28] rounded-lg px-3 py-2">
                                <Search className="w-4 h-4 text-[#7D8590]" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white placeholder-[#7D8590] w-full text-sm"
                                />
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="p-4">
                            <div className="text-sm text-[#7D8590] mb-2">Actions</div>
                            <button 
                                className="w-full flex items-center gap-2 px-3 py-2 text-[#7D8590] hover:bg-[#161B28] cursor-pointer text-sm"
                                onClick={() => navigate({ to: "/omni" })}
                            >
                                <Plus className="w-4 h-4" />
                                Create New Temporary Chat
                            </button>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4">
                                <div className="text-sm text-[#7D8590] mb-2">Today</div>
                                {filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-[#161B28] cursor-pointer ${
                                            chat.id === currentChatId ? 'bg-[#161B28]' : ''
                                        }`}
                                        onClick={() => handleChatClick(chat.id)}
                                        onMouseEnter={() => setHoveredChat(chat)}
                                        onMouseLeave={() => setHoveredChat(null)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Clock className="w-4 h-4 text-[#7D8590] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm truncate">
                                                    {typeof chat.messages[chat.messages.length - 1]?.content === 'object' 
                                                        ? JSON.stringify(chat.messages[chat.messages.length - 1]?.content)
                                                        : chat.messages[chat.messages.length - 1]?.content || 'New Chat'}
                                                </div>
                                                <div className="text-[#7D8590] text-xs">
                                                    {formatTimestamp(new Date(chat.updatedAt))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                className="p-1 hover:bg-[#2D333B] rounded"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteChat(chat.id, chat.address);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-[#7D8590]" />
                                            </button>
                                            <button className="p-1 hover:bg-[#2D333B] rounded">
                                                <Link2 className="w-4 h-4 text-[#7D8590]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Chat Content */}
                    <div className="w-2/3 flex flex-col">
                        {hoveredChat ? (
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="mb-4">
                                    <h3 className="text-lg text-white font-medium mb-2">Chat History</h3>
                                    <p className="text-[#7D8590] text-sm">
                                        Created: {new Date(hoveredChat.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {hoveredChat.messages.map((message, index) => (
                                        <div key={index} className="bg-[#161B28] rounded-lg p-4">
                                            <div className="text-[#7D8590] text-xs mb-1">
                                                {message.role === 'user' ? 'You' : 'Assistant'}
                                            </div>
                                            <div className="text-white text-sm whitespace-pre-wrap">
                                                {typeof message.content === 'object' 
                                                    ? JSON.stringify(message.content)
                                                    : message.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#7D8590]">
                                <p>Hover over a chat to view its content</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-[#2D333B] flex justify-end gap-2">
                    <button 
                        className="px-3 py-1 text-xs text-[#7D8590] hover:bg-[#161B28] rounded"
                        onClick={() => onClose()}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
} 