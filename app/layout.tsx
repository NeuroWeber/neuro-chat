import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {GoogleAnalytics} from '@next/third-parties/google'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroWeb | Senior Web Developer Portfolio",
  description: "Portfolio of NeuroWeb, a Senior Web Developer with 6 years of experience building efficient and responsive software products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-slate-950 text-slate-200 selection:bg-blue-500/30">
        {children}
      </body>
      <GoogleAnalytics gaId="G-EP1SP68RCC" />
    </html>
  );
}