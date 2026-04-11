'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Github, Lock, FolderTree, Settings, Download } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.49a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

const steps = [
  {
    icon: FolderTree,
    title: 'Enter a repository URL',
    desc: 'Paste any public GitHub or GitLab repository URL into the input field. The provider is auto-detected from the URL.',
  },
  {
    icon: FolderTree,
    title: 'Click Generate',
    desc: 'RepoTree fetches the repository structure via the GitHub or GitLab API and builds your ASCII tree.',
  },
  {
    icon: Settings,
    title: 'Customize the output',
    desc: 'Use the Settings icon to adjust ASCII style, enable icons, line numbers, descriptions, or trailing slashes.',
  },
  {
    icon: Download,
    title: 'Export or copy',
    desc: 'Copy to clipboard or export as .md, .txt, .json, .html, PNG, or SVG — ready for README files, documentation, and sharing.',
  },
];

export default function GuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Go back
          </button>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
            Getting started
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
            How to use RepoTree to generate and export repository trees.
          </p>

          {/* Steps */}
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Basic usage
            </h2>
            <div className="space-y-4">
              {steps.map(({ title, desc }, i) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Private repos */}
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Private repositories
            </h2>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* GitHub */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Github size={13} className="text-white dark:text-gray-900" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">GitHub</span>
                </div>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                  <li>1. Click <strong className="text-gray-800 dark:text-gray-200">Sign in</strong> in the header</li>
                  <li>2. Choose <strong className="text-gray-800 dark:text-gray-200">Continue with GitHub</strong></li>
                  <li>3. Authorize the required permissions (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">read:user repo</code>)</li>
                  <li>4. You can now generate trees from your private repositories</li>
                </ol>
              </div>

              {/* GitLab */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-[#e24329] flex items-center justify-center">
                    <GitLabIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">GitLab</span>
                </div>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                  <li>1. Click <strong className="text-gray-800 dark:text-gray-200">Sign in</strong> in the header</li>
                  <li>2. Choose <strong className="text-gray-800 dark:text-gray-200">Continue with GitLab</strong></li>
                  <li>3. Authorize the required permissions (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">read_user read_repository</code>)</li>
                  <li>4. You can now generate trees from your private repositories</li>
                </ol>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <Lock size={13} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Your OAuth access token is stored in an encrypted session cookie — never in localStorage or exposed to client-side code. Sessions expire after 24 hours.
              </p>
            </div>
          </section>

          {/* Rate limits */}
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              API rate limits
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Provider</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Unauthenticated</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">Signed in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">GitHub</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">60 req/hr</td>
                    <td className="px-4 py-2.5 text-green-700 dark:text-green-400 font-medium">5,000 req/hr</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">GitLab</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">Varies</td>
                    <td className="px-4 py-2.5 text-green-700 dark:text-green-400 font-medium">Higher limits</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Try it now →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
