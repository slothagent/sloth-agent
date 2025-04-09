import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionService, Transaction } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() body: any) {
    try {
      const { tokenAddress, userAddress, amountToken, amount,transactionType, transactionHash,network,price } = body;

      if (!tokenAddress || !userAddress || !amountToken || !transactionType || !transactionHash) {
        throw new HttpException("Missing required fields", HttpStatus.BAD_REQUEST);
      }

      const result = await this.transactionService.createTransaction({
        from: tokenAddress,
        to: userAddress,
        amountToken,
        amount,
        transactionType,
        transactionHash,
        timestamp: new Date(),
        network,
        price
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("Error creating transaction:", error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async searchTransactions(@Query('q') searchTerm: string) {
    try {
      if (!searchTerm) {
        return { success: true, data: [], metadata: { totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0 } };
      }

      const searchResults = await this.transactionService.searchTransactions({
        query: searchTerm,
        page: 1,
        limit: 10
      });

      return { success: true, ...searchResults };
    } catch (error) {
      console.error("Error searching transactions:", error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getTransactions(
    @Query('tokenAddress') tokenAddress: string,
    @Query('timeRange') timeRange: string,
    @Query('latest') latest: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('totalVolume') totalVolume: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('transactionHash') transactionHash?: string
  ) {
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (totalVolume) {
        const allTransactions = await this.transactionService.calculateTotalVolume(timeRange || undefined);
        return { success: true, data: allTransactions };
      }
      
      // Check if search parameters are provided
      if (from || to || transactionHash) {
        const searchResults = await this.transactionService.searchTransactions({
          from,
          to,
          transactionHash,
          page: pageNum,
          limit: limitNum
        });
        return { success: true, ...searchResults };
      }

      // If no specific filters are provided, return paginated transactions
      if (!tokenAddress && !timeRange && !latest) {
        const paginatedResult = await this.transactionService.getPaginatedTransactions(pageNum, limitNum);
        return { success: true, ...paginatedResult };
      }

      // Handle existing specific queries
      if (!tokenAddress) {
        throw new HttpException("Token address is required", HttpStatus.BAD_REQUEST);
      }

      if (latest === "true") {
        const latestTransaction = await this.transactionService.getLatestTransaction(tokenAddress);
        return { success: true, data: latestTransaction };
      }

      const transactions = await this.transactionService.getTransactionHistory(tokenAddress, timeRange || undefined);
      return { success: true, data: transactions };
    } catch (error) {
      console.error("Error getting transactions:", error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 