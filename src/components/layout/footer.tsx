import Link from 'next/link';
import { FolderTreeIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/" className="flex items-center space-x-2">
                <FolderTreeIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  Repo<span className="text-blue-600">Tree</span>
                </h2>
              </Link>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
              Simplify your GitHub repository visualization.
            </p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="hover:text-blue-400 transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/cookie-policy" className="hover:text-blue-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Contribute</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
              Have a suggestion?{' '}
              <a
                href="https://github.com/coder-ralph/RepoTree"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-500 transition-colors"
              >
                Contribute to the project!
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
          <p>&copy; {new Date().getFullYear()} RepoTree. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
