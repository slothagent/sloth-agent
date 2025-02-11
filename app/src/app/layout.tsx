import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sloth AI | Agent AI Platform",
  description: "Discover and trade meme tokens",
};

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen"> 
      <div className="w-10 h-10 border-t-transparent border-solid animate-spin rounded-full border-blue-500 border-8"></div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${spaceGrotesk.variable} font-sans bg-white text-gray-900`}>
        <Providers>
          <Suspense fallback={ <Loading /> }>
              {children}
          </Suspense>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
