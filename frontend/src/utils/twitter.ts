import { generateCodeVerifier, generateCodeChallenge } from './oauth';

const BASE_URL = process.env.PUBLIC_REDIRECT_URI?.replace('/api/auth/callback/twitter', '') || '';

export const initiateTwitterAuth = async () => {
  try {
    console.log('Starting Twitter authentication...');
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier in localStorage and cookie for the backend
    localStorage.setItem('code_verifier', codeVerifier);
    document.cookie = `code_verifier=${codeVerifier}; path=/; max-age=3600; SameSite=None; Secure`;

    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.PUBLIC_TWITTER_CLIENT_ID!);
    authUrl.searchParams.append('redirect_uri', `${BASE_URL}/api/auth/callback/twitter`);
    authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', crypto.randomUUID());

    // Calculate popup position
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Open Twitter auth in a popup with centered position
    const popup = window.open(
      authUrl.toString(),
      'Twitter Auth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes,resizable=yes`
    );

    if (!popup) {
      throw new Error('Popup blocked. Please enable popups for this site and try again.');
    }

    // Try to focus the popup
    popup.focus();

    // Return a promise that resolves with the token data
    return new Promise((resolve, reject) => {
      let popupClosed = false;
      let authCompleted = false;

      // Function to check if popup is accessible
      const isPopupAccessible = () => {
        try {
          return !popup?.closed;
        } catch {
          return false;
        }
      };

      window.addEventListener('message', function handleMessage(event) {

        // Ignore messages that are not from our expected origin
        if (event.origin !== BASE_URL) {
          console.warn('Received message from unexpected origin:', event.origin);
          return;
        }

        // Ignore messages that are not from Twitter auth
        if (!event.data || typeof event.data !== 'object' || event.data.target === 'metamask-inpage') {
          console.log('Ignoring non-Twitter message:', event.data);
          return;
        }
        
        // Mark auth as completed to prevent duplicate processing
        if (authCompleted) {
          console.log('Auth already completed, ignoring message');
          return;
        }

        authCompleted = true;
        window.removeEventListener('message', handleMessage);
        
        if (popupClosed) {
          console.log('Popup was already closed, ignoring message');
          return;
        }

        // Close popup after successful auth
        try {
          popup?.close();
        } catch (e) {
          console.warn('Error closing popup:', e);
        }

        if (event.data.success) {
          resolve(event.data.data);
        } else {
          const errorMessage = event.data.error || 'Authentication failed';
          reject(new Error(errorMessage));
        }
      });

      // Handle popup closed
      const checkClosed = setInterval(() => {
        if (!isPopupAccessible()) {
          console.log('Popup was closed by user');
          clearInterval(checkClosed);
          if (!authCompleted) {
            popupClosed = true;
            reject(new Error('Please complete the Twitter authentication process. Do not close the popup window.'));
          }
        }
      }, 1000);

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!authCompleted) {
          console.log('Authentication timed out after 5 minutes');
          try {
            popup?.close();
          } catch (e) {
            console.warn('Error closing popup:', e);
          }
          reject(new Error('Authentication timed out. Please try again.'));
        }
      }, 5 * 60 * 1000);
    });

  } catch (error) {
    console.error('Error initiating Twitter auth:', error);
    throw error;
  }
}; 