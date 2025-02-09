import { type Connector } from 'wagmi';

export const SUPPORTED_WALLETS = [
  {
    id: 'io.metamask',
    name: 'MetaMask',
    image: '/assets/wallets/metamask.png',
  },
  {
    id: 'com.coinbase.wallet',
    name: 'Coinbase Wallet',
    image: '/assets/wallets/coinbase.png',
  },
  {
    id: 'walletConnect',
    name: 'WalletConnect',
    image: '/assets/wallets/walletconnect.png',
  },
] as const; 