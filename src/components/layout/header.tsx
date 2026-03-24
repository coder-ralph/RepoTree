import Link from 'next/link';
import { FolderTree } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/auth/user-menu';
import RepoHelp from '@/components/repo-help';

const Header = () => {
  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <FolderTree size={15} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">
            Repo<span className="text-blue-600">Tree</span>
          </span>
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          <RepoHelp />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
