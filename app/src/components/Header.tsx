'use client'

import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className=" top-0 left-0 right-0 z-50 bg-[#93E905]/10">
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
              <span className="text-sloth-light font-bold text-3xl">Sloth Agent</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/" className="font-semibold hover:text-sloth-light hover:underline text-lg">Home</Link>
              <Link href="/agent/create" className="font-semibold hover:text-sloth-light hover:underline text-lg">Create Agent</Link>
              <Link href="#" className="font-semibold hover:text-sloth-light hover:underline text-lg">How to Launch Agent</Link> 
            </div>
          </div>

          {/* Connect Wallet Button */}
          <button className="bg-sloth-light hover:bg-sloth-light text-black px-4 py-2 rounded-full transition-colors font-medium">
            Connect wallet
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
