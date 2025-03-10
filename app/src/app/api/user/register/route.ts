import { NextRequest, NextResponse } from 'next/server';
import { registerUserIfNeeded, getUserByAddress } from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { address } = body;

    // Validate address
    if (!address) {
      console.warn('User registration attempt without address');
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // First check if user already exists to avoid duplicate logs
    const existingUser = await getUserByAddress(address);
    if (existingUser) {
      console.log(`User already exists for address: ${address}`);
      return NextResponse.json({ 
        success: true,
        user: existingUser,
        message: 'User already registered',
        isNew: false
      });
    }

    console.log(`Registering new user with address: ${address}`);
    
    // Register user if not already registered
    const user = await registerUserIfNeeded(address);
    
    console.log(`User registration successful for address: ${address}`);
    
    return NextResponse.json({ 
      success: true,
      user,
      message: 'User registered successfully',
      isNew: true
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error registering user: ${errorMessage}`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to register user',
        message: errorMessage
      },
      { status: 500 }
    );
  }
} 