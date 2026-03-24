'use client';

import { useSession, signIn } from 'next-auth/react';
import { CheckCircle, Lock } from 'lucide-react';

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

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  if (session?.user) {
    const isGitHub = session.provider === 'github';
    const providerLabel = isGitHub ? 'GitHub' : 'GitLab';
    const ProviderIcon = isGitHub ? GitHubIcon : GitLabIcon;

    return (
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
        <CheckCircle size={14} className="text-green-600 dark:text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-800 dark:text-green-300">
          Signed in with <span className="inline-flex items-center gap-1 font-medium">
            <ProviderIcon className="w-3 h-3" />
            {providerLabel}
          </span> as <strong>{session.user.name}</strong>. Private repositories are accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
      <div className="flex items-center gap-2.5">
        <Lock size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Public repositories only.{' '}
          <span className="text-amber-700 dark:text-amber-400">Sign in for private repo access and higher rate limits.</span>
        </p>
      </div>
      <button
        onClick={() => signIn()}
        className="flex-shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline underline-offset-2 transition-colors"
      >
        Sign in →
      </button>
    </div>
  );
}
