'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { FolderTree } from 'lucide-react';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.49a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/generator';
  const error = searchParams?.get('error');
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl });
  };

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Error starting sign in. Please try again.',
    OAuthCallback: 'Error during sign in. Please try again.',
    OAuthCreateAccount: 'Could not create account. Please try again.',
    AccessDenied: 'Access was denied. Please authorize the required permissions.',
    Default: 'An error occurred during sign in.',
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#0d0d0d] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderTree size={15} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">
            Repo<span className="text-blue-600">Tree</span>
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Title block */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
              Sign in to RepoTree
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Connect your account to access private repositories and higher API rate limits.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessages[error] ?? errorMessages.Default}
              </p>
            </div>
          )}

          {/* Sign-in card */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* GitHub button */}
            <button
              onClick={() => handleSignIn('github')}
              disabled={loadingProvider !== null}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                <GitHubIcon className="w-4 h-4 text-white dark:text-gray-900" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {loadingProvider === 'github' ? 'Connecting…' : 'Continue with GitHub'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Public and private repositories
                </div>
              </div>
              {loadingProvider === 'github' ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
              ) : (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Divider */}
            <div className="mx-5 border-t border-gray-100 dark:border-gray-800" />

            {/* GitLab button */}
            <button
              onClick={() => handleSignIn('gitlab')}
              disabled={loadingProvider !== null}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#e24329] flex items-center justify-center flex-shrink-0">
                <GitLabIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {loadingProvider === 'gitlab' ? 'Connecting…' : 'Continue with GitLab'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Public and private repositories
                </div>
              </div>
              {loadingProvider === 'gitlab' ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
              ) : (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Public access note */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5 leading-relaxed">
            Public repositories work without signing in.{' '}
            <a href="/generator" className="text-blue-600 hover:underline">
              Try it first →
            </a>
          </p>

          {/* Security note */}
          <div className="mt-6 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your access token is stored securely in an encrypted session cookie and never exposed to client-side code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
