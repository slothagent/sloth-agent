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
  title: "Sloth Agent - Intelligent Automation Platform",
  description: "Sloth Agent is a pioneering platform that optimizes time and effort through cutting-edge artificial intelligence. Work smarter, not harder with our advanced AI-driven automation solutions.",
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
    "Intelligent Automation"
  ],
  openGraph: {
    title: "Sloth Agent - Intelligent Automation Platform",
    description: "Transform your workflow with AI-powered automation. Sloth Agent integrates advanced AI models for social interactions, research, and intelligent decision-making.",
    type: "website",
    siteName: "Sloth Agent",
    locale: "en_US",
    images: [{
      url: "/og-image.jpg", // Make sure to add this image to your public folder
      width: 1200,
      height: 630,
      alt: "SlothAI Platform Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sloth Agent - Intelligent Automation Platform",
    description: "Transform your workflow with AI-powered automation. Work smarter, not harder with Sloth Agent.",
    creator: "@slothai",
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
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
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
