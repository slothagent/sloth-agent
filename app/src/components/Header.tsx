'use client'

import Image from "next/image";
import Link from "next/link";
import WalletButton from "./WalletButton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0B0E17] border-b border-[#1F2937]">
      <div className="container mx-auto">
        <div className="h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <Image
                src="/assets/logo/sloth.png"
                alt="Sloth AI Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-2xl">SLOTH AGENT</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="w-full pl-12 pr-4 py-2 h-10 bg-[#161B28] border-none text-white placeholder-gray-400 rounded text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none"
                placeholder="Search for people, funds, exchanges, and ENS..."
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
