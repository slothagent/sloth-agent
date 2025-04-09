import React, { useState } from 'react';
import { useHederaWallet } from '../../context/useWalletConnectHedera';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';

const HederaWalletButton: React.FC = () => {
  const { connect, disconnect, isConnected, accountId } = useHederaWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isConnected) {
      setIsModalOpen(!isModalOpen);
    } else {
      connect();
    }
  };

  return (
    <div className="relative group">
      <Button
        onClick={handleButtonClick}
        className="bg-[#161B28] hover:bg-[#1C2333] text-white h-10 px-4 cursor-pointer"
      >
        {isConnected ? `${accountId?.slice(0, 6)}...${accountId?.slice(-4)}` : 'Connect Wallet'}
      </Button>

      {isConnected && isModalOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#161B28] border border-[#1F2937] rounded-md shadow-lg">
          <div className='flex flex-col gap-2 px-4 py-2'>
            <div className='flex items-start gap-2 flex-col'>
              <span className='text-gray-400'>Connected Wallet</span>
              <span className='text-white'>{accountId}</span>  
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => navigate({ to: `/profile/${accountId}` })}
              className="w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer"
            >
              <img src="/assets/icon/profile.svg" alt="Profile" className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => {
                disconnect();
                setIsModalOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer"
            >
              <img src="/assets/icon/arrow-right.svg" alt="Sign Out" className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HederaWalletButton; 