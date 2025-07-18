import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppContent } from '@/components/app-content';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'SalonFlow',
  description: 'Manage your salon clients with ease.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#7C5DFA" />
      </head>
      <body className="font-body antialiased">
        <Providers>
            <AppContent>{children}</AppContent>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
