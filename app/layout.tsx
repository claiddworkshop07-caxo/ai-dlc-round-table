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
  title: "備品貸出管理",
  description: "QRコードで備品の貸出・返却を管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-background px-4 py-3">
          <nav className="mx-auto flex max-w-3xl items-center gap-6">
            <a href="/" className="text-sm font-medium hover:underline">
              🏠 ホーム
            </a>
            <a href="/equipment" className="text-sm font-medium hover:underline">
              📦 備品管理
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
