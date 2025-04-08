import WalletButton from "../custom/WalletButton";
import { Search, Menu, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import SearchDialog from "../custom/SearchDialog";
import { OmniModal } from "../custom/OmniModal";
import SuiWalletButton from "../custom/SuiWalletButton";
import HederaWalletButton from "../custom/HederaWalletButton";
import NetworkSelector, { Network } from "../custom/NetworkSelector";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOmniModalOpen, setIsOmniModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('ancient8');
  const navigate = useNavigate();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd/Ctrl + K is pressed
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // Prevent default browser behavior
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderWalletButton = () => {
    switch (selectedNetwork) {
      case 'sui':
        return <SuiWalletButton />;
      case 'hedera':
        return <HederaWalletButton />;
      default:
        return <WalletButton />;
    }
  };

  return (
    <>
      <header className="sticky w-full top-0 left-0 right-0 z-50 bg-[#0B0E17] border-b border-[#1F2937]">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo - Responsive */}
            <div onClick={()=>navigate({to:'/'})} className="flex items-center gap-2 min-w-fit cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                <img
                  src="/assets/logo/sloth.png"
                  alt="Sloth AI Logo"
                  className="object-contain"
                />
              </div>
              <span className="text-white font-bold text-lg sm:text-2xl">SLOTH AGENT</span>
            </div>
            
            {/* Right side group */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  className="w-full pl-8 pr-2 py-1 h-10 bg-[#161B28] border-none text-white rounded text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none cursor-pointer"
                  placeholder="Search...(⌘ K)"
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
              </div>
              <NetworkSelector 
                selectedNetwork={selectedNetwork}
                onNetworkChange={setSelectedNetwork}
              />
              <button 
                onClick={() => setIsOmniModalOpen(true)}
                className="bg-[#161B28] h-10 px-3 flex justify-center items-center hover:bg-[#2D333B] transition-colors cursor-pointer"
              >
                <span className="text-white text-sm">Omni Agent</span>
              </button>
              {renderWalletButton()}
            </div>

            <Button
              variant="ghost"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-400" />
              ) : (
                <Menu className="h-6 w-6 text-gray-400" />
              )}
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden w-full py-4 space-y-4 border-t border-[#1F2937]">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  className="w-full pl-12 pr-4 py-2 h-10 bg-[#161B28] border-none text-white placeholder-gray-400 rounded text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none cursor-pointer"
                  placeholder="Search for user address, token, transaction..."
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
              </div>
              <div className="flex gap-2 w-full">
                <div className="w-full">
                  <button
                    onClick={() => setIsOmniModalOpen(true)}
                    className="flex-1 bg-[#161B28] w-full h-10 p-2 flex justify-center items-center"
                  >
                    <span className="text-white text-sm">Omni</span>
                  </button>
                </div>
              </div>
              {/* Mobile Wallet Button */}
              <div className="flex justify-center">
                {renderWalletButton()}
              </div>
            </div>
          )}
        </div>
        <SearchDialog 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </header>
      
      {/* Omni Modal */}
      <OmniModal 
        isOpen={isOmniModalOpen}
        onClose={() => setIsOmniModalOpen(false)}
      />
    </>
  );
};

export default Header;