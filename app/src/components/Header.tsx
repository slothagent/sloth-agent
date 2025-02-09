'use client'
import Image from "next/image";
import Link from "next/link";
import { FormEventHandler, useEffect, useState } from "react";
import WalletButton from './WalletButton';

interface HeaderType{
  handleSearch?: FormEventHandler<HTMLFormElement>
  search?: string
  setSearch?: (search: string) => void
}

const Header = ({ handleSearch, search, setSearch }: HeaderType) => {
  const [width, setWidth] = useState<number>(0);
  
  useEffect(() => {
    setWidth(window.innerWidth);
    
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isDesktop = width >= 1024;

  return (
    <>
      <header className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between w-full ${isMobile ? 'gap-4' : 'gap-0'}`}>
          <div className={`flex flex-row items-start md:items-center gap-4 w-full ${!isMobile && 'w-auto'}`}>
            {isMobile ? (
              <Link href="/">
                <Image
                  src="/assets/logo/memetrade-co.png"
                  alt="Memetrade Logo"
                  width={50}
                  height={50}
                  className="w-12 h-12"
                />
              </Link>
            ) : (
              <Link href="/">
                <Image
                  src="/assets/logo/memetrade-co.png"
                  alt="Memetrade Logo"
                  width={40}
                  height={40}
                  className="w-8 h-8"
                />
              </Link>
            )}
            {
              isDesktop && (
                <form onSubmit={handleSearch} className="w-full md:w-[600px]">
                  <div className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:border-neon-pink focus-within:ring-1 focus-within:ring-neon-pink">
                    <input
                      type="text"
                      placeholder="Search for a token"
                      value={search}
                      onChange={(e) => setSearch && setSearch(e.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </form>
              )
            }
          </div>
          {isDesktop && (
            <div className="flex gap-2">
              <WalletButton />
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;