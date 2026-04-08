import Link from 'next/link';
import Image from 'next/image';
import { FolderTree } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <FolderTree size={13} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                Repo<span className="text-blue-600">Tree</span>
              </span>
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Generate clean ASCII trees from any repository.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { href: '/generator', label: 'Generator' },
              { href: '/docs', label: 'Docs' },
              { href: '/guide', label: 'Guide' },
              { href: '/legal/privacy-policy', label: 'Privacy' },
              { href: '/legal/cookie-policy', label: 'Cookies' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} RepoTree. All rights reserved.
          </p>

          <a
            href="https://app.daily.dev/coderralph"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span>Made with ☕ by</span>
            <Image
              src="/image/avatar.png"
              alt="Ralph Rosael"
              width={18}
              height={18}
              className="rounded-full"
            />
            <span className="group-hover:decoration-blue-500 underline decoration-gray-500 dark:decoration-gray-400 decoration-wavy underline-offset-[4px]">
              Ralph Rosael
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
