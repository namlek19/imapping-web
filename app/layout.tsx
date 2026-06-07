import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ChatFab from "@/components/chat-fab";
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
  title: "iMapping — Khám phá đúng chỗ, đúng người",
  description:
    "Gợi ý địa điểm du lịch cá nhân hoá bằng AI dựa trên tính cách và sở thích của bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-primary antialiased">
        {/* Background blobs — full viewport, fixed so they span all pages */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="blob-1 absolute top-0 -left-20 w-152 h-152 rounded-full bg-teal-300/8 blur-3xl" />
          <div className="blob-2 absolute top-1/4 -right-32 w-120 h-120 rounded-full bg-accent/6 blur-3xl" />
          <div className="blob-3 absolute bottom-0 left-1/3 w-104 h-104 rounded-full bg-amber-200/8 blur-3xl" />
        </div>
        <Navbar />
        {children}
        <Footer />
        <ChatFab />
      </body>
    </html>
  );
}
