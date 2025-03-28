import { Controller, Post, Body, Delete, Param, Res} from '@nestjs/common';
import { Response } from 'express';
import { OmniService } from './omni.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('omni')
@Controller('omni')
export class OmniController {
  constructor(private readonly omniService: OmniService) {}

  @Post('check-intent')
  async checkIntent(@Body() body: { message: string }) {
    const isTokenCreationIntent = await this.omniService.checkIntent(body.message);
    return { isTokenCreationIntent };
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

  @Post('resolve-action')
  async handleAction(@Body() body: { message: string }, @Res() res: Response) {
    try {
      const result = await this.omniService.resolveAction(body.message);
      
      if (result.stream) {
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream the response
        for await (const chunk of result.streamResponse) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }

        // Send the final data
        res.write(`data: ${JSON.stringify({ 
          done: true, 
          data: result.streamResponse 
        })}\n\n`);
        
        res.end();
      } else {
        // Send regular JSON response
        res.json(result);
      }
    } catch (error) {
      console.error('Error in handleAction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  @Post('check-action')
  @ApiOperation({ summary: 'Check what action a user message is requesting' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the identified action and confidence score',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        step: { type: 'string' }
      }
    }
  })
  async checkAction(@Body('message') message: string) {
    return this.omniService.checkAction(message);
  }
} 