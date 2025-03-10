import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { queryClient } from '@/config/query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme()}
          coolMode
        >
          {children}
        </RainbowKitProvider> 
      </QueryClientProvider>
    </WagmiProvider>
  );
}