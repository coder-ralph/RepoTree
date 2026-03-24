'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FolderTree, Github, Download, Search, BarChart3, Zap, Lock } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.49a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

const ASCII_DEMO = `└── src
    ├── app
    │   ├── api
    │   │   └── tree
    │   │       └── route.ts
    │   ├── generator
    │   │   └── page.tsx
    │   └── layout.tsx
    ├── components
    │   ├── auth
    │   └── ui
    └── lib
        └── providers`;

const features = [
  {
    icon: FolderTree,
    title: 'ASCII + Interactive trees',
    desc: 'Switch between clean ASCII output and a collapsible interactive explorer.',
  },
  {
    icon: BarChart3,
    title: 'Repository analysis',
    desc: 'Visualize file type distribution and language breakdown with charts.',
  },
  {
    icon: Download,
    title: 'Multiple export formats',
    desc: 'Download as .md, .txt, .json, or .html — ready for your README.',
  },
  {
    icon: Search,
    title: 'Real-time search',
    desc: 'Filter files and directories instantly as you type.',
  },
  {
    icon: Lock,
    title: 'Private repository access',
    desc: 'Sign in with OAuth to access your private repos securely.',
  },
  {
    icon: Zap,
    title: 'Customizable output',
    desc: 'Icons, line numbers, descriptions, trailing slashes — your choice.',
  },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Dot grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-medium mb-6">
                <Github size={11} />
                GitHub
                <span className="text-blue-300 dark:text-blue-600">·</span>
                <GitLabIcon className="w-2.5 h-2.5" />
                GitLab
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
                Visualize Your<br />
                <span className="text-blue-600">Repo Structure</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
                Generate clean ASCII trees from any GitHub or GitLab repository.
                Perfect for documentation, READMEs, and code reviews.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <FolderTree size={14} />
                  Generate a tree
                </Link>

                {!session && (
                  <button
                    onClick={() => signIn()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <Lock size={13} />
                    Sign in for private repos
                  </button>
                )}
              </div>
            </motion.div>

            {/* Demo window */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-14 max-w-lg mx-auto"
            >
              <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-gray-900/20 text-left">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-gray-300 font-mono">repository-structure.txt</span>
                </div>
                <pre className="p-5 text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  {ASCII_DEMO}
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
              Everything you need
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Built for developers who care about clean documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <Icon size={15} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 md:p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              Ready to generate?
            </h2>
            <p className="text-blue-200 text-sm mb-6">
              Paste any public repository URL and get your tree in seconds.
            </p>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-600 text-sm font-medium rounded-xl transition-colors"
            >
              <FolderTree size={14} />
              Open Generator
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
