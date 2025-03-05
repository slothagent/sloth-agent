'use client'

import Image from "next/image";
import Link from "next/link";
import WalletButton from "./WalletButton";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0B0E17] border-b border-[#1F2937]">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo - Responsive */}
          <Link href="/" className="flex items-center gap-2 min-w-fit">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <Image
                src="/assets/logo/sloth.png"
                alt="Sloth AI Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-lg sm:text-2xl">SLOTH AGENT</span>
          </Link>

          {/* Desktop Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="w-full pl-12 pr-4 py-2 h-10 bg-[#161B28] border-none text-white placeholder-gray-400 rounded text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none"
                placeholder="Search for people, funds, exchanges, and ENS..."
              />
            </div>
          </div>
          <Link href="/agent" className="hidden md:block">
            <div className="bg-[#161B28] h-10 p-2 flex justify-center items-center">
            <span className="text-white text-sm">My Agent</span>
            </div>
          </Link>
          
          {/* Desktop Wallet Button - Hidden on mobile */}
          <div className="hidden md:block">
            <WalletButton />
          </div>

          {/* Mobile Menu Button - Hidden on desktop */}
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

        {/* Mobile Menu - Hidden on desktop */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-[#1F2937]">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="w-full pl-12 pr-4 py-2 h-10 bg-[#161B28] border-none text-white placeholder-gray-400 rounded text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none"
                placeholder="Search..."
              />
            </div>
            
            {/* Mobile Wallet Button */}
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
