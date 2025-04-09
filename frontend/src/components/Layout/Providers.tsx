import { WagmiProvider } from 'wagmi';
import { config } from '../../config/wagmi';
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { queryClient } from '../../config/query';
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import '@mysten/dapp-kit/dist/index.css';
import { HederaWalletProvider } from '../../context/useWalletConnectHedera';

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider theme={darkTheme()} coolMode>
          <HederaWalletProvider>
            <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
              <WalletProvider
                stashedWallet={{
                  name: 'Sloth Agent',
                }}
            >
              {children}
              </WalletProvider>
            </SuiClientProvider>
          </HederaWalletProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}