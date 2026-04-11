'use client';

import React from 'react';
import InteractiveTreeView from '@/components/interactive-tree-view';
import { RepoGraphs } from '@/components/repo-graphs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomizationOptions from '@/app/generator/customization-options';
import OutputPlaceholder from './output-placeholder';
import {
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  Download,
  FolderTree,
  Image as ImageIcon,
  ListTree,
  Maximize,
  Minimize,
  Search,
  Settings,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { TreeCustomizationOptions } from '@/types/tree-customization';
import type { DirectoryMap } from '@/lib/repo-tree-utils';
import type { ViewMode } from '@/hooks/use-repo-tree-generator-state';

function NoResultsMessage({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="bg-[#1d1f21] min-h-[220px] flex flex-col items-center justify-center px-6 gap-1">
      <p className="text-sm text-gray-400 font-mono text-center">
        No files or folders found matching &ldquo;{searchTerm}&rdquo;
      </p>
      <p className="text-xs text-gray-600 font-mono text-center mt-2">
        Check the spelling
      </p>
      <p className="text-xs text-gray-600 font-mono text-center">
        Try searching for partial names
      </p>
      <p className="text-xs text-gray-600 font-mono text-center">
        Include file extensions (.js, .ts, .json)
      </p>
    </div>
  );
}

interface OutputViewerProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isEmpty: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  treeString: string;
  structureMap: DirectoryMap;
  filteredMap: DirectoryMap;
  customizationOptions: TreeCustomizationOptions;
  onCustomizationChange: (opts: Partial<TreeCustomizationOptions>) => void;
  loading: boolean;
  validationError: string | null;
  repoType: string;
  repoName: string | null;
  repoUrl: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: (format: 'md' | 'txt' | 'json' | 'html') => void;
  showDownloadMenu: boolean;
  setShowDownloadMenu: (show: boolean | ((v: boolean) => boolean)) => void;
  onExportImage: (format: 'png' | 'svg', repoUrl?: string) => void;
  showExportImageMenu: boolean;
  setShowExportImageMenu: (show: boolean | ((v: boolean) => boolean)) => void;
  isLargeExport: boolean;
  fileTypeData: { name: string; value: number }[];
  languageData: { name: string; percentage: number }[];
  outputRef: React.RefObject<HTMLDivElement | null>;
}

export default function OutputViewer({
  viewMode,
  setViewMode,
  isEmpty,
  expanded,
  setExpanded,
  searchTerm,
  setSearchTerm,
  treeString,
  structureMap,
  filteredMap,
  customizationOptions,
  onCustomizationChange,
  loading,
  validationError,
  repoType,
  repoName,
  repoUrl,
  copied,
  onCopy,
  onDownload,
  showDownloadMenu,
  setShowDownloadMenu,
  onExportImage,
  showExportImageMenu,
  setShowExportImageMenu,
  isLargeExport,
  fileTypeData,
  languageData,
  outputRef,
}: OutputViewerProps) {
  return (
    <div ref={outputRef as React.RefObject<HTMLDivElement>} className="border-t border-gray-100 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/60">
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {(['ascii', 'interactive', 'analysis'] as ViewMode[]).map((mode) => {
            const Icon = mode === 'ascii' ? ListTree : mode === 'interactive' ? FolderTree : BarChart3;
            const label = mode === 'ascii' ? 'ASCII' : mode === 'interactive' ? 'Interactive' : 'Analysis';
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                disabled={mode === 'analysis' && isEmpty}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}

          <Dialog>
            <DialogTrigger asChild>
              <button
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors ml-0.5"
                aria-label="Customization options"
              >
                <Settings size={13} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-sm">Customization</DialogTitle>
              </DialogHeader>
              <CustomizationOptions options={customizationOptions} onChange={onCustomizationChange} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1" />

        {viewMode !== 'analysis' && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative hidden xs:flex sm:flex">
              <Input
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 w-28 sm:w-36 pl-7 pr-2 text-xs rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu((v) => !v)}
                disabled={isEmpty}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Download size={12} />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown size={10} />
              </button>
              {showDownloadMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[110px] z-20">
                  {(['txt', 'md', 'json', 'html'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => onDownload(fmt)}
                      className="w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      .{fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowExportImageMenu((v) => !v)}
                disabled={isEmpty}
                aria-label="Export Image"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ImageIcon size={12} aria-hidden="true" />
                <span className="hidden sm:inline">Export Image</span>
                <ChevronDown size={10} aria-hidden="true" />
              </button>
              {showExportImageMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[160px] z-20">
                  {(['png', 'svg'] as const).map((fmt) => {
                    const isPngDisabled = fmt === 'png' && isLargeExport;
                    return (
                      <button
                        key={fmt}
                        onClick={() => !isPngDisabled && onExportImage(fmt, repoUrl)}
                        disabled={isPngDisabled}
                        aria-label={`Save as ${fmt.toUpperCase()}${isPngDisabled ? ' (disabled)' : ''}`}
                        title={isPngDisabled ? 'PNG export is disabled for large repositories due to browser limitations. Use SVG export instead.' : undefined}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center gap-2 ${
                          isPngDisabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <ImageIcon size={12} className={isPngDisabled ? 'text-gray-300' : 'text-gray-400'} aria-hidden="true" />
                        Save .{fmt.toUpperCase()}
                      </button>
                    );
                  })}
                  {isLargeExport && (
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                      PNG disabled for large repos. Use SVG.
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onCopy}
              disabled={isEmpty}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                copied
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {expanded ? <Minimize size={13} /> : <Maximize size={13} />}
            </button>
          </div>
        )}
      </div>

      {viewMode !== 'analysis' && (
        <div className="flex xs:hidden sm:hidden px-3 pb-2 bg-gray-50 dark:bg-gray-800/60">
          <div className="relative w-full">
            <Input
              placeholder="Search files and folders…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-full pl-7 pr-3 text-xs rounded-lg bg-white dark:bg-gray-800"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {viewMode === 'ascii' ? (
        treeString ? (
          <SyntaxHighlighter
            language="plaintext"
            style={atomDark}
            className={`${expanded ? 'max-h-none' : 'max-h-[480px]'} overflow-y-auto min-h-[220px] !rounded-none !m-0`}
            showLineNumbers={customizationOptions.showLineNumbers}
            wrapLines
            customStyle={{ margin: 0, borderRadius: 0, border: 'none', fontSize: '13px', lineHeight: '1.6' }}
          >
            {treeString}
          </SyntaxHighlighter>
        ) : searchTerm && structureMap.size > 0 ? (
          <NoResultsMessage searchTerm={searchTerm} />
        ) : (
          <OutputPlaceholder loading={loading} error={validationError} provider={repoType} repoName={repoName} />
        )
      ) : viewMode === 'interactive' ? (
        filteredMap.size > 0 ? (
          <div className="bg-[#1e293b] min-h-[220px] p-4">
            <InteractiveTreeView structure={filteredMap} customizationOptions={customizationOptions} />
          </div>
        ) : searchTerm && structureMap.size > 0 ? (
          <NoResultsMessage searchTerm={searchTerm} />
        ) : (
          <OutputPlaceholder loading={loading} error={validationError} provider={repoType} repoName={repoName} />
        )
      ) : isEmpty ? (
        <OutputPlaceholder loading={loading} error={null} provider={repoType} repoName={repoName} />
      ) : (
        <div className="p-5 sm:p-6 bg-white dark:bg-gray-900">
          <RepoGraphs fileTypeData={fileTypeData} languageData={languageData} />
        </div>
      )}
    </div>
  );
}
