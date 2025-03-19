import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TokenService, Token } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  async createToken(@Body() body: any) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'address', 'owner', 'ticker', 'totalSupply'];
      for (const field of requiredFields) {
        if (!body[field]) {
          throw new HttpException(`Missing required field: ${field}`, HttpStatus.BAD_REQUEST);
        }
      }

      // Prepare the data object with required fields
      const tokenData = {
        name: body.name,
        address: body.address,
        owner: body.owner,
        ticker: body.ticker,
        totalSupply: body.totalSupply,
        network: body.network,
        // Optional fields
        description: body.description || undefined,
        imageUrl: body.imageUrl || undefined,
        twitterUrl: body.twitterUrl || undefined,
        telegramUrl: body.telegramUrl || undefined,
        websiteUrl: body.websiteUrl || undefined,
        categories: body.categories || [],
      };

      // Create the token
      const tokenResult = await this.tokenService.create(tokenData);

      // Get the created token
      const token = await this.tokenService.findById(tokenResult.insertedId.toString());

      if (!token) {
        throw new HttpException('Failed to create token', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return { token };
    } catch (error) {
      console.error('Error creating token:', error);
      
      // Handle MongoDB errors
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          throw new HttpException('A token with this ticker already exists', HttpStatus.BAD_REQUEST);
        }
        
        if (error instanceof HttpException) {
          throw error;
        }
        
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async searchTokens(@Query('q') searchTerm: string) {
    try {
      if (!searchTerm) {
        return {
          success: true,
          data: [],
          metadata: {
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            totalCount: 0
          }
        };
      }

      const collection = await this.tokenService.getCollection();
      const tokens = await collection.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { ticker: { $regex: searchTerm, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 }).toArray();

      return {
        success: true,
        data: tokens,
        metadata: {
          currentPage: 1,
          pageSize: tokens.length,
          totalPages: 1,
          totalCount: tokens.length
        }
      };
    } catch (error) {
      console.error('Error searching tokens:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to search tokens',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getTokens(
    @Query('address') address: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search: string
  ) {
    try {
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);

      console.log('Fetching tokens with params:', { address, page: pageNum, pageSize: pageSizeNum, search });

      const collection = await this.tokenService.getCollection();
      
      // First check if we have any tokens at all
      const totalCount = await collection.countDocuments();
      console.log('Total tokens in database:', totalCount);

      if (totalCount === 0) {
        return {
          data: [],
          metadata: {
            currentPage: 1,
            pageSize: pageSizeNum,
            totalPages: 0,
            totalCount: 0
          }
        };
      }

      if (address) {
        // Get token by address
        const token = await this.tokenService.findByAddress(address);
        console.log('Found token by address:', token ? 'yes' : 'no');
        
        if (!token) {
          throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
        }
        
        return { 
          data: token,
          metadata: {
            currentPage: 1,
            pageSize: 1,
            totalPages: 1,
            totalCount: 1
          }
        };
      }

      if (search) {
        // Search tokens by name or ticker
        const tokens = await collection.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { ticker: { $regex: search, $options: 'i' } }
          ]
        }).sort({ createdAt: -1 }).toArray();

        console.log('Found tokens by search:', tokens.length);

        return { 
          data: tokens,
          metadata: {
            currentPage: 1,
            pageSize: tokens.length,
            totalPages: 1,
            totalCount: tokens.length
          }
        };
      }

      // Get paginated tokens
      const skip = (pageNum - 1) * pageSizeNum;
      
      // Validate pagination
      if (skip >= totalCount) {
        return {
          data: [],
          metadata: {
            currentPage: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(totalCount / pageSizeNum),
            totalCount: totalCount
          }
        };
      }

      const tokens = await collection.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSizeNum)
        .toArray();

      console.log('Found paginated tokens:', tokens.length);

      return {
        data: tokens,
        metadata: {
          currentPage: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(totalCount / pageSizeNum),
          totalCount: totalCount
        }
      };
    } catch (error) {
      console.error('Error fetching tokens:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to fetch tokens',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 