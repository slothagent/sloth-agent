import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from '../../lib/redis';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(
    @Body('chatId') chatId: string,
    @Body('address') address: string,
  ) {
    return this.chatService.createChat(chatId, address);
  }

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string) {
    return this.chatService.getChat(chatId);
  }

  @Get('user/:address')
  async getUserChats(@Param('address') address: string) {
    return this.chatService.getUserChats(address);
  }

  @Post(':chatId/message')
  async addMessage(
    @Param('chatId') chatId: string,
    @Body() message: ChatMessage,
  ) {
    return this.chatService.addMessage(chatId, message);
  }

  @Get('recent/:address')
  async getRecentChats(
    @Param('address') address: string,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getRecentChats(address, limit);
  }

  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
    @Body('address') address: string,
  ) {
    return this.chatService.deleteChat(chatId, address);
  }
} 