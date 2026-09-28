import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import RulesBanner from "@/components/RulesBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Trading Journal Pro",
  description: "Advanced SMC/ICT Trading Journal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-[#050505] text-gray-200">
        <Sidebar />
        <RulesBanner />
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative pt-24">
          <div className="absolute inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505]"></div>
          {children}
        </main>
      </body>
    </html>
  );
}
