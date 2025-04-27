import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WindowManagerProvider } from '@/context/WindowManagerContext';
import { FileSystemProvider } from '@/context/FileSystemContext'; // Import FileSystemProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Browser OS',
  description: 'A mock OS running in your browser',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden`}>
        {/* FileSystemProvider wraps WindowManagerProvider */}
        <FileSystemProvider>
          <WindowManagerProvider>{children}</WindowManagerProvider>
        </FileSystemProvider>
      </body>
    </html>
  );
}
