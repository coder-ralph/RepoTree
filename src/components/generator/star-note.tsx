import { Star } from 'lucide-react';

interface StarNoteProps {
  show: boolean;
}

export default function StarNote({ show }: StarNoteProps) {
  if (!show) return null;

  return (
    <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2">
      <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <a
          href="https://github.com/coder-ralph/RepoTree"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors"
        >
          Star this project
        </a>{' '}
        if you find it useful!
      </p>
    </div>
  );
}
