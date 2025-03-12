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
    try {
        // Check if chat already exists
        const existingChat = await getChat(chatId);
        if (existingChat) {
            return existingChat;
        }

        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatId, address }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create chat: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const chat = await response.json();
        return chat;
    } catch (error) {
        console.error('Error in createChat:', error);
        throw error;
    }
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
    try {
        // console.log('Adding message:', { chatId, message });
        const chat = await getChat(chatId);
        if (!chat) {
            throw new Error(`Chat not found with ID: ${chatId}`);
        }

        // Convert Date object to ISO string for proper JSON serialization
        const messageToSend = {
            ...message,
            timestamp: message.timestamp.toISOString()
        };

        // console.log('Sending message to API:', messageToSend);

        const response = await fetch(`${API_URL}/api/chat/${chatId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageToSend),
        });

        const responseText = await response.text();
        // console.log('Raw API response:', responseText);

        if (!response.ok) {
            throw new Error(`Failed to add message: ${response.status} ${response.statusText} - ${responseText}`);
        }

        // try {
        //     const responseData = JSON.parse(responseText);
        //     // console.log('Message added successfully:', responseData);
            
        //     // Verify the message was added
        //     const updatedChat = await getChat(chatId);
        //     // console.log('Updated chat state:', updatedChat);
        // } catch (e) {
        //     console.error('Error parsing response:', e);
        //     throw new Error('Invalid JSON response from server');
        // }
    } catch (error) {
        console.error('Error in addMessage:', error);
        throw error;
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