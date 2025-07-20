import Link from 'next/link';

import { FolderTreeIcon, Github } from 'lucide-react';

import GitHubHelp from "@/components/github-help"
import ThemeToggle from '../theme-toggle';

const Header = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <FolderTreeIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-white font-bold">
              Repo<span className="text-blue-600">Tree</span>
            </h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <GitHubHelp />
            <ThemeToggle />
            <a
              href="https://github.com/coder-ralph/RepoTree"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="flex items-center justify-center p-2 rounded-full bg-blue-900 text-white hover:bg-blue-700 transition-colors duration-200 ease-in-out"
            >
              <Github className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
