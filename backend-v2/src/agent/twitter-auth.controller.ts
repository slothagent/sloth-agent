import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('auth/callback')
export class TwitterAuthController {
  private twitterService: any = null;

  constructor(private readonly agentService: AgentService) {}

  setTwitterService(service: any) {
    this.twitterService = service;
  }

  @Get('twitter')
  async handleTwitterCallback(@Query('code') code: string, @Query('state') state: string) {
    try {
      if (!code || !state) {
        throw new HttpException('Missing required OAuth parameters', HttpStatus.BAD_REQUEST);
      }

      if (!this.twitterService) {
        throw new HttpException('Twitter service is not available', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Exchange the code for access token
      const tokens = await this.twitterService.handleCallback(code, state);
      
      if (!tokens) {
        throw new HttpException('Failed to exchange OAuth code', HttpStatus.BAD_REQUEST);
      }

      // Update agent with Twitter auth
      const agentId = state; // state parameter contains the agent ID
      const agent = await this.agentService.findById(agentId);
      
      if (!agent) {
        throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
      }

      // Update agent with Twitter tokens
      const collection = await this.agentService.getCollection();
      const updateResult = await collection.updateOne(
        { _id: agent._id },
        { 
          $set: {
            twitterAuth: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              expiresAt: tokens.expiresAt,
              tokenType: tokens.tokenType,
              scope: tokens.scope
            }
          }
        }
      );

      if (!updateResult.modifiedCount) {
        throw new HttpException('Failed to update agent with Twitter auth', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Get updated agent
      const updatedAgent = await this.agentService.findById(agentId);

      return { 
        success: true,
        message: 'Twitter authentication successful',
        agent: updatedAgent
      };
    } catch (error) {
      console.error('Twitter callback error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error instanceof Error ? error.message : 'Twitter authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 