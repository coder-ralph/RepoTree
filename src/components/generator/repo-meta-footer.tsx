import { File, Folder, Info, Layers, Filter } from 'lucide-react';
import { PERFORMANCE_THRESHOLDS, type RepoValidationResult, type EntryCounts } from '@/lib/repo-tree-utils';

interface RepoMetaFooterProps {
  repoValidation: RepoValidationResult | null;
  isEmpty: boolean;
  entryCounts: EntryCounts;
  maxDepth?: number | null;
  excludePatterns?: string[];
}

export default function RepoMetaFooter({ repoValidation, isEmpty, entryCounts, maxDepth, excludePatterns }: RepoMetaFooterProps) {
  const hasFilters = (maxDepth !== null && maxDepth !== undefined) || (excludePatterns && excludePatterns.length > 0);
  if (!repoValidation || isEmpty) return null;

  return (
    <div className="px-5 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <div className="relative group">
          <Info size={11} />
          <div className="absolute left-0 bottom-full mb-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 pointer-events-none z-10">
            <div className="w-64 bg-white dark:bg-gray-800 text-[11px] text-gray-600 dark:text-gray-300 rounded shadow-md border border-gray-200 dark:border-gray-700 px-2 py-1.5">
              Entry count and size are estimated from the fetched repository structure.
            </div>
          </div>
        </div>
        {repoValidation.totalEntries.toLocaleString()} entries ·{' '}
        ~{(repoValidation.estimatedSize / (1024 * 1024)).toFixed(1)} MB
        {repoValidation.totalEntries > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES && (
          <span className="text-amber-500 dark:text-amber-400">· large repo</span>
        )}
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        {hasFilters && (
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            {maxDepth !== null && maxDepth !== undefined && (
              <div className="flex items-center gap-1">
                <Layers size={11} />
                <span>Depth {maxDepth}</span>
              </div>
            )}
            {excludePatterns && excludePatterns.length > 0 && (
              <div className="flex items-center gap-1">
                <Filter size={11} />
                <span>{excludePatterns.length} excluded</span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Folder size={12} className="text-blue-500 dark:text-blue-400" />
          <span>{entryCounts.folders.toLocaleString()} folders</span>
        </div>
        <div className="flex items-center gap-1">
          <File size={12} className="text-green-500 dark:text-green-400" />
          <span>{entryCounts.files.toLocaleString()} files</span>
        </div>
      </div>
    </div>
  );
}
