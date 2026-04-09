'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, Lock, Unlock, AlertCircle, Gauge } from 'lucide-react';

export default function RepoHelp() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setShowTooltip(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={17} />
          </button>
          {showTooltip && !open && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white dark:text-gray-100 bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200">
              Help
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700" />
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">How to use RepoTree</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Paste a GitHub or GitLab repository URL and click Generate.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-600">Access</span>
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Unlock size={14} className="text-green-600 mt-0.5 shrink-0" />
                <span><strong className="text-gray-700 dark:text-gray-200">Public repos:</strong> no sign-in required (limited to 60 req/hr on GitHub)</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock size={14} className="text-blue-600 mt-0.5 shrink-0" />
                <span><strong className="text-gray-700 dark:text-gray-200">Private repos:</strong> sign in with OAuth</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Gauge size={14} className="text-blue-600" />
              <span>Rate limits</span>
            </h3>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li><strong className="text-gray-700 dark:text-gray-200">GitHub:</strong> 60 → 5,000 req/hr when signed in</li>
              <li><strong className="text-gray-700 dark:text-gray-200">GitLab:</strong> varies by server</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-600" />
              <span>Troubleshooting</span>
            </h3>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-300">
              <li><strong className="text-gray-700 dark:text-gray-200">Not found:</strong> check URL or permissions</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Rate limit exceeded:</strong> sign in</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Large repo:</strong> slower rendering</li>
              <li><strong className="text-gray-700 dark:text-gray-200">Auth error:</strong> sign out and sign in again</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
