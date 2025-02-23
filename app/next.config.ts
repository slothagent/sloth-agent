import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    PINATA_JWT: process.env.PINATA_JWT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FACTORY_ADDRESS: process.env.FACTORY_ADDRESS,
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    NEXT_PUBLIC_TWITTER_CLIENT_ID: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
    NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI,
    REDIRECT_URI: process.env.REDIRECT_URI,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN
  },
  reactStrictMode: true,
  experimental: {
    turbo: {}
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'olive-rational-giraffe-695.mypinata.cloud',
        pathname: '/ipfs/**'
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**'
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
