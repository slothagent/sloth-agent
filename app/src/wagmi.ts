import { http } from 'wagmi';
import { ancient8Sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Sloth Agent',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [ancient8Sepolia],
  ssr: true,
  transports: {
    [ancient8Sepolia.id]: http(),
  }
}) 