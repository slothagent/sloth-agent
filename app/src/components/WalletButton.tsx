'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

const WalletButton = () => {
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