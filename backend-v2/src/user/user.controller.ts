import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('check')
  async checkUser(@Query('address') address: string) {
    try {
      if (!address) {
        console.warn('User check attempt without address');
        throw new HttpException('Wallet address is required', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userService.getUserByAddress(address);
      
      return { 
        exists: !!user,
        user: user || null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error checking user: ${errorMessage}`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        error: 'Failed to check user',
        message: errorMessage
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async registerUser(@Body() body: { address: string }) {
    try {
      const { address } = body;

      // Validate address
      if (!address) {
        console.warn('User registration attempt without address');
        throw new HttpException('Wallet address is required', HttpStatus.BAD_REQUEST);
      }

      // First check if user already exists to avoid duplicate logs
      const existingUser = await this.userService.getUserByAddress(address);
      if (existingUser) {
        console.log(`User already exists for address: ${address}`);
        return { 
          success: true,
          user: existingUser,
          message: 'User already registered',
          isNew: false
        };
      }

      console.log(`Registering new user with address: ${address}`);
      
      // Register user if not already registered
      const user = await this.userService.registerUserIfNeeded(address);
      
      console.log(`User registration successful for address: ${address}`);
      
      return { 
        success: true,
        user,
        message: 'User registered successfully',
        isNew: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error registering user: ${errorMessage}`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException({
        success: false,
        error: 'Failed to register user',
        message: errorMessage
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 