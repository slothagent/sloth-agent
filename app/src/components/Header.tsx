'use client'

import Image from "next/image";
import Link from "next/link";
import WalletButton from "./WalletButton";


const Header = () => {
  return (
    <header className="top-0 left-0 right-0 z-50 bg-[#0A0D16] border-b border-white">
      <div className="container mx-auto ">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 relative">
                <Image
                  src="/assets/logo/sloth-ai-light.jpg"
                  alt="Sloth AI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white font-bold text-3xl">Sloth Agent</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/" className="font-semibold hover:underline text-white text-lg">Home</Link>
              <Link href="/agent/create" className="font-semibold hover:underline text-white text-lg">Create Agent</Link>
              <Link href="#" className="font-semibold hover:underline text-white text-lg">How to Launch Agent</Link> 
            </div>
          </div>

          <WalletButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
