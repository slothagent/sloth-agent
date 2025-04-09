import { Controller, Post, Body, Delete, Param, Res} from '@nestjs/common';
import { Response } from 'express';
import { OmniService } from './omni.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('omni')
@Controller('omni')
export class OmniController {
  constructor(private readonly omniService: OmniService) {}
  
  @Post('resolve-action')
  async handleAction(@Body() body: { message: string }, @Res() res: Response) {
    try {
      const result = await this.omniService.resolveAction(body.message);
      
      // console.log(result);

      if (result.stream) {
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream the response
        let messageId = Date.now().toString();

        // Send initial response
        res.write(`data: ${JSON.stringify({
          type: 'response.created',
          response: {
            id: messageId,
            status: 'in_progress',
            created_at: Date.now(),
            output: []
          }
        })}\n\n`);

        try {
          for await (const chunk of result.streamResponse) {
            if (chunk.type === 'response.output_text.delta') {
              res.write(`data: ${JSON.stringify({
                type: 'response.output_text.delta',
                item_id: messageId,
                output_index: 0,
                content_index: 0,
                delta: chunk.delta || ''
              })}\n\n`);
            } else {
              // Forward other response types as is
              res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }
          }

          // Send completion message
          res.write(`data: ${JSON.stringify({
            type: 'response.completed',
            response: {
              id: messageId,
              status: 'completed',
              created_at: Date.now(),
              output: result.streamResponse
            }
          })}\n\n`);
          
          res.end();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Streaming error occurred',
              error: streamError.message
            });
          } else {
            res.write(`data: ${JSON.stringify({
              type: 'response.error',
              error: streamError.message
            })}\n\n`);
            res.end();
          }
        }
      } else {
        // Send regular JSON response
        res.json(result);
      }
    } catch (error) {
      console.error('Error in handleAction:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
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