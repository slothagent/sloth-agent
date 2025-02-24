import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'


export const sonicBlazeTestnet = /*#__PURE__*/ defineChain({
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
  chains: [sonicBlazeTestnet],
  ssr: true,
  transports: {
    [sonicBlazeTestnet.id]: http(),
  }
}) 