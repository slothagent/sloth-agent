import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.REDIS_URL || "";
const REDIS_TOKEN = process.env.REDIS_TOKEN || "";

if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Missing Redis configuration. Please set REDIS_URL and REDIS_TOKEN in your .env file');
}

export const redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN
});

export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
}

export interface Chat {
    id: string;
    address: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

interface ChatWithDates extends Omit<Chat, 'createdAt' | 'updatedAt'> {
    createdAt: Date;
    updatedAt: Date;
}

function serializeChat(chat: ChatWithDates): Chat {
    return {
        ...chat,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        messages: chat.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp
        }))
    };
}

function deserializeChat(chat: Chat): Chat {
    return {
        ...chat,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp
        }))
    };
}

export async function createChat(chatId: string, address: string): Promise<Chat> {
    try {
        const now = new Date();
        const chat = serializeChat({
            id: chatId,
            address,
            messages: [],
            createdAt: now,
            updatedAt: now
        });
        
        const chatJson = JSON.stringify(chat);
        console.log(`Creating chat ${chatId} with data:`, chatJson);
        
        await redis.set(`chat:${chatId}`, chatJson);
        await redis.sadd(`user:${address}:chats`, chatId);
        await redis.zadd('chats', { score: Date.now(), member: chatId });
        
        return chat;
    } catch (error) {
        console.error(`Error creating chat ${chatId}:`, error);
        throw error;
    }
}

export async function getChat(chatId: string): Promise<Chat | null> {
    try {
        const chatStr = await redis.get<string>(`chat:${chatId}`);
        console.log(`Raw chat data for ${chatId}:`, chatStr);
        
        if (!chatStr) {
            console.log(`No chat found for ID ${chatId}`);
            return null;
        }
        
        // If the value is already an object, stringify it first
        const chatJsonStr = typeof chatStr === 'object' ? JSON.stringify(chatStr) : chatStr;
        const chat = JSON.parse(chatJsonStr);
        return deserializeChat(chat);
    } catch (error) {
        console.error(`Error getting chat ${chatId}:`, error);
        console.error('Raw data:', await redis.get(`chat:${chatId}`));
        return null;
    }
}

export async function getUserChats(address: string): Promise<Chat[]> {
    try {
        const chatIds = await redis.smembers(`user:${address}:chats`);
        console.log(`Found ${chatIds.length} chats for address ${address}`);
        const chats: Chat[] = [];

        for (const chatId of chatIds) {
            const chat = await getChat(chatId);
            if (chat) chats.push(chat);
        }

        return chats.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    } catch (error) {
        console.error(`Error getting user chats for ${address}:`, error);
        return [];
    }
}

export async function addMessage(chatId: string, message: ChatMessage): Promise<Chat> {
    try {
        const chat = await getChat(chatId);
        if (!chat) throw new Error('Chat not found');

        const updatedChat = {
            ...chat,
            messages: [...chat.messages, {
                ...message,
                timestamp: new Date().toISOString()
            }],
            updatedAt: new Date().toISOString()
        };

        const chatJson = JSON.stringify(updatedChat);
        console.log(`Updating chat ${chatId} with data:`, chatJson);
        
        await redis.set(`chat:${chatId}`, chatJson);
        await redis.zadd('chats', { score: Date.now(), member: chatId });

        return updatedChat;
    } catch (error) {
        console.error(`Error adding message to chat ${chatId}:`, error);
        throw error;
    }
}

export async function getRecentChats(address: string, limit: number = 10): Promise<Chat[]> {
    try {
        const chatIds = await redis.smembers(`user:${address}:chats`);
        console.log(`Found ${chatIds.length} chats for recent lookup, address ${address}`);
        const chats: Chat[] = [];

        for (const chatId of chatIds) {
            const chat = await getChat(chatId);
            if (chat) chats.push(chat);
        }

        return chats
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, limit);
    } catch (error) {
        console.error(`Error getting recent chats for ${address}:`, error);
        return [];
    }
}

export async function deleteChat(chatId: string, address: string): Promise<void> {
    try {
        await redis.del(`chat:${chatId}`);
        await redis.srem(`user:${address}:chats`, chatId);
        await redis.zrem('chats', chatId);
    } catch (error) {
        console.error(`Error deleting chat ${chatId}:`, error);
        throw error;
    }
} 