import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=S', {
            headers: {
                'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || '',
            },
        });

        const data = await response.json();
        
        if (data.data?.S?.quote?.USD?.price) {
            return NextResponse.json({ price: data.data.S.quote.USD.price });
        } else {
            // Fallback price if API doesn't return expected data
            return NextResponse.json({ price: 0.845955 });
        }
    } catch (error) {
        console.error('Error fetching Sonic price:', error);
        // Fallback price if API fails
        return NextResponse.json({ price: 0.845955 });
    }
} 