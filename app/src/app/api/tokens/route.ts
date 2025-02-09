import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    console.log('Connecting to MongoDB...'); // Debug log
    const client = await clientPromise;
    console.log('Connected successfully'); // Debug log
    
    const db = client.db("tokens_db");
    const data = await request.json();

    // Add creation timestamp
    const tokenData = {
      ...data,
      createdAt: new Date(),
      status: 'active'
    };

    const result = await db.collection('tokens').insertOne(tokenData);

    return NextResponse.json({ 
      success: true, 
      message: 'Token created successfully',
      tokenId: result.insertedId 
    });

  } catch (error) {
    console.error('Error creating token:', error);
    
    // More detailed error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create token',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 

export async function GET(request: Request) {
  const client = await clientPromise;
  const db = client.db("tokens_db");
  const tokens = await db.collection('tokens').find({}).toArray();
  return NextResponse.json(tokens);
}