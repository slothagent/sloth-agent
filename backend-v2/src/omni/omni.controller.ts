import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { OmniService } from './omni.service';

@Controller('omni')
export class OmniController {
  constructor(private readonly omniService: OmniService) {}

  @Post('check-intent')
  async checkIntent(@Body() body: { message: string }) {
    const isTokenCreationIntent = await this.omniService.checkIntent(body.message);
    return { isTokenCreationIntent };
  }

  @Post('resolve-action')
  async resolveAction(@Body() body: { message: string }) {
    return await this.omniService.resolveAction(body.message);
  }

  @Post('search')
  async search(@Body() body: { query: string }) {
    return await this.omniService.search(body.query);
  }

  @Post('chat/:userId')
  async chat(
    @Param('userId') userId: string,
    @Body() body: { message: string }
  ) {
    return await this.omniService.chat(userId, body.message);
  }

  @Delete('chat/:userId')
  async clearChat(@Param('userId') userId: string) {
    return await this.omniService.clearChat(userId);
  }
} 