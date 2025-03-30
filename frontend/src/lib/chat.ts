export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export interface Chat {
    id: string;
    messages: ChatMessage[];
    updatedAt: string;
    createdAt: string;
}

// In-memory storage
const chatStore: Map<string, Chat> = new Map();

// Create a new chat
export async function createChat(chatId: string): Promise<Chat> {
    const existingChat = chatStore.get(chatId);
    if (existingChat) {
        return existingChat;
    }

    const now = new Date().toISOString();
    const newChat: Chat = {
        id: chatId,
        messages: [],
        updatedAt: now,
        createdAt: now
    };

    chatStore.set(chatId, newChat);
    return newChat;
}

// Get a specific chat
export async function getChat(chatId: string): Promise<Chat | null> {
    return chatStore.get(chatId) || null;
}

// Get all chats
export async function getUserChats(): Promise<Chat[]> {
    return Array.from(chatStore.values());
}

// Add a message to a chat
export async function addMessage(chatId: string, message: ChatMessage): Promise<void> {
    const chat = chatStore.get(chatId);
    if (!chat) {
        throw new Error(`Chat not found with ID: ${chatId}`);
    }

    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    chatStore.set(chatId, chat);
}

// Get recent chats
export async function getRecentChats(limit: number = 10): Promise<Chat[]> {
    const allChats = Array.from(chatStore.values());
    return allChats
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
}

// Delete a chat
export async function deleteChat(chatId: string): Promise<void> {
    chatStore.delete(chatId);
}