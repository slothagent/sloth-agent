// Simple store for passing initial messages between routes
const messageStore = new Map<string, string>();

export const setInitialMessage = (chatId: string, message: string) => {
    messageStore.set(chatId, message);
};

export const getInitialMessage = (chatId: string) => {
    return messageStore.get(chatId);
};

export const clearInitialMessage = (chatId: string) => {
    messageStore.delete(chatId);
}; 