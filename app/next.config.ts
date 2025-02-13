import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
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
      }
    ]
  }
};

export default nextConfig;
