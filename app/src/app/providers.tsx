'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '../wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { queryClient } from '@/lib/query';

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