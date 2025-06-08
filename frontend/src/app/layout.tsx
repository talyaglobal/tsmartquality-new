import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthGuard from '@/components/auth/AuthGuard';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TSmart Quality - Quality Management System',
  description: 'Advanced quality management system for modern businesses',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}