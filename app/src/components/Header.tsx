'use client'

import Image from "next/image";
import Link from "next/link";
import WalletButton from "./WalletButton";


const Header = () => {
  return (
    <header className="top-0 left-0 right-0 z-50 bg-[#8b7355]/10 border-b-2 border-[#8b7355]">
      <div className="container mx-auto">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 relative">
                <Image
                  src="/assets/logo/sloth.jpg"
                  alt="Sloth AI Logo"
                  fill
                  className="object-contain rounded-md border border-[#8b7355]"
                />
              </div>
              <span className="text-[#8b7355] font-bold text-2xl font-mono">Sloth Agent</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/" className="font-semibold text-[#8b7355] hover:text-[#8b7355]/80 hover:underline text-md font-mono">Home</Link>
              <Link href="/agent/create" className="font-semibold text-[#8b7355] hover:text-[#8b7355]/80 hover:underline text-md font-mono">Create Agent</Link>
              <Link href="#" className="font-semibold text-[#8b7355] hover:text-[#8b7355]/80 hover:underline text-md font-mono">How to Launch Agent</Link> 
            </div>
          </div>

          <WalletButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
