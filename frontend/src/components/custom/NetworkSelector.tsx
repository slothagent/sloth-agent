import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSwitchChain } from 'wagmi';

export type Network = 'ancient8' | 'sonic' | 'sui' | 'hedera';

interface NetworkSelectorProps {
  selectedNetwork: Network;
  onNetworkChange: (network: Network) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ selectedNetwork, onNetworkChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { switchChain } = useSwitchChain();

  const networks = [
    { 
      id: 'ancient8', 
      name: 'Ancient8', 
      icon: '/assets/chains/a8.png',
      chainId: 28122024 // Ancient8 testnet chain ID
    },
    { 
      id: 'sonic', 
      name: 'Sonic', 
      icon: "https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0",
      chainId: 57054 // Sonic testnet chain ID
    },
    { 
      id: 'sui', 
      name: 'Sui Network', 
      icon: '/assets/chains/sui.png' 
    },
    {
      id: 'hedera',
      name: 'Hedera Testnet',
      icon: '/assets/chains/hedera.jpg',
    }
  ];

  const handleNetworkChange = async (network: Network) => {
    try {
      const selectedNetworkData = networks.find(n => n.id === network);
      
      if ((network === 'ancient8' || network === 'sonic') && selectedNetworkData?.chainId) {
        await switchChain({ chainId: Number(selectedNetworkData.chainId) });
      }
      
      onNetworkChange(network);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#161B28] hover:bg-[#1C2333] text-gray-400 h-10 px-4 flex items-center gap-2 transition-colors duration-200 text-sm border border-[#1F2937] rounded-md cursor-pointer"
      >
        <img 
          src={networks.find(n => n.id === selectedNetwork)?.icon} 
          alt={selectedNetwork}
          className="w-5 h-5"
        />
        <span className="text-white">
          {networks.find(n => n.id === selectedNetwork)?.name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-48 mt-2 bg-[#161B28] border border-[#1F2937] rounded-md shadow-lg">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => handleNetworkChange(network.id as Network)}
              className={`w-full px-4 py-2 text-sm text-white hover:bg-[#1C2333] flex items-center gap-2 cursor-pointer ${
                selectedNetwork === network.id ? 'bg-[#1C2333]' : ''
              }`}
            >
              <img src={network.icon} alt={network.name} className="w-5 h-5" />
              {network.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector; 