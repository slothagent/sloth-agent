import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token refresh error:', tokenData);
      return NextResponse.json({ 
        error: tokenData.error_description || 'Failed to refresh token',
        code: 'REFRESH_FAILED'
      }, { status: tokenResponse.status });
    }

    // Calculate new expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    return NextResponse.json({
      success: true,
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: expiresAt.toISOString(),
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      }
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh token',
      code: 'REFRESH_ERROR'
    }, { status: 500 });
  }
} 