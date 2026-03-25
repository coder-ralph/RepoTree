import type { Metadata } from 'next';
import AuthProvider from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'RepoTree — ASCII Tree Generator',
  description:
    'Generate clean ASCII trees from any GitHub or GitLab repository. Perfect for documentation, READMEs, and code reviews.',
  authors: [{ name: 'Ralph Rosael' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png', sizes: '256x256' },
    ],
  },
  openGraph: {
    title: 'RepoTree — ASCII Tree Generator',
    description: 'Generate clean ASCII trees from any GitHub or GitLab repository.',
    type: 'website',
    url: 'https://ascii-repotree.vercel.app',
    siteName: 'RepoTree',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'RepoTree — ASCII Tree Generator',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RepoTree — ASCII Tree Generator',
    description: 'Generate clean ASCII trees from any GitHub or GitLab repository.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
