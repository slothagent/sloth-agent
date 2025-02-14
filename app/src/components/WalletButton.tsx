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
                    className="bg-[#8b7355] hover:bg-[#8b7355]/90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 border-2 border-[#8b7355]/20"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#8b7355] transition-all duration-200 border-2 border-[#8b7355]/20 rounded-lg hover:bg-[#8b7355]/10 bg-white/50 backdrop-blur-sm"
                  >
                    {chain.hasIcon && (
                      <div className="w-5 h-5 relative">
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#8b7355] transition-all duration-200 border-2 border-[#8b7355]/20 rounded-lg hover:bg-[#8b7355]/10 bg-white/50 backdrop-blur-sm"
                  >
                    {account.displayName}
                    {account.displayBalance && (
                      <span className="px-3 py-1 text-xs font-medium text-[#8b7355] bg-[#8b7355]/10 rounded-full border border-[#8b7355]/20">
                        {account.displayBalance}
                      </span>
                    )}
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