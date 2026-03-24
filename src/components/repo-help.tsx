'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, ExternalLink } from 'lucide-react';

export default function RepoHelp() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={13} />
          Help
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">How to use RepoTree</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2 text-sm">
          <section>
            <h3 className="font-medium mb-1.5 text-gray-900 dark:text-white">Public repositories</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Paste any public GitHub or GitLab repository URL and click Generate.
              No sign-in required. Public repositories are subject to API rate limits
              (60 requests/hour for GitHub, variable for GitLab).
            </p>
          </section>

          <section>
            <h3 className="font-medium mb-1.5 text-gray-900 dark:text-white">Private repositories</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Sign in with your GitHub or GitLab account using OAuth. Once signed in,
              you can access any private repository you have permission to view.
              Your access token is stored securely in an encrypted session cookie —
              never in localStorage or exposed to client-side code.
            </p>
          </section>

          <section>
            <h3 className="font-medium mb-1.5 text-gray-900 dark:text-white">Rate limits</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Signing in with OAuth increases GitHub API rate limits from 60 to 5,000
              requests per hour. GitLab rate limits vary by server configuration.
            </p>
          </section>

          <section>
            <h3 className="font-medium mb-1.5 text-gray-900 dark:text-white">Troubleshooting</h3>
            <ul className="text-gray-500 dark:text-gray-400 space-y-1.5 leading-relaxed">
              <li><strong className="text-gray-700 dark:text-gray-300">Not found:</strong> Check the URL and ensure you have access to the repository.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Rate limit exceeded:</strong> Sign in to get higher limits.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Large repo warning:</strong> You can proceed, but rendering may be slower.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Auth error:</strong> Sign out and sign in again.</li>
            </ul>
          </section>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-4">
            <a
              href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              GitHub rate limits <ExternalLink size={11} />
            </a>
            <a
              href="https://docs.gitlab.com/security/rate_limits/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              GitLab rate limits <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
