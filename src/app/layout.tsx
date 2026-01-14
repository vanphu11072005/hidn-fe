import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NextAuthProvider } from "@/providers/NextAuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hidn - Công cụ AI học tập ẩn danh",
  description: 
    "Công cụ AI học tập cho sinh viên - Nhanh, kín đáo, hiệu quả",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: [{ color: '#0866ff' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 
        antialiased">
        <ThemeProvider>
          <NextAuthProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
