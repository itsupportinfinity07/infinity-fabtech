import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { QuoteProvider } from "@/context/QuoteContext";
import { constructMetadata } from "@/lib/metadata";
import { SiteContentProvider } from "@/components/SiteContentProvider";
import { getSiteContext } from "@/lib/content/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteContext();
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900`}
      >
        <SiteContentProvider value={site}>
        <QuoteProvider>
          <Navbar />
          <main className="flex-grow pt-16 lg:pt-20">
            {children}
          </main>
          <Footer />
        </QuoteProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
