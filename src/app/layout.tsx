import type { Metadata } from "next"
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "RepoTree - ASCII Tree Generator",
  description: "RepoTree is a web app for generating an ASCII tree from a GitHub URL.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
