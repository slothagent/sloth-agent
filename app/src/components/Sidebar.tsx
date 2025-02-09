'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ticket,
  Gift,
  Clock,
  Files,
  TelegramLogo,
  TwitterLogo,
  FacebookLogo,
  Moon,
  Globe,
  CaretRight,
  List,
  X,
  Chat,
  Coins,
} from "@phosphor-icons/react";

const menuItems = [
  { 
    icon: Ticket,
    label: 'NFTs', 
    href: '/nfts'
  },
  { 
    icon: Gift,
    label: 'Add Pool Token', 
    href: '/positions/create', 
  },
  { 
    icon: Files,
    label: 'Swap Token', 
    href: '/swap'
  },
  { 
    icon: Chat,
    label: 'Chat', 
    href: '/chat', 
    badge: 'New' 
  },
  { 
    icon: Coins,
    label: 'Mint', 
    href: '/mint'
  },
  { 
    icon: TelegramLogo,
    label: 'Telegram', 
    href: 'https://t.me/neon_feed', 
    hasArrow: true,
    blank: true,
  },
  { 
    icon: TwitterLogo,
    label: 'Twitter', 
    blank: true,
    hasArrow: true,
    href: 'https://x.com/neon_feedz' 
  }
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-md"
      >
        {isOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 h-screen border-r border-gray-100 bg-white z-40
      `}>
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo/memetrade-co.png"
              alt="Memetrade Logo"
              width={50}
              height={50}
            />
            <span className="font-bold text-xl bg-gradient-to-r from-neon-pink to-neon-green bg-clip-text text-transparent">
              Memetrade Co.
            </span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.blank ? '_blank' : undefined}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 w-full group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} weight="regular" className="group-hover:text-neon-pink" />
                    <span className="group-hover:text-neon-pink">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-xs bg-neon-pink text-white px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.hasArrow && <CaretRight size={16} className="text-gray-400 group-hover:text-neon-pink" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 