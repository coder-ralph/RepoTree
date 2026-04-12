'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  analyzeRepository,
  buildStructureString,
  type DirectoryMap,
  generateStructure,
  validateRepositoryStructure,
  PERFORMANCE_THRESHOLDS,
  GITHUB_LIMITS,
  type RepoValidationResult,
  type EntryCounts,
  type TreeItem,
  countEntries,
  FilterOptions,
  filterTreeEntries,
  sortTreeEntries,
} from '@/lib/repo-tree-utils';
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
  sortOrder: 'default',
  hideHiddenFiles: false,
  includePatterns: '',
  focusPath: '',
};

const loadOptions = (): TreeCustomizationOptions => {
  if (typeof window === 'undefined') return DEFAULT_OPTIONS;
  try {
    const saved = localStorage.getItem('treeCustomizationOptions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated: TreeCustomizationOptions = {
        ...DEFAULT_OPTIONS,
        asciiStyle: parsed.asciiStyle ?? DEFAULT_OPTIONS.asciiStyle,
        useIcons: parsed.useIcons ?? DEFAULT_OPTIONS.useIcons,
        showLineNumbers: parsed.showLineNumbers ?? DEFAULT_OPTIONS.showLineNumbers,
        showDescriptions: parsed.showDescriptions ?? DEFAULT_OPTIONS.showDescriptions,
        showRootDirectory: parsed.showRootDirectory ?? DEFAULT_OPTIONS.showRootDirectory,
        showTrailingSlash: parsed.showTrailingSlash ?? DEFAULT_OPTIONS.showTrailingSlash,
        sortOrder: parsed.sortOrder ?? DEFAULT_OPTIONS.sortOrder,
        hideHiddenFiles: parsed.showHiddenFiles === false || DEFAULT_OPTIONS.hideHiddenFiles,
        includePatterns: parsed.includePatterns ?? DEFAULT_OPTIONS.includePatterns,
        focusPath: parsed.focusPath ?? DEFAULT_OPTIONS.focusPath,
      };
      return migrated;
    }
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
  loading: boolean;
  validation: ValidationError;
  setValidation: (v: ValidationError) => void;
  repoValidation: RepoValidationResult | null;
  showValidationDialog: boolean;
  setShowValidationDialog: (show: boolean) => void;
  allowLargeRepo: boolean;
  setAllowLargeRepo: (allow: boolean) => void;
  copied: boolean;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  customizationOptions: TreeCustomizationOptions;
  maxDepth: number | null;
  setMaxDepth: (depth: number | null) => void;
  excludePatterns: string[];
  setExcludePatterns: (patterns: string[]) => void;
  excludePatternsInput: string;
  setExcludePatternsInput: (input: string) => void;
  fileTypeData: { name: string; value: number }[];
  languageData: { name: string; percentage: number }[];
  selectedRepoName: string | null;
  showStarNote: boolean;
  showDownloadMenu: boolean;
  setShowDownloadMenu: (show: boolean | ((v: boolean) => boolean)) => void;
  showExportImageMenu: boolean;
  setShowExportImageMenu: (show: boolean | ((v: boolean) => boolean)) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  outputRef: React.RefObject<HTMLDivElement | null>;
  isEmpty: boolean;
  hasOutput: boolean;
  showInputErrorBorder: boolean;
  filteredMap: DirectoryMap;
  treeString: string;
  entryCounts: EntryCounts;
  isLargeExport: boolean;
  rawTree: TreeItem[];
  filteredTree: TreeItem[];
  validateUrl: (url: string, provider?: ProviderType) => ValidationError;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFetchStructure: (url?: string, skipValidation?: boolean) => Promise<void>;
  handleValidateAndGenerate: (skipValidation?: boolean) => Promise<void>;
  handleRepoSelect: (url: string, provider: string) => void;
  copyToClipboard: () => void;
  handleClearInput: () => void;
  handleDownload: (format: 'md' | 'txt' | 'json' | 'html') => void;
  handleExportImage: (format: 'png' | 'svg', repoUrl?: string) => void;
  handleCustomizationChange: (opts: Partial<TreeCustomizationOptions>) => void;
}

export function useRepoTreeGeneratorState(isAuthenticated: boolean): RepoTreeGeneratorState {
  const [sourceTab, setSourceTab] = useState<SourceTab>('url');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoType, setRepoType] = useState<ProviderType>('github');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationError>({ message: '', isError: false });
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [allowLargeRepo, setAllowLargeRepo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('ascii');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showExportImageMenu, setShowExportImageMenu] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<TreeCustomizationOptions>(loadOptions());
  const [selectedRepoName, setSelectedRepoName] = useState<string | null>(null);
  const [showStarNote, setShowStarNote] = useState(false);
  const [maxDepth, setMaxDepth] = useState<number | null>(null);
  const [excludePatternsInput, setExcludePatternsInput] = useState('');
  const [rawTree, setRawTree] = useState<TreeItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const excludePatternsList = useMemo(
    () => excludePatternsInput.split(',').map(p => p.trim()).filter(Boolean),
    [excludePatternsInput]
  );

  const includePatternsList = useMemo(
    () => customizationOptions.includePatterns.split(',').map(p => p.trim()).filter(Boolean),
    [customizationOptions.includePatterns]
  );

  const filterOptions = useMemo<FilterOptions>(() => ({
    maxDepth,
    excludePatterns: excludePatternsList,
    includePatterns: includePatternsList,
    focusPath: customizationOptions.focusPath || null,
    hideHiddenFiles: customizationOptions.hideHiddenFiles,
    sortOrder: customizationOptions.sortOrder,
  }), [maxDepth, excludePatternsList, includePatternsList, customizationOptions.focusPath, customizationOptions.hideHiddenFiles, customizationOptions.sortOrder]);

  const filteredTree = useMemo(() => {
    if (rawTree.length === 0) return [];
    return sortTreeEntries(filterTreeEntries(rawTree, filterOptions), filterOptions.sortOrder);
  }, [rawTree, filterOptions]);

  const structureMap = useMemo(() => {
    if (rawTree.length === 0) return new Map() as DirectoryMap;
    return generateStructure(rawTree, filterOptions);
  }, [rawTree, filterOptions]);

  const repoValidation = useMemo(() => {
    if (filteredTree.length === 0) return null;
    return validateRepositoryStructure(filteredTree);
  }, [filteredTree]);

  const { fileTypes: fileTypeData, languages: languageData } = useMemo(() => {
    if (structureMap.size === 0) return { fileTypes: [], languages: [] };
    return analyzeRepository(structureMap);
  }, [structureMap]);

  useEffect(() => {
    if (isAuthenticated) setSourceTab('my-repos');
    else setSourceTab('url');
  }, [isAuthenticated]);

  useEffect(() => {
    const saved = localStorage.getItem('lastRepoUrl');
    if (saved) setRepoUrl(saved);
  }, []);

  const validateUrl = useCallback(
    (url: string, provider?: ProviderType): ValidationError => {
      const trimmed = url.trim();
      if (!trimmed) return { message: 'Enter a repository URL', isError: true };
      const effectiveProvider = provider ?? repoType;
      if (effectiveProvider === 'github' && !/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(trimmed)) {
        return { message: 'Enter a valid GitHub URL', isError: true };
      }
      if (effectiveProvider === 'gitlab' && !/^https?:\/\/gitlab\.com\/[\w./-]+\/[\w.-]+\/?$/.test(trimmed)) {
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
          body: JSON.stringify({ 
            url: effectiveUrl, 
            providerType: repoType
          }),
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

        setRawTree(tree);
        
        const filteredForValidation = sortTreeEntries(filterTreeEntries(tree, filterOptions), filterOptions.sortOrder);
        const validationResult = validateRepositoryStructure(filteredForValidation);
        
        if (!allowLargeRepo && (!validationResult.isValid || validationResult.warnings.length > 0)) {
          setShowValidationDialog(true);
          setLoading(false);
          return;
        }
        
        setValidation({ message: '', isError: false });
        localStorage.setItem('lastRepoUrl', effectiveUrl);

        setShowValidationDialog(false);

        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) return;

        setValidation({
          message: err instanceof Error ? err.message : 'Failed to fetch repository',
          isError: true,
        });
        setShowStarNote(false);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [repoUrl, repoType, validateUrl, filterOptions, allowLargeRepo]
  );

  const handleValidateAndGenerate = useCallback(
    async () => {
      if (!allowLargeRepo && repoValidation && (!repoValidation.isValid || repoValidation.warnings.length > 0)) {
        setShowValidationDialog(true);
      }
    },
    [repoValidation, allowLargeRepo]
  );

  const handleRepoSelect = useCallback(
    (url: string, provider: string) => {
      setRepoUrl(url);
      setRepoType(provider as ProviderType);
      const parts = url.replace(/\/$/, '').split('/');
      setSelectedRepoName(parts[parts.length - 1]);
      setRawTree([]);
      setValidation({ message: '', isError: false });
      setSearchTerm('');
      setAllowLargeRepo(false);
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
    setRawTree([]);
    setValidation({ message: '', isError: false });
    setShowStarNote(false);
    setAllowLargeRepo(false);
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

  const handleExportImage = useCallback(async (format: 'png' | 'svg', repoUrl?: string) => {
    if (format === 'png' && repoValidation && (repoValidation.totalEntries > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES || repoValidation.estimatedSize > GITHUB_LIMITS.MAX_SIZE_BYTES)) {
      return;
    }

    const sanitizeRepoName = (name: string | null): string => {
      if (!name) return 'repository';
      return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    };

    const extractOwnerAndRepo = (url: string): { owner: string | null; repo: string | null } => {
      try {
        const match = url.match(/\/(?:github|gitlab)\.com\/([^/]+)\/([^/]+)/);
        if (match) {
          return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
        }
      } catch {
        // ignore
      }
      return { owner: null, repo: null };
    };

    const { owner, repo } = extractOwnerAndRepo(repoUrl || '');
    const repoNameForFilename = sanitizeRepoName(selectedRepoName || repo);
    const headerTitle = owner && repo ? `${owner}/${repo}` : (selectedRepoName || repo || 'Repository');

    const lines = treeString.split('\n');
    const fontSize = 13;
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1.6;
    const padding = { top: 24, right: 32, bottom: 24, left: 32 };
    const headerHeight = 48;
    const watermarkHeight = 32;
    const titleBarPadding = 20;

    const maxLen = Math.max(...lines.map(l => l.length), 0);
    const contentWidth = maxLen * charWidth;
    const contentHeight = lines.length * lineHeight;
    const cardWidth = Math.max(600, contentWidth + padding.left + padding.right + titleBarPadding * 2);
    const cardHeight = headerHeight + contentHeight + padding.top + padding.bottom + watermarkHeight;

    const headerCenterY = padding.top + headerHeight / 2;
    const footerY = padding.top + headerHeight + contentHeight + padding.bottom;
    const dotRadius = 5;
    const dotSpacing = 14;
    const dotStartX = 20 + 16;

    const escapeXml = (str: string): string => {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const buildSvgContent = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(cardWidth)}" height="${Math.ceil(cardHeight)}" viewBox="0 0 ${Math.ceil(cardWidth)} ${Math.ceil(cardHeight)}" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace">
  <defs>
    <linearGradient id="treeExportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="50%" stop-color="#764ba2"/>
      <stop offset="100%" stop-color="#f093fb"/>
    </linearGradient>
    <filter id="treeExportShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${Math.ceil(cardWidth)}" height="${Math.ceil(cardHeight)}" fill="url(#treeExportGradient)"/>
  <rect x="20" y="20" width="${Math.ceil(cardWidth) - 40}" height="${Math.ceil(cardHeight) - 40}" rx="16" ry="16" fill="#0d1117" filter="url(#treeExportShadow)"/>
  <rect x="20" y="20" width="${Math.ceil(cardWidth) - 40}" height="48" rx="16" ry="16" fill="#161b22"/>
  <rect x="20" y="52" width="${Math.ceil(cardWidth) - 40}" height="16" fill="#161b22"/>
  <circle cx="${dotStartX}" cy="${headerCenterY}" r="${dotRadius}" fill="#ff5f57"/>
  <circle cx="${dotStartX + dotSpacing}" cy="${headerCenterY}" r="${dotRadius}" fill="#febc2e"/>
  <circle cx="${dotStartX + dotSpacing * 2}" cy="${headerCenterY}" r="${dotRadius}" fill="#28c840"/>
  <text x="${Math.ceil(cardWidth / 2)}" y="${headerCenterY + 1}" text-anchor="middle" dominant-baseline="middle" fill="#e6edf3" font-size="${fontSize}" font-weight="500">${escapeXml(headerTitle)}</text>
  ${lines.map((line, i) => `<text x="${padding.left + titleBarPadding}" y="${padding.top + headerHeight + (lineHeight * 0.75) + (i * lineHeight)}" fill="#8b949e" font-size="${fontSize}">${escapeXml(line)}</text>`).join('')}
  <text x="${Math.ceil(cardWidth / 2)}" y="${footerY}" text-anchor="middle" dominant-baseline="middle" fill="white" fill-opacity="0.4" font-size="10" font-weight="400">Generated by RepoTree</text>
</svg>`;

    const filename = `${repoNameForFilename}-tree`;

    if (format === 'svg') {
      const svgContent = buildSvgContent();
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, `${filename}.svg`);
    } else {
      const container = document.createElement('div');
      container.style.cssText = 'position: absolute; left: -9999px; top: -9999px; display: inline-block; pointer-events: none;';
      document.body.appendChild(container);

      const wrapper = document.createElement('div');
      container.appendChild(wrapper);

      try {
        wrapper.innerHTML = buildSvgContent();
        const svgElement = wrapper.querySelector('svg');
        if (!svgElement) throw new Error('SVG not rendered');

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const img = new Image();
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const scale = 2;
            canvas.width = svgElement.clientWidth * scale;
            canvas.height = svgElement.clientHeight * scale;
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load SVG'));
          };
          img.src = url;
        });

        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, `${filename}.png`);
          document.body.removeChild(container);
        }, 'image/png');
      } catch (error) {
        console.error('Error exporting PNG:', error);
        document.body.removeChild(container);
      }
    }

    setShowExportImageMenu(false);
  }, [treeString, selectedRepoName, repoValidation]);

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
    loading,
    validation,
    setValidation,
    repoValidation,
    showValidationDialog,
    setShowValidationDialog,
    allowLargeRepo,
    setAllowLargeRepo,
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
    showExportImageMenu,
    setShowExportImageMenu,
    inputRef,
    outputRef,
    isEmpty,
    hasOutput,
    showInputErrorBorder,
    filteredMap,
    treeString,
    entryCounts: structureMap.size > 0 ? countEntries(structureMap) : { folders: 0, files: 0 },
    isLargeExport: repoValidation !== null && (repoValidation.totalEntries > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES || repoValidation.estimatedSize > GITHUB_LIMITS.MAX_SIZE_BYTES),
    rawTree,
    filteredTree,
    maxDepth,
    setMaxDepth,
    excludePatterns: excludePatternsList,
    setExcludePatterns: (patterns: string[]) => setExcludePatternsInput(patterns.join(', ')),
    excludePatternsInput,
    setExcludePatternsInput,
    validateUrl,
    handleUrlChange,
    handleFetchStructure,
    handleValidateAndGenerate,
    handleRepoSelect,
    copyToClipboard,
    handleClearInput,
    handleDownload,
    handleExportImage,
    handleCustomizationChange,
  };
}
