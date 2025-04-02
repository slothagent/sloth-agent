import { ConnectModal, useWallets } from '@mysten/dapp-kit';
import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import '../../styles/dapp-kit-theme.css';

const SuiWalletButton: React.FC = () => {
  const navigate = useNavigate();
  const wallets = useWallets();
  const currentWallet = wallets[0]; // Use the first connected wallet
  const currentAccount = currentWallet?.accounts[0]; // Use the first account
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDisconnect = () => {
    if (currentWallet?.features['standard:disconnect']) {
      currentWallet.features['standard:disconnect'].disconnect();
    }
  };

  const WalletContent = () => (
    <div className="relative group">
      <div className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-4 flex items-center gap-3 border border-[#1F2937] text-sm rounded-md cursor-pointer">
        <div className="flex items-center gap-2">
          <div className="flex flex-row gap-2 items-center">
            <span className="text-white font-medium">
              {currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}
            </span>
            <img src="/assets/chains/sui.png" alt="Sui" className='w-[20px] h-[20px]' />
          </div>
        </div>
      </div>

      <div className="absolute right-0 mt-2 w-48 bg-[#161B28] border border-[#1F2937] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className='flex flex-col gap-2 px-4 py-2'>
          <div className='flex items-start gap-2 flex-col'>
            <span className='text-gray-400'>Connected Wallet</span>
            <span className='text-white'>{currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}</span>  
          </div>
        </div>

        <div className="py-2">
          <button
            onClick={() => currentAccount && navigate({ to: `/profile/${currentAccount.address}` })}
            className="w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer"
          >
            <img src="/assets/icon/profile.svg" alt="Profile" className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer"
          >
            <img src="/assets/icon/arrow-right.svg" alt="Sign Out" className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const ConnectTrigger = (
    <button 
      className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-6 transition-colors duration-200 text-sm border border-[#1F2937] cursor-pointer rounded-md"
      onClick={() => setIsModalOpen(true)}
    >
      Connect Wallet
    </button>
  );

  return (
    <>
      {currentAccount ? (
        <WalletContent />
      ) : (
        <ConnectModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          trigger={ConnectTrigger}
        />
      )}
    </>
  );
};

export default SuiWalletButton; 