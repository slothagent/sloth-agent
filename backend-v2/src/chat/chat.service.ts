import { Injectable } from '@nestjs/common';
import { 
  Chat, 
  ChatMessage, 
  createChat, 
  getChat, 
  getUserChats, 
  addMessage, 
  getRecentChats, 
  deleteChat 
} from '../../lib/redis';

@Injectable()
export class ChatService {
  async createChat(chatId: string, address: string): Promise<Chat> {
    return createChat(chatId, address);
  }

  async getChat(chatId: string): Promise<Chat | null> {
    return getChat(chatId);
  }

  async getUserChats(address: string): Promise<Chat[]> {
    return getUserChats(address);
  }

  async addMessage(chatId: string, message: ChatMessage): Promise<Chat> {
    return addMessage(chatId, message);
  }

  async getRecentChats(address: string, limit: number = 10): Promise<Chat[]> {
    return getRecentChats(address, limit);
  }

  async deleteChat(chatId: string, address: string): Promise<void> {
    return deleteChat(chatId, address);
  }
} 