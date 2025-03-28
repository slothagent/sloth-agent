import { ConnectButton } from '@rainbow-me/rainbowkit';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { a8TokenAbi } from '../../abi/a8TokenAbi';
import { configAncient8 } from '../../config/wagmi';
import { useReadContract } from 'wagmi';

const WalletButton: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [checkedAddresses, setCheckedAddresses] = useState<Set<string>>(new Set());
  const navigate = useNavigate();


  const checkUserExists = async (address: string) => {
    if (!address || isChecking) return false;
    
    try {
      setIsChecking(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/user/check?address=${address}`);
      
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
      
      setIsRegistering(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/user/register`, {
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
      
      await response.json();
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
        
        const { data: a8Balance } = useReadContract({
          address: chain?.id == 28122024 ? process.env.PUBLIC_A8_TOKEN_ADDRESS as `0x${string}` : undefined,
          abi: a8TokenAbi,
          functionName: 'balanceOf',
          args: [account?.address as `0x${string}`],
          config: configAncient8
        });

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
                    className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-6 transition-colors duration-200 text-sm border border-[#1F2937]"
                  >
                    Connect
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-4 flex items-center gap-2 border border-[#1F2937] text-sm rounded-md cursor-pointer"
                  >
                    {chain.hasIcon && (
                      <div className="w-4 h-4">
                        {chain.iconUrl && (
                          <img
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

                  <div className="relative group">
                    <div
                      className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-4 flex items-center gap-3 border border-[#1F2937] text-sm rounded-md cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-row gap-2 items-center">
                          <span className="text-white font-medium">{account.displayName}</span>
                          <span className='text-gray-400'>{chain?.id == 57054 ? Number(account.balanceFormatted).toFixed(2) : (Number(a8Balance)/10**18).toFixed(2)}</span>
                          <img src={chain?.id == 57054 ? "https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" : "/assets/chains/a8.png"} alt="chain" className='w-[20px] h-[20px]' />
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-0 mt-2 w-48 bg-[#161B28] border border-[#1F2937] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className='flex flex-col gap-2 px-4 py-2'>
                        <div className='flex items-start gap-2 flex-col'>
                          <span className='text-gray-400'>Connected Wallet</span>
                          <span className='text-white'>{account.displayName}</span>  
                        </div>
                      </div>


                      <div className="py-2">
                        <button
                          onClick={()=>navigate({to:`/profile/${account.address}`})}
                          className="w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer"
                        >
                          <img src="/assets/icon/profile.svg" alt="Profile" className="w-4 h-4" />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            // Handle sign out logic here if needed
                            openAccountModal();
                          }}
                          className="w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer"
                        >
                          <img src="/assets/icon/arrow-right.svg" alt="Sign Out" className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
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