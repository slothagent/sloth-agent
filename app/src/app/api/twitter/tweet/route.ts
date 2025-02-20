import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('twitter_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twitter API error:', data);
      return NextResponse.json({ error: 'Failed to post tweet' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json({ error: 'Failed to post tweet' }, { status: 500 });
  }
} 