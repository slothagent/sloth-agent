import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_REDIRECT_URI?.replace('/api/auth/callback/twitter', '') || '';
const REDIRECT_URI = `${BASE_URL}/api/auth/callback/twitter`;

export async function GET(request: Request) {
  console.log('Twitter callback endpoint hit');
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  
  
  // Get code verifier from cookies
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('code_verifier')?.value;
  
  console.log('Code verifier status:', {
    hasCodeVerifier: !!codeVerifier,
    cookies: cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
  });
  
  // Handle Twitter OAuth errors
  if (error) {
    console.error('Twitter OAuth error:', error, error_description);
    const redirectUrl = new URL('/', BASE_URL);
    redirectUrl.searchParams.set('error', error_description || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    console.error('No authorization code received in callback');
    const redirectUrl = new URL('/', BASE_URL);
    redirectUrl.searchParams.set('error', 'No authorization code received');
    return NextResponse.redirect(redirectUrl);
  }

  if (!codeVerifier) {
    console.error('No code verifier found in cookies');
    const redirectUrl = new URL('/', BASE_URL);
    redirectUrl.searchParams.set('error', 'Code verifier not found');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token response error:', {
        status: tokenResponse.status,
        data: tokenData,
        requestedRedirectUri: REDIRECT_URI
      });
      const redirectUrl = new URL('/', BASE_URL);
      redirectUrl.searchParams.set('error', tokenData.error_description || 'Failed to get access token');
      return NextResponse.redirect(redirectUrl);
    }

    // Clear the code verifier cookie
    cookieStore.delete('code_verifier');

    // Validate token data
    if (!tokenData.access_token) {
      console.error('Missing access token in response');
      const redirectUrl = new URL('/', BASE_URL);
      redirectUrl.searchParams.set('error', 'Invalid token data received');
      return NextResponse.redirect(redirectUrl);
    }

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Return token data directly
    const responseData = {
      success: true,
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: expiresAt.toISOString(),
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      }
    };
    
    // Return HTML that sends data to parent window and closes popup
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            const data = ${JSON.stringify(responseData)};
            if (window.opener) {
              window.opener.postMessage(data, "${BASE_URL}");
              window.close();
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    console.error('Twitter auth error:', error);
    const redirectUrl = new URL('/', BASE_URL);
    redirectUrl.searchParams.set('error', 'Authentication failed');
    return NextResponse.redirect(redirectUrl);
  }
} 