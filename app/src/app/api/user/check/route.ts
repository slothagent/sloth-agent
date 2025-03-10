import { NextRequest, NextResponse } from 'next/server';
import { getUserByAddress } from '@/models/user';

export async function GET(req: NextRequest) {
  try {
    // Get address from query parameters
    const address = req.nextUrl.searchParams.get('address');

    // Validate address
    if (!address) {
      console.warn('User check attempt without address');
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByAddress(address);
    
    if (user) {
      console.log(`User found for address: ${address}`);
    } else {
      console.log(`No user found for address: ${address}`);
    }
    
    return NextResponse.json({ 
      exists: !!user,
      user: user || null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error checking user: ${errorMessage}`, error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check user',
        message: errorMessage
      },
      { status: 500 }
    );
  }
} 