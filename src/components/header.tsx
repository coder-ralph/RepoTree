import { Github, FolderTreeIcon } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-gray-900 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderTreeIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl text-white font-bold">
              Repo<span className="text-blue-600">Tree</span>
            </h1>
          </div>
          <nav>
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
