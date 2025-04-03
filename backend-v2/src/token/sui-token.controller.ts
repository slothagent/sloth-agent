import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { SuiTokenService } from './sui-token.service';
import { SuiToken } from './interfaces/sui-token.interface';

interface TokensContent {
  content: Omit<SuiToken, 'createdAt' | 'updatedAt'>[];
}

@Controller('sui-tokens')
export class SuiTokenController {
  constructor(private readonly suiTokenService: SuiTokenService) {}

  @Post('batch')
  async createBatch(@Body() data: TokensContent) {
    return this.suiTokenService.createMany(data.content);
  }

  @Get()
  async list(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    return this.suiTokenService.list(pageNum, limitNum);
  }

  @Get('search')
  async search(@Query('query') query: string) {
    return this.suiTokenService.search(query);
  }

  @Get(':objectId')
  async findByObjectId(@Param('objectId') objectId: string) {
    return this.suiTokenService.findByObjectId(objectId);
  }
} 