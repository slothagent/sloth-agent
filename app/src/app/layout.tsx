import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Memetrade Co.",
  description: "Get your free prints - Limited time only",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${spaceGrotesk.variable} font-sans min-h-screen flex flex-col bg-white text-gray-900`}>
        
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
