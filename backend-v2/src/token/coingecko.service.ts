import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CoinGeckoToken } from './interfaces/coingecko.interface';

@Injectable()
export class CoinGeckoService {
  private readonly API_URL = 'https://api.coingecko.com/api/v3';

  constructor() {}

  async searchTokens(query: string): Promise<CoinGeckoToken[]> {
    try {
      console.log('CoinGecko: Searching for tokens with query:', query);
      
      // Search for coins
      const searchResponse = await axios.get(`${this.API_URL}/search`, {
        params: {
          query: query
        }
      });

      // Get the first 10 results and map them directly to our simplified format
      const tokens = searchResponse.data.coins
        .slice(0, 10)
        .map(coin => ({
          id: coin.id,
          ticker: coin.symbol,
          name: coin.name,
          imageUrl: coin.large,
          market_data: {
            current_price: {
              usd: 0 // We'll update this with a single API call
            }
          }
        }));

      // If we have any tokens, get their current prices in a single API call
      if (tokens.length > 0) {
        try {
          const ids = tokens.map(token => token.id).join(',');
          const priceResponse = await axios.get(`${this.API_URL}/simple/price`, {
            params: {
              ids: ids,
              vs_currencies: 'usd'
            }
          });

          // Update prices for each token
          tokens.forEach(token => {
            token.market_data.current_price.usd = priceResponse.data[token.id]?.usd || 0;
          });
        } catch (error) {
          console.error('CoinGecko: Error fetching prices:', error);
          // Continue with zero prices if price fetch fails
        }
      }

      console.log('CoinGecko: Successfully fetched', tokens.length, 'tokens');
      return tokens;
      
    } catch (error) {
      console.error('CoinGecko: Error in searchTokens:', error);
      return [];
    }
  }
} 