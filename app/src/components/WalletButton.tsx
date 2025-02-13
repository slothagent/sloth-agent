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
                    className="bg-sloth-light hover:bg-sloth-light text-black px-4 py-2 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition-colors font-medium"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="flex w-[180px] text-center justify-center items-center gap-2 px-3 py-2 text-sm font-medium transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] bg-[#93E905]/10 rounded-lg hover:bg-[#93E905]/20"
                  >
                    {chain.hasIcon && (
                      <div className="w-5 h-5">
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={20}
                            height={20}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex w-[210px] text-center justify-center items-center gap-2 px-3 py-2 text-sm font-medium transition-all border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] bg-[#93E905]/10 rounded-lg hover:bg-[#93E905]/20"
                  >
                    {account.displayName}
                    <span className="px-2 text-xs font-medium text-black bg-white rounded-full">
                      {account.displayBalance
                        ? `${account.displayBalance}`
                        : ''}
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