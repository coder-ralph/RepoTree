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
}

export default function ValidationDialog({
  open,
  onOpenChange,
  repoValidation,
  onContinue,
  onCancel,
}: ValidationDialogProps) {
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
            <div className="flex gap-2 pt-1">
              {repoValidation.isValid && (
                <Button size="sm" onClick={onContinue}>
                  Continue anyway
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
