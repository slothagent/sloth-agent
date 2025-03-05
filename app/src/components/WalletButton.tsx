'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/models/user';

const WalletButton = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [checkedAddresses, setCheckedAddresses] = useState<Set<string>>(new Set());

  const checkUserExists = async (address: string) => {
    if (!address || isChecking) return false;
    
    try {
      setIsChecking(true);
      setError(null);
      
      const response = await fetch(`/api/user/check?address=${address}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check user');
      }
      
      const data = await response.json();
      
      // Return the exists boolean from the response
      return data.exists;
    } catch (err) {
      console.error('Error checking user:', err);
      setError(err instanceof Error ? err : new Error('Failed to check user'));
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const registerUser = useCallback(async (address: string) => {
    // Skip if no address or if we've already checked this address
    if (!address || checkedAddresses.has(address)) {
      return;
    }
    
    // console.log('registerUser', address);
    
    try {
      // Add this address to our checked set to prevent duplicate checks
      setCheckedAddresses(prev => new Set(prev).add(address));
      
      // First check if user already exists
      const exists = await checkUserExists(address);
      if (exists) {
        // console.log('User already exists, skipping registration');
        return;
      }
      
      // User doesn't exist, proceed with registration
      setIsRegistering(true);
      setError(null);
      
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register user');
      }
      
      const data = await response.json();
      // console.log('User registered successfully:', data.message);
    } catch (err) {
      console.error('Error registering user:', err);
      setError(err instanceof Error ? err : new Error('Failed to register user'));
    } finally {
      setIsRegistering(false);
    }
  }, [checkedAddresses]);

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Error with user registration/check:', error);
    }
  }, [error]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        
        // Effect to register user when wallet is connected
        useEffect(() => {
          if (connected && account?.address) {
            registerUser(account.address);
          }
        }, [connected, account?.address, registerUser]);
        
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-[#2196F3] hover:bg-[#1E88E5] text-white h-10 px-6 transition-colors duration-200 text-sm"
                  >
                    Connect
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-4 flex items-center gap-2 border border-[#1F2937] text-sm"
                  >
                    {chain.hasIcon && (
                      <div className="w-4 h-4">
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-4 flex items-center gap-3 border border-[#1F2937] text-sm"
                  >
                    <span className="text-white">{account.displayName}</span>
                    <span className="text-gray-400">
                      {account.displayBalance}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletButton; 