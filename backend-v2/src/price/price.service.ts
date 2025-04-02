import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceService {
  async getTokenPrice(symbol: string): Promise<any> {
    try {
      let response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol.toUpperCase()}&tsyms=USD`);
      // console.log(response);
      if (!response.ok) {
        console.log(response.json())
        console.log('CryptoCompare API faile');
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data: {
          price: parseFloat(data.USD),
          symbol: symbol,
          timestamp: new Date().toISOString(),
          source: 'CryptoCompare'
        }
      };
    } catch (error) {
      console.error(`Error fetching ${symbol} price:`, error);
      return { 
        success: true, 
        data: {
          symbol: symbol,
          price: 2500,
          timestamp: new Date().toISOString(),
          source: 'fallback'
        },
        warning: 'Using fallback price data'
      };
    }
  }
  async getEthPrice(): Promise<any> {
    try {
      let response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
      
      if (!response.ok) {
        console.log('Binance API failed, trying CoinGecko API');
        response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        
        if (response.ok) {
          const geckoData = await response.json();
          return { 
            success: true, 
            data: {
              symbol: 'ETH',
              price: geckoData.ethereum.usd,
              timestamp: new Date().toISOString(),
              source: 'coingecko'
            }
          };
        }
        throw new Error('All API attempts failed');
      }
      
      const data = await response.json();
      return { 
        success: true, 
        data: {
          symbol: 'ETH',
          price: parseFloat(data.price),
          timestamp: new Date().toISOString(),
          source: 'binance'
        }
      };
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return { 
        success: true, 
        data: {
          symbol: 'ETH',
          price: 2500,
          timestamp: new Date().toISOString(),
          source: 'fallback'
        },
        warning: 'Using fallback price data'
      };
    }
  }

  async getSonicPrice(): Promise<any> {
    try {
      // Fetch Sonic price from Binance API
      // The symbol for Sonic on Binance is FTMUSDT (previously FTM, now Sonic)
      let response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=FTMUSDT');
      
      // If the first attempt fails, try alternative symbols
      if (!response.ok) {
        console.log('First attempt failed, trying alternative symbol SONICUSDT');
        response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SONICUSDT');
        
        // If both attempts fail, try to get the price from CoinGecko as a fallback
        if (!response.ok) {
          console.log('Second attempt failed, trying CoinGecko API');
          response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=fantom&vs_currencies=usd');
          
          if (response.ok) {
            const geckoData = await response.json();
            return { 
              success: true, 
              data: {
                symbol: 'SONIC',
                price: geckoData.fantom.usd,
                timestamp: new Date().toISOString(),
                source: 'coingecko'
              }
            };
          } else {
            throw new Error('All API attempts failed');
          }
        }
      }
      
      const data = await response.json();
      
      return { 
        success: true, 
        data: {
          symbol: 'SONIC', // Rename to SONIC for clarity in our app
          price: parseFloat(data.price),
          timestamp: new Date().toISOString(),
          source: 'binance'
        }
      };
    } catch (error) {
      console.error('Error fetching Sonic price:', error);
      
      // Last resort fallback - return a hardcoded price from Binance website
      // This is not ideal but prevents the UI from breaking completely
      return { 
        success: true, 
        data: {
          symbol: 'SONIC',
          price: 0.57709, // Hardcoded from the Binance website as last resort
          timestamp: new Date().toISOString(),
          source: 'fallback'
        },
        warning: 'Using fallback price data'
      };
    }
  }
} 