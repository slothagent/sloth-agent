import { Router, RequestHandler } from 'express';
import { settings } from '@elizaos/core';

interface TwitterAuthRequest {
  username: string;
  password: string;
  email: string;
  cookies?: string;
}

const router: Router = Router();

const getConfig: RequestHandler = (req, res) => {
  const twitterConfig = {
    username: settings.TWITTER_USERNAME,
    email: settings.TWITTER_EMAIL,
    cookies: settings.TWITTER_COOKIES,
    dryRun: settings.TWITTER_DRY_RUN === 'true'
  };
  
  // Remove sensitive data
  const sanitizedConfig = {
    ...twitterConfig,
    password: undefined,
    cookies: twitterConfig.cookies ? '[REDACTED]' : undefined
  };

  res.json(sanitizedConfig);
};

const updateAuth: RequestHandler<{}, {}, TwitterAuthRequest> = (req, res) => {
  const { username, password, email, cookies } = req.body;

  // Validate required fields
  if (!username || !password || !email) {
    res.status(400).json({ 
      error: 'Missing required fields: username, password, and email are required' 
    });
    return;
  }

  try {
    // Store in environment variables
    process.env.TWITTER_USERNAME = username;
    process.env.TWITTER_PASSWORD = password;
    process.env.TWITTER_EMAIL = email;
    if (cookies) {
      process.env.TWITTER_COOKIES = cookies;
    }

    res.json({ 
      message: 'Twitter credentials updated successfully',
      username: username,
      email: email
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update Twitter credentials',
      details: error.message 
    });
  }
};

router.get('/twitter/config', getConfig);
router.post('/twitter/auth', updateAuth);

export default router; 