import { NextResponse } from 'next/server';
import { TweetModel } from '@/models/tweets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const tweets = await TweetModel.findByAgentId(agentId);

    return NextResponse.json({
      success: true,
      data: tweets,
    });
  } catch (error) {
    console.error('Error getting tweets:', error);
    return NextResponse.json(
      { error: 'Failed to get tweets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // First get the user's ID
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers,
      cache: 'no-store',
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Twitter API error:', userData);
      // Return a more specific error message for auth issues
      if (userResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Twitter authentication failed. Please reconnect your Twitter account.',
          code: 'TWITTER_AUTH_FAILED'
        }, { status: 401 });
      }
      return NextResponse.json({ error: userData.detail || 'Failed to fetch user data' }, { status: userResponse.status });
    }

    // Then fetch user's tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userData.data.id}/tweets?tweet.fields=created_at,public_metrics&max_results=10`, 
      {
        headers,
        cache: 'no-store',
      }
    );

    const tweetsData = await tweetsResponse.json();

    if (!tweetsResponse.ok) {
      console.error('Twitter API error:', tweetsData);
      if (tweetsResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Twitter authentication failed. Please reconnect your Twitter account.',
          code: 'TWITTER_AUTH_FAILED'
        }, { status: 401 });
      }
      return NextResponse.json({ error: tweetsData.detail || 'Failed to fetch tweets' }, { status: tweetsResponse.status });
    }

    return NextResponse.json(tweetsData);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred while fetching tweets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 