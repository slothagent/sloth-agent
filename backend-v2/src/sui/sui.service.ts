import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SuiService {
  private readonly rpcUrl = 'https://fullnode.mainnet.sui.io:443';

  private async makeRpcRequest(method: string, params: any[] = []) {
    try {
      console.log(`Making RPC request: ${method}`, params);
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    //   console.log('RPC response:', response.data);
      return response.data.result;
    } catch (error) {
      console.error('RPC error:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        throw new HttpException(
          error.response.data.error.message || 'Failed to fetch data from Sui RPC',
          error.response.status || 500
        );
      }
      throw new HttpException(
        'Failed to fetch data from Sui RPC',
        500
      );
    }
  }

  async getAllBalances(owner: string) {
    return this.makeRpcRequest('suix_getAllBalances', [owner]);
  }

  async getAllCoins(owner: string, cursor?: string, limit?: number) {
    return this.makeRpcRequest('suix_getAllCoins', [owner, cursor, limit]);
  }

  async getBalance(owner: string, coinType: string) {
    try {
      // Format coinType if it's 'sui' to use the full path
      const formattedCoinType = coinType.toLowerCase() === 'sui' ? '0x2::sui::SUI' : coinType;
      
      console.log(`Getting balance for owner: ${owner}, coinType: ${formattedCoinType}`);
      
      const result = await this.makeRpcRequest('suix_getBalance', [owner, formattedCoinType]);
      
      if (!result) {
        return {
          totalBalance: '0',
          coinObjectCount: 0
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error getting balance:', error);
      if (error.response?.data?.error?.message === 'Invalid params') {
        throw new HttpException(`Invalid parameters - owner: ${owner}, coinType: ${coinType}`, 400);
      }
      throw error;
    }
  }

  async getCoinMetadata(coinType: string) {
    try {
      // Log the exact method and parameters being used
      const method = 'suix_getCoinMetadata';
      const params = [decodeURIComponent(coinType).trim()];
      
        console.log(`Calling ${method} with params:`, params);
      
      const result = await this.makeRpcRequest(method, params);
      
      if (!result) {
        throw new HttpException('Coin metadata not found', 404);
      }
      
      return result;
    } catch (error) {
      console.error('Error getting coin metadata:', error);
      if (error.response?.data?.error?.message === 'Invalid params') {
        throw new HttpException(`Invalid coin type format: ${coinType}`, 400);
      }
      throw error;
    }
  }

  async getCoins(owner: string, coinType: string, cursor?: string, limit?: number) {
    return this.makeRpcRequest('suix_getCoins', [owner, coinType, cursor, limit]);
  }

  async getTotalSupply(coinType: string) {
    return this.makeRpcRequest('suix_getTotalSupply', [coinType]);
  }

  async getStakes(owner: string) {
    try {
      const method = 'suix_getStakes';
      const params = [owner.trim()];
      
      console.log(`Calling ${method} with params:`, params);
      
      const result = await this.makeRpcRequest(method, params);
      
      if (!result) {
        throw new HttpException('No staking information found', 404);
      }
      
      return result;
    } catch (error) {
      console.error('Error getting stakes:', error);
      if (error.response?.data?.error?.message === 'Invalid params') {
        throw new HttpException(`Invalid address format: ${owner}`, 400);
      }
      throw error;
    }
  }

  async getValidatorsApy() {
    try {
      const method = 'suix_getValidatorsApy';
      console.log(`Calling ${method}`);
      
      const result = await this.makeRpcRequest(method, []);
      
      if (!result) {
        throw new HttpException('No validator APY information found', 404);
      }
      
      return {
        apys: result.apys,
        epoch: result.epoch
      };
    } catch (error) {
      console.error('Error getting validator APYs:', error);
      throw error;
    }
  }

  // Helper method to get all coins for an owner with pagination
  async getCoinsWithPagination(
    owner: string,
    page: number = 0,
    size: number = 20,
  ) {
    const cursor = page > 0 ? String(page * size) : null;
    return this.getAllCoins(owner, cursor, size);
  }

  // Helper method to get coin balance with proper error handling
  async getCoinBalance(owner: string, coinType: string = '0x2::sui::SUI') {
    try {
      const balance = await this.getBalance(owner, coinType);
      return {
        coinType,
        balance: balance.totalBalance,
        coinObjectCount: balance.coinObjectCount
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          coinType,
          balance: '0',
          coinObjectCount: 0
        };
      }
      throw error;
    }
  }
} 