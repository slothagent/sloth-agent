import WalletButton from "../custom/WalletButton";
import { Search, Menu, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Link, useNavigate } from "@tanstack/react-router";
import SearchDialog from "../custom/SearchDialog";


const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isConnected } = useAccount();
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

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0B0E17] border-b border-[#1F2937]">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo - Responsive */}
          <div onClick={()=>navigate({to:'/'})} className="flex items-center gap-2 min-w-fit">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <img
                src="/assets/logo/sloth.png"
                alt="Sloth AI Logo"
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-lg sm:text-2xl">SLOTH AGENT</span>
          </div>
          
          <div className="hidden md:block flex-1 max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="w-full pl-12 pr-4 py-2 h-10 bg-[#161B28] border-none text-white rounded text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none cursor-pointer"
                placeholder="Search for user address, token, transaction... (⌘ K)"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
            </div>
          </div>
          {isConnected && (
            <Link to="/agent" className="hidden md:block">
              <div className="bg-[#161B28] h-10 p-2 flex justify-center items-center">
                <span className="text-white text-sm">My Agent</span>
              </div>
            </Link>
          )}
          {isConnected && (
            <Link to="/omni" className="hidden md:block">
              <div className="bg-[#161B28] h-10 p-2 flex justify-center items-center">
                <span className="text-white text-sm">Omni</span>
              </div>
            </Link>
          )}
          
          <div className="hidden md:block">
            <WalletButton />
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
          <div className="md:hidden py-4 space-y-4 border-t border-[#1F2937]">
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
            
            {/* Mobile Wallet Button */}
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        )}
      </div>

      <SearchDialog 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};

export default Header;