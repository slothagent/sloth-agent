import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';
import { SessionTypes } from '@walletconnect/types';

interface HederaWalletContextType {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
}

const HederaWalletContext = createContext<HederaWalletContextType>({
  connect: async () => {},
  disconnect: async () => {},
  isConnected: false,
  accountId: null,
  network: null,
});

const metadata = {
  name: 'Sloth Agent',
  description: 'Sloth Agent DApp',
  url: window.location.origin,
  icons: [`${window.location.origin}/assets/logo/sloth.png`],
};

export const HederaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);

  // Safely access environment variables with fallbacks
    const projectId = import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID;

    // Log the project ID status
    if (!projectId) {
    console.warn("WalletConnect Project ID is missing or empty. Some wallet connection features may not work properly.");
    } 


  useEffect(() => {
    const initializeConnector = async () => {
      const connector = new DAppConnector(
        metadata,
        LedgerId.TESTNET, // Using testnet
        projectId || '', // Make sure to add this to your .env
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet], // Using testnet
      );

      await connector.init({ logger: 'error' });
      setDAppConnector(connector);

      // Restore session if exists
      const savedAccountId = localStorage.getItem('hederaAccountId');
      const savedNetwork = localStorage.getItem('hederaNetwork');
      if (savedAccountId && savedNetwork) {
        setAccountId(savedAccountId);
        setNetwork(savedNetwork);
        setIsConnected(true);
      }
    };

    initializeConnector();
  }, []);

  const handleNewSession = (newSession: SessionTypes.Struct) => {
    const sessionAccount = newSession.namespaces?.hedera?.accounts?.[0];
    const sessionParts = sessionAccount?.split(':');
    const newAccountId = sessionParts?.pop() || null;
    const newNetwork = sessionParts?.pop() || null;

    if (newAccountId) {
      localStorage.setItem('hederaAccountId', newAccountId);
      localStorage.setItem('hederaNetwork', newNetwork || '');
      setAccountId(newAccountId);
      setNetwork(newNetwork);
      setIsConnected(true);
      setSession(newSession);
    }
  };

  const connect = async () => {
    if (!dAppConnector) return;
    try {
      const newSession = await dAppConnector.openModal();
      handleNewSession(newSession);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const disconnect = async () => {
    if (!dAppConnector || !session) return;
    try {
      await dAppConnector.disconnect(session.topic);
      localStorage.removeItem('hederaAccountId');
      localStorage.removeItem('hederaNetwork');
      setAccountId(null);
      setNetwork(null);
      setIsConnected(false);
      setSession(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <HederaWalletContext.Provider
      value={{
        connect,
        disconnect,
        isConnected,
        accountId,
        network,
      }}
    >
      {children}
    </HederaWalletContext.Provider>
  );
};

export const useHederaWallet = () => {
  const context = useContext(HederaWalletContext);
  return context;
};
