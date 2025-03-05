import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Fetch ETH price from Binance API
    let response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
    
    // If the first attempt fails, try CoinGecko as a fallback
    if (!response.ok) {
      console.log('Binance API failed, trying CoinGecko API');
      response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      
      if (response.ok) {
        const geckoData = await response.json();
        return NextResponse.json({ 
          success: true, 
          data: {
            symbol: 'ETH',
            price: geckoData.ethereum.usd,
            timestamp: new Date().toISOString(),
            source: 'coingecko'
          }
        });
      } else {
        throw new Error('All API attempts failed');
      }
    }
    
    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      data: {
        symbol: 'ETH',
        price: parseFloat(data.price),
        timestamp: new Date().toISOString(),
        source: 'binance'
      }
    });
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    
    // Last resort fallback - return a hardcoded price
    return NextResponse.json({ 
      success: true, 
      data: {
        symbol: 'ETH',
        price: 2500, // Fallback to the original hardcoded value
        timestamp: new Date().toISOString(),
        source: 'fallback'
      },
      warning: 'Using fallback price data'
    });
  }
} 