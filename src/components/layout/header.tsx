'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FolderTree, Github } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/auth/user-menu';
import RepoHelp from '@/components/repo-help';

function IconWithTooltip({ 
  children, 
  label 
}: { 
  children: React.ReactNode; 
  label: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white dark:text-gray-100 bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200">
          {label}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700" />
        </div>
      )}
    </div>
  );
}

const Header = () => {
  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <FolderTree size={15} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm tracking-tight">
            Repo<span className="text-blue-600">Tree</span>
          </span>
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          <RepoHelp />
          <IconWithTooltip label="Source Code">
            <a
              href="https://github.com/coder-ralph/RepoTree"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source code"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Github size={17} />
            </a>
          </IconWithTooltip>
          <IconWithTooltip label="Toggle Theme">
            <ThemeToggle />
          </IconWithTooltip>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
