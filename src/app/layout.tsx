import Script from 'next/script';
import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'RepoTree - ASCII Tree Generator',
  description: 'RepoTree is a web app for generating an ASCII tree from a GitHub or GitLab URL.',
  authors: [{ name: 'Ralph Rosael' }],
  verification: {
    // Google Search Console
    google: 'T1eSo0As2QM6eFiFVR-rfDwCxNa_oMVNVgoSDqZNk4U',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7PSC7S1M55"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7PSC7S1M55');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
