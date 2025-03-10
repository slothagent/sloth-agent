import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { ancient8Sepolia } from 'wagmi/chains';

export const sonicBlazeTestnet = defineChain({
  id: 57054,
  name: 'Sonic Blaze Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Testnet Explorer',
      url: 'https://testnet.sonicscan.org',
    },
  },
  testnet: true,
})


export const config = getDefaultConfig({
  appName: 'Sloth Agent',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [sonicBlazeTestnet, ancient8Sepolia],
  ssr: true,
  transports: {
    [sonicBlazeTestnet.id]: http(),
    [ancient8Sepolia.id]: http(),
  }
}) 

export const configAncient8 = getDefaultConfig({
  appName: 'Sloth Agent',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [ancient8Sepolia],
  ssr: true,
  transports: {
    [ancient8Sepolia.id]: http(),
  }
}) 

export const configSonicBlaze = getDefaultConfig({
  appName: 'Sloth Agent',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [sonicBlazeTestnet],
  ssr: true,
  transports: {
    [sonicBlazeTestnet.id]: http(),
  }
}) 