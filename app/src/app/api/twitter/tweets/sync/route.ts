import { NextResponse } from 'next/server';
import { TwitterAuthModel } from '@/models/twitterAuth';
import { TweetModel } from '@/models/tweets';

const TWITTER_API_URL = 'https://api.twitter.com/2';

async function refreshTwitterToken(refreshToken: string) {
  try {
    const response = await fetch(`${TWITTER_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

async function fetchTweets(accessToken: string) {
  try {
    // First get the user's ID
    const userResponse = await fetch(`${TWITTER_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to get user:', errorText);
      if (userResponse.status === 401) {
        throw new Error('TWITTER_AUTH_FAILED');
      }
      throw new Error('Failed to get user information');
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Then fetch user's tweets
    const tweetsResponse = await fetch(
      `${TWITTER_API_URL}/users/${userId}/tweets?tweet.fields=created_at,public_metrics&max_results=10`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      console.error('Failed to fetch tweets:', errorText);
      if (tweetsResponse.status === 401) {
        throw new Error('TWITTER_AUTH_FAILED');
      }
      throw new Error('Failed to fetch tweets');
    }

    const tweetsData = await tweetsResponse.json();
    return tweetsData.data || [];
  } catch (error) {
    console.error('Error in fetchTweets:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Get Twitter auth data for the agent
    const twitterAuth = await TwitterAuthModel.findByAgentId(agentId);
    if (!twitterAuth) {
      return NextResponse.json(
        { error: 'Twitter authentication not found' },
        { status: 404 }
      );
    }

    let accessToken = twitterAuth.accessToken;
    
    // Check if token is expired
    if (new Date() >= new Date(twitterAuth.expiresAt)) {
      if (!twitterAuth.refreshToken) {
        return NextResponse.json(
          { error: 'Twitter token expired and no refresh token available' },
          { status: 401 }
        );
      }

      // Refresh the token
      try {
        const newTokens = await refreshTwitterToken(twitterAuth.refreshToken);
        
        // Update tokens in database
        await TwitterAuthModel.update(agentId, {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt,
        });

        accessToken = newTokens.accessToken;
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to refresh Twitter token' },
          { status: 401 }
        );
      }
    }

    try {
      // Fetch tweets using the valid access token
      const tweets = await fetchTweets(accessToken);

      // Delete existing tweets for this agent
      await TweetModel.deleteByAgentId(agentId);

      // Save new tweets to database
      if (tweets.length > 0) {
        const tweetsToSave = tweets.map((tweet: any) => ({
          agentId,
          tweetId: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id,
          tweetCreatedAt: new Date(tweet.created_at),
          metrics: {
            retweets: tweet.public_metrics?.retweet_count || 0,
            replies: tweet.public_metrics?.reply_count || 0,
            likes: tweet.public_metrics?.like_count || 0,
            views: tweet.public_metrics?.impression_count || 0,
          },
        }));

        await TweetModel.bulkCreate(tweetsToSave);
      }

      return NextResponse.json({
        success: true,
        data: tweets,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'TWITTER_AUTH_FAILED') {
        return NextResponse.json(
          { 
            error: 'Twitter authentication failed',
            code: 'TWITTER_AUTH_FAILED'
          },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error syncing tweets:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync tweets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 