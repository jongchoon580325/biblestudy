import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import BackToTopButton from "./back-to-top-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "성경자료 관리 시스템",
  description: "온라인/오프라인 성경자료실 프로젝트",
};

function Header() {
  return (
    <header className="w-full max-w-[1024px] md:w-[1024px] mx-auto py-4 flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
        <span className="text-xl font-bold text-indigo-600">📖</span>
        <span className="text-lg font-bold">성경자료 관리</span>
      </div>
      <nav className="flex-1 flex justify-center space-x-4 text-sm font-medium">
        <Link href="/" className="hover:text-[#eba434]">홈</Link>
        <Link href="/all-materials" className="hover:text-[#eba434]">전체자료실</Link>
        <Link href="/bible" className="hover:text-[#eba434]">성경자료실</Link>
        <Link href="/general-materials" className="hover:text-[#eba434]">일반자료실</Link>
        <Link href="/data-management" className="hover:text-[#eba434]">데이터관리</Link>
      </nav>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full max-w-[1024px] md:w-[1024px] mx-auto py-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 mt-8 relative overflow-x-hidden">
      <div>Sola Scriptura Biblical Research Archive.</div>
      <div className="mt-1">{year} Built with ❤️ by 나 종 춘 | <a href="mailto:najongchoon@gmail.com" className="hover:underline text-amber-500">najongchoon@gmail.com</a></div>
      <div className="mt-2 text-[10px] text-gray-400">저장상태: 동기화됨 (예시)</div>
      <BackToTopButton />
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        <div className="min-h-screen flex flex-col items-center overflow-x-hidden">
          <Header />
          <main className="flex-1 flex flex-col w-full max-w-[1024px] md:w-[1024px] mx-auto overflow-x-hidden">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
