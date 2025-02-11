'use client'
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className=" top-0 left-0 right-0 z-50 bg-white">
      <div className="container mx-auto ">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/assets/logo/memetrade-co.png"
                alt="Memetrade Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-pink-500 font-bold">Memetrade Co.</span>
          </Link>

          {/* Connect Wallet Button */}
          <button className="bg-[#1bebb9] hover:bg-[#18d4a7] text-black px-4 py-2 rounded-full transition-colors font-medium">
            Connect wallet
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
