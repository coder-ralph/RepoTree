'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Info } from 'lucide-react';
import type { RepoValidationResult } from '@/lib/repo-tree-utils';

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoValidation: RepoValidationResult | null;
  onContinue: () => void;
  onCancel: () => void;
  maxDepth?: number | null;
  excludePatterns?: string[];
}

export default function ValidationDialog({
  open,
  onOpenChange,
  repoValidation,
  onContinue,
  onCancel,
  maxDepth,
  excludePatterns,
}: ValidationDialogProps) {
  const hasFilters = (maxDepth !== null && maxDepth !== undefined) || (excludePatterns && excludePatterns.length > 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {repoValidation?.isValid === false ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Info className="h-4 w-4 text-amber-500" />
            )}
            Repository size warning
          </DialogTitle>
        </DialogHeader>
        {repoValidation && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {repoValidation.totalEntries.toLocaleString()} entries ·{' '}
              ~{(repoValidation.estimatedSize / (1024 * 1024)).toFixed(1)} MB
            </p>
            {repoValidation.errors.map((e, i) => (
              <Alert key={i} className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertDescription className="text-red-700 dark:text-red-300 text-sm">{e}</AlertDescription>
              </Alert>
            ))}
            {repoValidation.warnings.map((w, i) => (
              <Alert key={i} className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">{w}</AlertDescription>
              </Alert>
            ))}
            {hasFilters && repoValidation.warnings.length > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded px-2 py-1.5">
                Filters applied:{maxDepth !== null && maxDepth !== undefined ? ` Max Depth ${maxDepth}` : ''}{maxDepth !== null && maxDepth !== undefined && excludePatterns && excludePatterns.length > 0 ? ',' : ''}{excludePatterns && excludePatterns.length > 0 ? ` ${excludePatterns.length} exclude pattern(s)` : ''}.
              </p>
            )}
            {!hasFilters && repoValidation.warnings.length > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded px-2 py-1.5">
                Tip: Try setting Max Depth (2-4) or excluding patterns (e.g., node_modules, dist) to reduce output.
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={onContinue}>
                Continue Anyway
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              Large repositories may take longer and impact performance.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
