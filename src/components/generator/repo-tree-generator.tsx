'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import InteractiveTreeView from '@/components/interactive-tree-view';
import { RepoGraphs } from '@/components/repo-graphs';
import AuthStatus from '@/components/generator/auth-status';
import RepoBrowser from '@/components/generator/repo-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  analyzeRepository,
  buildStructureString,
  type DirectoryMap,
  generateStructure,
  validateRepositoryStructure,
  PERFORMANCE_THRESHOLDS,
  type RepoValidationResult,
} from '@/lib/repo-tree-utils';
import { detectProviderFromUrl } from '@/lib/providers';
import { convertMapToJson } from '@/lib/utils';
import type { TreeCustomizationOptions } from '@/types/tree-customization';
import { saveAs } from 'file-saver';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  CircleX,
  Copy,
  Download,
  FolderTree,
  Github,
  Info,
  List,
  ListTree,
  Maximize,
  Minimize,
  RefreshCw,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CustomizationOptions from '@/app/generator/customization-options';

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.49a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

interface ValidationError {
  message: string;
  isError: boolean;
}

type ViewMode = 'ascii' | 'interactive' | 'analysis';
type ProviderType = 'github' | 'gitlab';
type SourceTab = 'my-repos' | 'url';

const DEFAULT_OPTIONS: TreeCustomizationOptions = {
  asciiStyle: 'basic',
  useIcons: false,
  showLineNumbers: false,
  showDescriptions: false,
  showRootDirectory: false,
  showTrailingSlash: false,
};

const loadOptions = (): TreeCustomizationOptions => {
  if (typeof window === 'undefined') return DEFAULT_OPTIONS;
  try {
    const saved = localStorage.getItem('treeCustomizationOptions');
    if (saved) return { ...DEFAULT_OPTIONS, ...JSON.parse(saved) };
  } catch {
    // ignore malformed localStorage data
  }
  return DEFAULT_OPTIONS;
};

const saveOptions = (options: TreeCustomizationOptions) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('treeCustomizationOptions', JSON.stringify(options));
  } catch {
    // ignore localStorage write failures
  }
};

export default function RepoTreeGenerator() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.accessToken;

  const [sourceTab, setSourceTab] = useState<SourceTab>('url');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoType, setRepoType] = useState<ProviderType>('github');
  const [structureMap, setStructureMap] = useState<DirectoryMap>(new Map());
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationError>({ message: '', isError: false });
  const [repoValidation, setRepoValidation] = useState<RepoValidationResult | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('ascii');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<TreeCustomizationOptions>(loadOptions());
  const [fileTypeData, setFileTypeData] = useState<{ name: string; value: number }[]>([]);
  const [languageData, setLanguageData] = useState<{ name: string; percentage: number }[]>([]);
  const [selectedRepoName, setSelectedRepoName] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) setSourceTab('my-repos');
    else setSourceTab('url');
  }, [isAuthenticated]);

  useEffect(() => {
    const detected = detectProviderFromUrl(repoUrl);
    if (detected) setRepoType(detected);
  }, [repoUrl]);

  useEffect(() => {
    const saved = localStorage.getItem('lastRepoUrl');
    if (saved) setRepoUrl(saved);
  }, []);

  const validateRepoUrl = useCallback((url: string): ValidationError => {
    const trimmed = url.trim();

    if (!trimmed) {
      return { message: 'Enter a repository URL', isError: true };
    }

    if (repoType === 'github') {
      const isValidGitHub = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(trimmed);
      if (!isValidGitHub) {
        return { message: 'Enter a valid GitHub URL', isError: true };
      }
    }

    if (repoType === 'gitlab') {
      const isValidGitLab = /^https?:\/\/gitlab\.com\/[\w./-]+\/[\w.-]+\/?$/.test(trimmed);
      if (!isValidGitLab) {
        return { message: 'Enter a valid GitLab URL', isError: true };
      }
    }

    return { message: '', isError: false };
  }, [repoType]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);

    if (url) {
      localStorage.setItem('lastRepoUrl', url);
    }

    if (!url.trim()) {
      setValidation({ message: '', isError: false });
      return;
    }

    setValidation(validateRepoUrl(url));
  }, [validateRepoUrl]);

  const handleFetchStructure = useCallback(
    async (url: string = repoUrl, skipValidation = false) => {
      const nextValidation = validateRepoUrl(url);

      if (nextValidation.isError && !skipValidation) {
        setValidation(nextValidation);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/tree', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, providerType: repoType }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to fetch repository');
        }

        const { tree } = await res.json();
        const repoVal = validateRepositoryStructure(tree);
        setRepoValidation(repoVal);

        if (!skipValidation && !repoVal.isValid) {
          setShowValidationDialog(true);
          setLoading(false);
          return;
        }

        if (!skipValidation && repoVal.warnings.length > 0) {
          setShowValidationDialog(true);
          setLoading(false);
          return;
        }

        const map = generateStructure(tree);
        setStructureMap(map);
        setValidation({ message: '', isError: false });
        localStorage.setItem('lastRepoUrl', url);

        const { fileTypes, languages } = analyzeRepository(map);
        setFileTypeData(fileTypes);
        setLanguageData(languages);
        setShowValidationDialog(false);

        setTimeout(() => treeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch repository';
        setValidation({ message, isError: true });
        setRepoValidation(null);
      } finally {
        setLoading(false);
      }
    },
    [repoUrl, repoType, validateRepoUrl]
  );

  const handleRepoSelect = useCallback(
    (url: string, provider: string) => {
      setRepoUrl(url);
      setRepoType(provider as ProviderType);

      const parts = url.replace(/\/$/, '').split('/');
      setSelectedRepoName(parts[parts.length - 1]);

      setStructureMap(new Map());
      setValidation({ message: '', isError: false });
      setRepoValidation(null);
      setSearchTerm('');

      handleFetchStructure(url, false);
    },
    [handleFetchStructure]
  );

  const filterStructure = useCallback((map: DirectoryMap, term: string): DirectoryMap => {
    if (!term.trim()) return map;

    const filteredMap: DirectoryMap = new Map();
    const lowerTerm = term.toLowerCase();

    for (const [key, value] of map.entries()) {
      if (value && typeof value === 'object' && 'type' in value && value.type === 'file') {
        if (key.toLowerCase().includes(lowerTerm)) filteredMap.set(key, value);
      } else if (value instanceof Map) {
        const sub = filterStructure(value, term);
        if (sub.size > 0 || key.toLowerCase().includes(lowerTerm)) filteredMap.set(key, sub);
      }
    }

    return filteredMap;
  }, []);

  const filteredStructureMap = useMemo(
    () => filterStructure(structureMap, searchTerm),
    [filterStructure, structureMap, searchTerm]
  );

  const customizedStructure = useMemo(() => {
    if (structureMap.size > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES) {
      return buildStructureString(filteredStructureMap, customizationOptions, repoUrl, '', '', 20);
    }
    return buildStructureString(filteredStructureMap, customizationOptions, repoUrl);
  }, [filteredStructureMap, customizationOptions, structureMap.size, repoUrl]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(customizedStructure).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [customizedStructure]);

  const handleClearInput = useCallback(() => {
    setRepoUrl('');
    setSelectedRepoName(null);
    localStorage.removeItem('lastRepoUrl');
    setStructureMap(new Map());
    setRepoValidation(null);
    setValidation({ message: '', isError: false });
    inputRef.current?.focus();
  }, []);

  const handleDownload = useCallback(
    (format: 'md' | 'txt' | 'json' | 'html') => {
      let content: string;
      let mimeType: string;
      let fileName: string;

      switch (format) {
        case 'md':
          content = `# Directory Structure\n\n\`\`\`\n${customizedStructure}\`\`\``;
          mimeType = 'text/markdown;charset=utf-8';
          fileName = 'README.md';
          break;
        case 'txt':
          content = customizedStructure;
          mimeType = 'text/plain;charset=utf-8';
          fileName = 'directory-structure.txt';
          break;
        case 'json':
          content = JSON.stringify(convertMapToJson(filteredStructureMap), null, 2);
          mimeType = 'application/json;charset=utf-8';
          fileName = 'directory-structure.json';
          break;
        default:
          content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:monospace;white-space:pre;padding:2rem}</style></head><body>${customizedStructure}</body></html>`;
          mimeType = 'text/html;charset=utf-8';
          fileName = 'directory-structure.html';
      }

      saveAs(new Blob([content], { type: mimeType }), fileName);
      setShowDownloadMenu(false);
    },
    [customizedStructure, filteredStructureMap]
  );

  const handleCustomizationChange = (opts: Partial<TreeCustomizationOptions>) => {
    setCustomizationOptions((prev) => {
      const updated = { ...prev, ...opts };
      saveOptions(updated);
      return updated;
    });
  };

  const isEmpty = structureMap.size === 0;
  const showInputErrorBorder = validation.isError && repoUrl.trim().length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
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
                Repository processed: {repoValidation.totalEntries.toLocaleString()} entries, estimated size:{' '}
                {(repoValidation.estimatedSize / (1024 * 1024)).toFixed(2)}MB
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
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowValidationDialog(false);
                      handleFetchStructure(repoUrl, true);
                    }}
                  >
                    Continue anyway
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowValidationDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 pt-7 pb-5 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Repo<span className="text-blue-600">Tree</span> Generator
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate and share clean ASCII trees of your GitHub & GitLab repositories.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <AuthStatus />

          {repoValidation && !isEmpty && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                Repository processed: {repoValidation.totalEntries.toLocaleString()} entries, estimated size:{' '}
                {(repoValidation.estimatedSize / (1024 * 1024)).toFixed(2)}MB
                {repoValidation.totalEntries > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES &&
                  ' (Large repository - some features may be slower)'}
              </AlertDescription>
            </Alert>
          )}

          <div>
            {isAuthenticated && (
              <div className="flex items-center gap-0.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-4">
                <button
                  onClick={() => setSourceTab('my-repos')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    sourceTab === 'my-repos'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List size={14} />
                  My Repositories
                </button>

                <button
                  onClick={() => setSourceTab('url')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    sourceTab === 'url'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Paste URL
                </button>
              </div>
            )}

            {sourceTab === 'my-repos' && isAuthenticated && <RepoBrowser onSelect={handleRepoSelect} />}

            {sourceTab === 'url' && (
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative sm:w-36 flex-shrink-0">
                    <select
                      value={repoType}
                      onChange={(e) => {
                        const nextType = e.target.value as ProviderType;
                        setRepoType(nextType);

                        if (repoUrl.trim()) {
                          const trimmed = repoUrl.trim();
                          if (nextType === 'github') {
                            const isValidGitHub = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(trimmed);
                            setValidation(
                              isValidGitHub
                                ? { message: '', isError: false }
                                : { message: 'Enter a valid GitHub URL', isError: true }
                            );
                          } else {
                            const isValidGitLab = /^https?:\/\/gitlab\.com\/[\w./-]+\/[\w.-]+\/?$/.test(trimmed);
                            setValidation(
                              isValidGitLab
                                ? { message: '', isError: false }
                                : { message: 'Enter a valid GitLab URL', isError: true }
                            );
                          }
                        } else {
                          setValidation({ message: '', isError: false });
                        }
                      }}
                      className="w-full h-10 pl-3 pr-8 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                    >
                      <option value="github">GitHub</option>
                      <option value="gitlab">GitLab</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={13} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={repoUrl}
                      onChange={handleUrlChange}
                      onKeyDown={(e) => e.key === 'Enter' && !loading && handleFetchStructure()}
                      placeholder={
                        repoType === 'github'
                          ? 'https://github.com/username/repo'
                          : 'https://gitlab.com/username/repo'
                      }
                      className={`h-10 pl-3 pr-9 text-sm rounded-xl transition-colors ${
                        showInputErrorBorder
                          ? 'border-red-300 dark:border-red-700 focus-visible:ring-red-300'
                          : 'border-gray-200 dark:border-gray-700 focus-visible:ring-blue-300'
                      }`}
                    />
                    {repoUrl && (
                      <button
                        onClick={handleClearInput}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Clear repository URL"
                      >
                        <CircleX size={15} />
                      </button>
                    )}
                  </div>

                  <Button
                    onClick={() => handleFetchStructure()}
                    disabled={loading || (validation.isError && !!repoUrl)}
                    className="h-10 px-5 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
                  >
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin mr-1.5" />
                    ) : repoType === 'github' ? (
                      <Github size={14} className="mr-1.5" />
                    ) : (
                      <GitLabIcon className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {loading ? 'Generating…' : 'Generate'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {(loading || !isEmpty || sourceTab === 'url') && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" ref={treeRef}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 gap-2">
                <div className="flex items-center gap-0.5">
                  {(['ascii', 'interactive', 'analysis'] as ViewMode[]).map((mode) => {
                    const Icon = mode === 'ascii' ? ListTree : mode === 'interactive' ? FolderTree : BarChart3;
                    return (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        disabled={mode === 'analysis' && isEmpty}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          viewMode === mode
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        <Icon size={12} />
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    );
                  })}

                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors ml-0.5">
                        <Settings size={13} />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-sm">Customization</DialogTitle>
                      </DialogHeader>
                      <CustomizationOptions options={customizationOptions} onChange={handleCustomizationChange} />
                    </DialogContent>
                  </Dialog>
                </div>

                {viewMode !== 'analysis' && (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-40">
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-7 pl-7 pr-2 text-xs rounded-lg bg-white dark:bg-gray-800"
                      />
                      <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setShowDownloadMenu((v) => !v)}
                        disabled={isEmpty}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <Download size={11} />
                        <span className="hidden sm:inline">Download</span>
                        <ChevronDown size={10} />
                      </button>

                      {showDownloadMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[100px] z-10">
                          {(['txt', 'md', 'json', 'html'] as const).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => handleDownload(fmt)}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              .{fmt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={copyToClipboard}
                      disabled={isEmpty}
                      title="Copy"
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        copied
                          ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </button>

                    <button
                      onClick={() => setExpanded((v) => !v)}
                      title={expanded ? 'Collapse' : 'Expand'}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {expanded ? <Minimize size={13} /> : <Maximize size={13} />}
                    </button>
                  </div>
                )}
              </div>

              {viewMode === 'ascii' ? (
                customizedStructure ? (
                  <SyntaxHighlighter
                    language="plaintext"
                    style={atomDark}
                    className={`${expanded ? 'max-h-none' : 'max-h-96'} overflow-y-auto min-h-[200px] !rounded-none !m-0`}
                    showLineNumbers={customizationOptions.showLineNumbers}
                    wrapLines
                    customStyle={{ margin: 0, borderRadius: 0, border: 'none', fontSize: '13px' }}
                  >
                    {customizedStructure}
                  </SyntaxHighlighter>
                ) : (
                  <EmptyOutput
                    loading={loading}
                    error={validation.isError ? validation.message : null}
                    provider={repoType}
                    repoName={selectedRepoName}
                  />
                )
              ) : viewMode === 'interactive' ? (
                filteredStructureMap.size > 0 ? (
                  <div className="bg-[#1e293b] min-h-[200px] p-4">
                    <InteractiveTreeView structure={filteredStructureMap} customizationOptions={customizationOptions} />
                  </div>
                ) : (
                  <EmptyOutput
                    loading={loading}
                    error={validation.isError ? validation.message : null}
                    provider={repoType}
                    repoName={selectedRepoName}
                  />
                )
              ) : isEmpty ? (
                <EmptyOutput
                  loading={loading}
                  error={validation.isError ? validation.message : null}
                  provider={repoType}
                  repoName={selectedRepoName}
                />
              ) : (
                <div className="p-6 bg-white dark:bg-gray-900">
                  <RepoGraphs fileTypeData={fileTypeData} languageData={languageData} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDownloadMenu && <div className="fixed inset-0 z-0" onClick={() => setShowDownloadMenu(false)} />}
    </div>
  );
}

function EmptyOutput({
  loading,
  error,
  provider,
  repoName,
}: {
  loading: boolean;
  error: string | null;
  provider: string;
  repoName: string | null;
}) {
  if (loading) {
    return (
      <div className="bg-[#1d1f21] min-h-[200px] flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs text-gray-300 font-mono">
          {repoName ? `Fetching ${repoName}…` : 'Fetching repository structure…'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1d1f21] min-h-[200px] flex items-center justify-center p-6">
        <div className="flex items-start gap-2.5 text-red-400 max-w-sm">
          <X size={14} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1d1f21] min-h-[200px] flex items-center justify-center">
      <p className="text-sm text-gray-300 font-mono">
        Enter a {provider === 'github' ? 'GitHub' : 'GitLab'} URL and click Generate
      </p>
    </div>
  );
}
