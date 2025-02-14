import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple in-memory cache
let userCache: {
  [key: string]: {
    data: any;
    timestamp: number;
  };
} = {};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Check cache first
    if (userCache[accessToken] && (Date.now() - userCache[accessToken].timestamp) < CACHE_TTL) {
      console.log('Returning cached user data');
      return NextResponse.json(userCache[accessToken].data);
    }

    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username,description,public_metrics', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const userData = await response.json();

    if (!response.ok) {
      console.error('Twitter API error:', userData);
      
      // Handle rate limit specifically
      if (response.status === 429) {
        // If we have cached data, return it even if expired
        if (userCache[accessToken]) {
          console.log('Rate limited, returning cached data');
          return NextResponse.json(userCache[accessToken].data);
        }
        return NextResponse.json({ 
          error: 'Twitter API rate limit exceeded. Please try again later.'
        }, { 
          status: 429 
        });
      }

      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: response.status });
    }

    // Cache the successful response
    userCache[accessToken] = {
      data: userData,
      timestamp: Date.now()
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
} 