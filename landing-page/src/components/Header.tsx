"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-black">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-[72px] px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-[#9fff3c] text-2xl">✕</span>
            <span className="text-white font-light tracking-wider">YUDAEV.BRANDING</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            <Link href="/courses" className="text-white hover:text-[#9fff3c] transition duration-300 text-sm tracking-wider">
              COURSES
            </Link>
            <Link href="/agency" className="text-white hover:text-[#9fff3c] transition duration-300 text-sm tracking-wider">
              АГЕНТСТВО
            </Link>
            <Link href="/creator-club" className="text-white hover:text-[#9fff3c] transition duration-300 text-sm tracking-wider">
              CREATOR CLUB
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <button className="bg-[#9fff3c] hover:bg-[#8aff1c] text-black px-8 py-3 rounded-full text-sm font-medium transition duration-300">
              КАРЬЕРНАЯ КОНСУЛЬТАЦИЯ
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black border-t border-white/10">
            <nav className="flex flex-col py-4">
              <Link 
                href="/courses" 
                className="text-white hover:text-[#9fff3c] transition px-6 py-3 text-sm"
              >
                COURSES
              </Link>
              <Link 
                href="/agency" 
                className="text-white hover:text-[#9fff3c] transition px-6 py-3 text-sm"
              >
                АГЕНТСТВО
              </Link>
              <Link 
                href="/creator-club" 
                className="text-white hover:text-[#9fff3c] transition px-6 py-3 text-sm"
              >
                CREATOR CLUB
              </Link>
              <div className="px-6 py-3">
                <button className="w-full bg-[#9fff3c] hover:bg-[#8aff1c] text-black px-8 py-3 rounded-full text-sm font-medium transition duration-300">
                  КАРЬЕРНАЯ КОНСУЛЬТАЦИЯ
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 