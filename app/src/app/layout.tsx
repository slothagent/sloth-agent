import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Providers } from "./providers";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sloth Agent - AI-Powered Productivity & Trading Platform",
  description: "Revolutionize your productivity with Sloth Agent's AI-powered automation. Track blockchain activities, analyze social media, and optimize token trading with intelligent insights and automated workflows.",
  keywords: [
    "AI Platform",
    "Artificial Intelligence",
    "Automation",
    "Social AI",
    "Research AI",
    "Workflow Automation",
    "Machine Learning",
    "Productivity Tools",
    "AI Automation",
    "Intelligent Automation",
    "Blockchain Analytics",
    "Token Trading",
    "Market Analysis",
    "Trading Strategies",
    "Real-time Insights",
    "Sloth Agent",
    "Trading Agent",
    "Social Media Agent",
    "Research Agent",
    "Sloth Agent Platform",
    "Sloth Agent Token",
    "Sloth Agent Tokenomics",
    "Agent Automation",
    "Sloth Agent AI",
    "Sloth Agent AI Platform"
  ],
  openGraph: {
    title: "Sloth Agent - AI-Powered Productivity & Trading Platform",
    description: "Revolutionize your workflow with cutting-edge AI automation. Track blockchain activities, analyze social media, and optimize token trading with intelligent insights and automated workflows.",
    type: "website",
    siteName: "Sloth Agent",
    locale: "en_US",
    images: [{
      url: "/og-image.jpg", // Make sure to add this image to your public folder
      width: 1200,
      height: 630,
      alt: "Sloth Agent Platform Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sloth Agent - AI-Powered Productivity & Trading Platform",
    description: "Democratizing access to sophisticated AI tools. Track blockchain activities, analyze social media, and optimize token trading with intelligent automation.",
    creator: "@slothagentX",
    images: ["/twitter-image.jpg"], // Make sure to add this image to your public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://slothai.xyz',
  },
  authors: [{ name: 'VixHub Labs' }],
  category: 'Technology',
  metadataBase: new URL('https://slothai.xyz'),
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} bg-[#0B0E17] text-gray-900`}>
        <Providers>
          <Header />
          <Suspense fallback={ <Loading /> }>
            {children}
          </Suspense>
        </Providers>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
