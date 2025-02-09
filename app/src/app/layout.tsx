import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { Suspense } from "react";
import Loading from "@/components/Loading";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Memetrade Co. | Meme Token Platform",
  description: "Discover and trade meme tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${spaceGrotesk.variable} font-sans bg-white text-gray-900`}>
        <Providers>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 md:ml-64">
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </div>
          </div>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
