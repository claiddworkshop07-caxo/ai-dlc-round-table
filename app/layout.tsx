import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Equipment Lending Management",
  description: "An app to manage equipment lending and returns via QR codes",
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
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <header className="border-b bg-background px-4 py-3">
          <nav className="mx-auto flex max-w-3xl items-center gap-6">
            <a href="/" className="text-sm font-medium hover:underline">
              🏠 Home
            </a>
            <a href="/equipment" className="text-sm font-medium hover:underline">
              📦 Equipment
            </a>
            <a href="/scan" className="text-sm font-medium hover:underline">
              📷 Scan
            </a>
            <a href="/history" className="text-sm font-medium hover:underline">
              📋 History
            </a>
            <a href="/admin" className="text-sm font-medium hover:underline ml-auto">
              🔧 Admin
            </a>
          </nav>
        </header>
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
