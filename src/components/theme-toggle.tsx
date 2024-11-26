'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative inline-flex h-9 w-16 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <span
        className={`${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'} inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform duration-300`}
      />
      <Sun
        className="absolute left-2 h-5 w-5 text-yellow-500 dark:text-gray-400"
        aria-hidden="true"
      />
      <Moon
        className="absolute right-2 h-5 w-5 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
    </button>
  );
}
