import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CyberSharkChat from "@/components/CyberSharkChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LB Leetcothon | CSULB Coding Challenge",
  description: "The Ultimate CSULB Spring Break Coding Challenge. Level up your skills and compete for FAANG+.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
          <Footer />
          <CyberSharkChat />
        </Providers>
      </body>
    </html>
  );
}
