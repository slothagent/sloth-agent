import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AgentService, Agent } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  async createAgent(@Body() body: any) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'description', 'owner'];
      for (const field of requiredFields) {
        if (!body[field]) {
          throw new HttpException(`Missing required field: ${field}`, HttpStatus.BAD_REQUEST);
        }
      }

      // Prepare the data object with required fields
      const agentData = {
        name: body.name,
        slug: body.slug,
        ticker: body.ticker,
        tokenAddress: body.tokenAddress,
        network: body.network,
        owner: body.owner,
        description: body.description || '',
        imageUrl: body.imageUrl || '',
        agentLore: body.agentLore || '',
        personality: body.personality || '',
        knowledgeAreas: body.knowledgeAreas || '',
        categories: body.categories || [],
        twitterAuth: body.twitterAuth ? {
          accessToken: body.twitterAuth.accessToken || null,
          refreshToken: body.twitterAuth.refreshToken || null,
          expiresAt: body.twitterAuth.expiresAt || null,
          tokenType: body.twitterAuth.tokenType || null,
          scope: body.twitterAuth.scope || null
        } : undefined
      };

      const agentResult = await this.agentService.create(agentData);
      const agent = await this.agentService.findById(agentResult.insertedId.toString());

      if (!agent) {
        throw new HttpException('Failed to create agent', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return { agent };
    } catch (error) {
      console.error('Error creating agent:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          throw new HttpException('An agent with this ticker already exists', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAgents(
    @Query('symbol') symbol: string,
    @Query('id') id: string,
    @Query('owner') owner: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search: string
  ) {
    try {
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      console.log('Fetching agents with params:', { symbol, id, owner, page: pageNum, pageSize: pageSizeNum, search });

      // Get agent by ID
      if (id) {
        try {
          const agent = await this.agentService.findById(id);
          if (!agent) {
            throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
          }
          return {
            data: agent,
            metadata: {
              currentPage: 1,
              pageSize: 1,
              totalPages: 1,
              totalCount: 1
            }
          };
        } catch (error) {
          throw new HttpException('Invalid agent ID', HttpStatus.BAD_REQUEST);
        }
      }

      // Get agent by symbol/ticker
      if (symbol) {
        const agent = await this.agentService.findByTicker(symbol);
        if (!agent) {
          throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
        }
        return {
          data: agent,
          metadata: {
            currentPage: 1,
            pageSize: 1,
            totalPages: 1,
            totalCount: 1
          }
        };
      }

      // Get agents by owner
      if (owner) {
        const collection = await this.agentService.getCollection();
        const skip = (pageNum - 1) * pageSizeNum;

        // Count total agents for this owner
        const totalCount = await collection.countDocuments({ owner });

        if (totalCount === 0) {
          return {
            data: [],
            metadata: {
              currentPage: pageNum,
              pageSize: pageSizeNum,
              totalPages: 0,
              totalCount: 0
            }
          };
        }

        // Validate pagination
        if (skip >= totalCount) {
          return {
            data: [],
            metadata: {
              currentPage: pageNum,
              pageSize: pageSizeNum,
              totalPages: Math.ceil(totalCount / pageSizeNum),
              totalCount
            }
          };
        }

        // Get paginated agents for this owner
        const agents = await collection.find({ owner })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSizeNum)
          .toArray();

        return {
          data: agents,
          metadata: {
            currentPage: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(totalCount / pageSizeNum),
            totalCount
          }
        };
      }

      // Search agents
      if (search) {
        const result = await this.agentService.findAll({
          page: pageNum,
          limit: pageSizeNum,
          search
        });

        return {
          data: result.agents,
          metadata: result.metadata
        };
      }

      // Get all agents with pagination
      const result = await this.agentService.findAll({
        page: pageNum,
        limit: pageSizeNum
      });

      return {
        data: result.agents,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error fetching agents:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to fetch agents',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 