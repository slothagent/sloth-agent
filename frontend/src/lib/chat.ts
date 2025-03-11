import { nanoid } from 'nanoid';

export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export interface Chat {
    id: string;
    address: string;
    messages: ChatMessage[];
    updatedAt: string;
    createdAt: string;
}

const API_URL = import.meta.env.PUBLIC_API_NEW;

// Create a new chat
export async function createChat(chatId: string, address: string): Promise<Chat> {
    const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, address }),
    });

    if (!response.ok) {
        throw new Error('Failed to create chat');
    }

    return response.json();
}

// Get a specific chat
export async function getChat(chatId: string): Promise<Chat | null> {
    try {
        const response = await fetch(`${API_URL}/api/chat/${chatId}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to get chat: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse response:', text);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error('Error in getChat:', error);
        throw error;
    }
}

// Get all chats for a user
export async function getUserChats(address: string): Promise<Chat[]> {
    const response = await fetch(`${API_URL}/api/chat/user/${address}`);

    if (!response.ok) {
        throw new Error('Failed to get user chats');
    }

    return response.json();
}

// Add a message to a chat
export async function addMessage(chatId: string, message: ChatMessage): Promise<void> {
    const response = await fetch(`${API_URL}/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        throw new Error('Failed to add message');
    }
}

// Get recent chats for a user
export async function getRecentChats(address: string, limit: number = 10): Promise<Chat[]> {
    const response = await fetch(`${API_URL}/api/chat/recent/${address}?limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to get recent chats');
    }

    return response.json();
}

// Delete a chat
export async function deleteChat(chatId: string, address: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
    });

    if (!response.ok) {
        throw new Error('Failed to delete chat');
    }
}