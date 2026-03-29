'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export interface ValidationError {
  message: string;
  isError: boolean;
}

export type ViewMode = 'ascii' | 'interactive' | 'analysis';
export type ProviderType = 'github' | 'gitlab';
export type SourceTab = 'my-repos' | 'url';

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
    // ignore
  }
  return DEFAULT_OPTIONS;
};

const saveOptions = (options: TreeCustomizationOptions) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('treeCustomizationOptions', JSON.stringify(options));
  } catch {
    // ignore
  }
};

export interface RepoTreeGeneratorState {
  sourceTab: SourceTab;
  setSourceTab: (tab: SourceTab) => void;
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  repoType: ProviderType;
  setRepoType: (type: ProviderType) => void;
  structureMap: DirectoryMap;
  setStructureMap: (map: DirectoryMap) => void;
  loading: boolean;
  validation: ValidationError;
  setValidation: (v: ValidationError) => void;
  repoValidation: RepoValidationResult | null;
  showValidationDialog: boolean;
  setShowValidationDialog: (show: boolean) => void;
  copied: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  customizationOptions: TreeCustomizationOptions;
  fileTypeData: { name: string; value: number }[];
  languageData: { name: string; percentage: number }[];
  selectedRepoName: string | null;
  showStarNote: boolean;
  showDownloadMenu: boolean;
  setShowDownloadMenu: (show: boolean | ((v: boolean) => boolean)) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  outputRef: React.RefObject<HTMLDivElement | null>;
  isEmpty: boolean;
  hasOutput: boolean;
  showInputErrorBorder: boolean;
  filteredMap: DirectoryMap;
  treeString: string;
  validateUrl: (url: string) => ValidationError;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFetchStructure: (url?: string, skipValidation?: boolean) => Promise<void>;
  handleRepoSelect: (url: string, provider: string) => void;
  copyToClipboard: () => void;
  handleClearInput: () => void;
  handleDownload: (format: 'md' | 'txt' | 'json' | 'html') => void;
  handleCustomizationChange: (opts: Partial<TreeCustomizationOptions>) => void;
}

export function useRepoTreeGeneratorState(isAuthenticated: boolean): RepoTreeGeneratorState {
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
  const [showStarNote, setShowStarNote] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

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

  const validateUrl = useCallback(
    (url: string): ValidationError => {
      const trimmed = url.trim();
      if (!trimmed) return { message: 'Enter a repository URL', isError: true };
      if (repoType === 'github' && !/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(trimmed)) {
        return { message: 'Enter a valid GitHub URL', isError: true };
      }
      if (repoType === 'gitlab' && !/^https?:\/\/gitlab\.com\/[\w./-]+\/[\w.-]+\/?$/.test(trimmed)) {
        return { message: 'Enter a valid GitLab URL', isError: true };
      }
      return { message: '', isError: false };
    },
    [repoType]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setRepoUrl(url);
      if (url) localStorage.setItem('lastRepoUrl', url);
      setValidation(url.trim() ? validateUrl(url) : { message: '', isError: false });
    },
    [validateUrl]
  );

  const handleFetchStructure = useCallback(
    async (url: string = repoUrl, skipValidation = false) => {
      const currentRequestId = ++requestIdRef.current;
      const effectiveUrl = url ?? repoUrl;

      const check = validateUrl(effectiveUrl);
      if (check.isError && !skipValidation) {
        setValidation(check);
        setShowStarNote(false);
        return;
      }

      setShowStarNote(true);
      setLoading(true);
      try {
        const res = await fetch('/api/tree', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: effectiveUrl, providerType: repoType }),
        });

        if (currentRequestId !== requestIdRef.current) return;

        if (!res.ok) {
          let errorMessage = 'Failed to fetch repository';
          try {
            const data = await res.json();
            errorMessage = data.error ?? errorMessage;
          } catch {
            // Response was not valid JSON
          }
          throw new Error(errorMessage);
        }

        const { tree } = await res.json();

        if (currentRequestId !== requestIdRef.current) return;

        const repoVal = validateRepositoryStructure(tree);
        setRepoValidation(repoVal);

        if (!skipValidation && (!repoVal.isValid || repoVal.warnings.length > 0)) {
          setShowValidationDialog(true);
          setLoading(false);
          return;
        }

        const map = generateStructure(tree);
        setStructureMap(map);
        setValidation({ message: '', isError: false });
        localStorage.setItem('lastRepoUrl', effectiveUrl);

        const { fileTypes, languages } = analyzeRepository(map);
        setFileTypeData(fileTypes);
        setLanguageData(languages);
        setShowValidationDialog(false);

        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) return;

        setValidation({
          message: err instanceof Error ? err.message : 'Failed to fetch repository',
          isError: true,
        });
        setRepoValidation(null);
        setShowStarNote(false);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [repoUrl, repoType, validateUrl]
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
    const filtered: DirectoryMap = new Map();
    const lower = term.toLowerCase();
    for (const [key, value] of map.entries()) {
      if (value && typeof value === 'object' && 'type' in value && value.type === 'file') {
        if (key.toLowerCase().includes(lower)) filtered.set(key, value);
      } else if (value instanceof Map) {
        const sub = filterStructure(value, term);
        if (sub.size > 0 || key.toLowerCase().includes(lower)) filtered.set(key, sub);
      }
    }
    return filtered;
  }, []);

  const filteredMap = useMemo(
    () => filterStructure(structureMap, searchTerm),
    [filterStructure, structureMap, searchTerm]
  );

  const treeString = useMemo(() => {
    if (structureMap.size > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES) {
      return buildStructureString(filteredMap, customizationOptions, repoUrl, '', '', 20);
    }
    return buildStructureString(filteredMap, customizationOptions, repoUrl);
  }, [filteredMap, customizationOptions, structureMap.size, repoUrl]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(treeString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Clipboard write failed (permission denied, insecure context, etc.)
    });
  }, [treeString]);

  const handleClearInput = useCallback(() => {
    setRepoUrl('');
    setSelectedRepoName(null);
    localStorage.removeItem('lastRepoUrl');
    setStructureMap(new Map());
    setRepoValidation(null);
    setValidation({ message: '', isError: false });
    setShowStarNote(false);
    inputRef.current?.focus();
  }, []);

  const handleDownload = useCallback(
    (format: 'md' | 'txt' | 'json' | 'html') => {
      const configs = {
        md: {
          content: `# Repository Structure\n\n\`\`\`\n${treeString}\`\`\``,
          mime: 'text/markdown;charset=utf-8',
          name: 'README.md',
        },
        txt: { content: treeString, mime: 'text/plain;charset=utf-8', name: 'repository-structure.txt' },
        json: {
          content: JSON.stringify(convertMapToJson(filteredMap), null, 2),
          mime: 'application/json;charset=utf-8',
          name: 'repository-structure.json',
        },
        html: {
          content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:monospace;white-space:pre;padding:2rem}</style></head><body>${treeString}</body></html>`,
          mime: 'text/html;charset=utf-8',
          name: 'repository-structure.html',
        },
      };
      const { content, mime, name } = configs[format];
      saveAs(new Blob([content], { type: mime }), name);
      setShowDownloadMenu(false);
    },
    [treeString, filteredMap]
  );

  const handleCustomizationChange = useCallback((opts: Partial<TreeCustomizationOptions>) => {
    setCustomizationOptions((prev) => {
      const updated = { ...prev, ...opts };
      saveOptions(updated);
      return updated;
    });
  }, []);

  const isEmpty = structureMap.size === 0;
  const hasOutput = !isEmpty || loading || sourceTab === 'url';
  const showInputErrorBorder = validation.isError && repoUrl.trim().length > 0;

  return {
    sourceTab,
    setSourceTab,
    repoUrl,
    setRepoUrl,
    repoType,
    setRepoType,
    structureMap,
    setStructureMap,
    loading,
    validation,
    setValidation,
    repoValidation,
    showValidationDialog,
    setShowValidationDialog,
    copied,
    expanded,
    setExpanded,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    customizationOptions,
    fileTypeData,
    languageData,
    selectedRepoName,
    showStarNote,
    showDownloadMenu,
    setShowDownloadMenu,
    inputRef,
    outputRef,
    isEmpty,
    hasOutput,
    showInputErrorBorder,
    filteredMap,
    treeString,
    validateUrl,
    handleUrlChange,
    handleFetchStructure,
    handleRepoSelect,
    copyToClipboard,
    handleClearInput,
    handleDownload,
    handleCustomizationChange,
  };
}
