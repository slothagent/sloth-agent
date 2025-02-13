import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    PINATA_JWT: process.env.PINATA_JWT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
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
