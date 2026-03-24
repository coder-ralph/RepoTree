'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  Lock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import type { Repository } from '@/lib/providers/types';

interface Props {
  onSelect: (url: string, provider: string) => void;
}

type SortMode = 'updated' | 'name' | 'stars';

const PER_PAGE = 8;

export default function RepoBrowser({ onSelect }: Props) {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('updated');
  const [page, setPage] = useState(1);

  const fetchRepos = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/repos');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to fetch repositories');
      }
      const data = await res.json();
      setRepos(data.repos ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Reset page when search/sort changes
  useEffect(() => { setPage(1); }, [search, sort]);

  const filtered = useMemo(() => {
    let list = repos;

    // Search filter
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(lower) ||
          r.full_name.toLowerCase().includes(lower) ||
          (r.description ?? '').toLowerCase().includes(lower)
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count;
      // updated — keep server order (already sorted by last activity)
      return 0;
    });

    return list;
  }, [repos, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const buildUrl = (repo: Repository): string => {
    const provider = session?.provider ?? 'github';
    if (provider === 'gitlab') {
      return `https://gitlab.com/${repo.full_name}`;
    }
    return `https://github.com/${repo.full_name}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-xs">{error}</p>
        <button
          onClick={fetchRepos}
          className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={11} />
          Try again
        </button>
      </div>
    );
  }

  // Empty — no repos at all
  if (!loading && repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <BookOpen size={28} className="text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No repositories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + sort bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${repos.length} repositories…`}
            className="h-9 pl-8 pr-3 text-sm rounded-xl"
          />
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="h-9 px-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="updated">Recently updated</option>
          <option value="name">Name A–Z</option>
          <option value="stars">Most starred</option>
        </select>
      </div>

      {/* Repo list */}
      {paginated.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No repositories match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
          {paginated.map((repo) => (
            <button
              key={repo.id}
              onClick={() => onSelect(buildUrl(repo), session?.provider ?? 'github')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Visibility indicator */}
                {repo.private && (
                  <Lock size={12} className="text-gray-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {repo.name}
                  </p>
                  {repo.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 max-w-sm">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {repo.language && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{repo.language}</span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                        <Star size={10} />
                        {repo.stargazers_count}
                      </span>
                    )}
                    {repo.private && (
                      <span className="text-xs text-amber-600 dark:text-amber-500">Private</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Generate arrow */}
              <div className="flex-shrink-0 ml-3 text-xs font-medium text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                Generate
                <ChevronRight size={13} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} repo{filtered.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                        page === p
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
