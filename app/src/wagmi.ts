import { http } from '@wagmi/core'
import { ancient8Sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Memetrade Co.',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [ancient8Sepolia],
  ssr: true,
  transports: {
    [ancient8Sepolia.id]: http(),
  }
}) 