import type { TreeCustomizationOptions } from '@/types/tree-customization';

export interface TreeItem {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  size?: number;
}

export type DirectoryMap = Map<string, DirectoryMap | { type: 'file'; name: string }>;

export const GITHUB_LIMITS = {
  MAX_ENTRIES: 100000,
  MAX_SIZE_MB: 7,
  MAX_SIZE_BYTES: 7 * 1024 * 1024,
};

export const PERFORMANCE_THRESHOLDS = {
  LARGE_REPO_ENTRIES: 10000,
  MAX_RECOMMENDED_ENTRIES: 50000,
};

export interface RepoValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  totalEntries: number;
  estimatedSize: number;
}

export const validateRepositoryStructure = (tree: TreeItem[]): RepoValidationResult => {
  const result: RepoValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    totalEntries: tree.length,
    estimatedSize: 0,
  };

  result.estimatedSize = tree.reduce((total, item) => total + (item.path.length * 2) + 200, 0);

  if (result.totalEntries > GITHUB_LIMITS.MAX_ENTRIES) {
    result.isValid = false;
    result.errors.push(
      `Repository exceeds the ${GITHUB_LIMITS.MAX_ENTRIES.toLocaleString()}-entry limit. Found ${result.totalEntries.toLocaleString()} entries.`
    );
  }

  if (result.estimatedSize > GITHUB_LIMITS.MAX_SIZE_BYTES) {
    result.isValid = false;
    result.errors.push(
      `This repository exceeds GitHub's recommended API limits (${GITHUB_LIMITS.MAX_SIZE_MB}MB). Processing may fail or be incomplete.`
    );
  }

  if (result.errors.length === 0) {
    if (result.totalEntries > PERFORMANCE_THRESHOLDS.MAX_RECOMMENDED_ENTRIES) {
      result.warnings.push(
        `Large repository (${result.totalEntries.toLocaleString()} entries). Performance may be affected.`
      );
    } else if (result.totalEntries > PERFORMANCE_THRESHOLDS.LARGE_REPO_ENTRIES) {
      result.warnings.push(
        `Medium-sized repository (${result.totalEntries.toLocaleString()} entries). Processing may take a moment.`
      );
    }
  }

  return result;
};

export const generateStructure = (tree: TreeItem[], options?: FilterOptions): DirectoryMap => {
  const filteredTree = options ? filterTreeEntries(tree, options) : tree;
  
  const structureMap: DirectoryMap = new Map();
  const sortedTree = [...filteredTree].sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sortedTree) {
    const parts = item.path.split('/');
    let currentLevel: DirectoryMap = structureMap;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      if (i === parts.length - 1 && item.type === 'blob') {
        currentLevel.set(part, { type: 'file', name: item.name });
      } else {
        if (!currentLevel.has(part)) {
          currentLevel.set(part, new Map() as DirectoryMap);
        }
        const next = currentLevel.get(part);
        if (next instanceof Map) currentLevel = next;
      }
    }
  }

  return structureMap;
};

export const extractRepoName = (repoUrl: string): string => {
  try {
    const parts = repoUrl.replace(/\/$/, '').split('/');
    return parts[parts.length - 1] || 'Repository';
  } catch {
    return 'Repository';
  }
};

const descriptionCache = new Map<string, string>();

const getDescription = (name: string, isDirectory: boolean, path?: string): string => {
  const cacheKey = `${name}:${isDirectory}:${path}`;
  if (descriptionCache.has(cacheKey)) return descriptionCache.get(cacheKey)!;

  const description = isDirectory
    ? getDirectoryDescription(name)
    : getFileDescription(name);

  if (descriptionCache.size < 1000) descriptionCache.set(cacheKey, description);
  return description;
};

const getDirectoryDescription = (dirName: string): string => {
  const map: Record<string, string> = {
    src: 'Source code',
    app: 'Application pages and routing',
    components: 'React components',
    lib: 'Utility functions and libraries',
    utils: 'Utility functions',
    hooks: 'Custom React hooks',
    types: 'TypeScript type definitions',
    styles: 'CSS and styling files',
    api: 'API routes and endpoints',
    public: 'Static assets',
    assets: 'Project assets',
    config: 'Configuration files',
    tests: 'Test files',
    '__tests__': 'Jest test files',
    docs: 'Documentation',
    '.github': 'GitHub workflows and templates',
    '.vscode': 'VS Code workspace settings',
    node_modules: 'NPM dependencies',
    dist: 'Build output',
    build: 'Compiled files',
  };
  return map[dirName.toLowerCase()] ?? 'Directory';
};

const getFileDescription = (fileName: string): string => {
  const specific: Record<string, string> = {
    'readme.md': 'Project documentation',
    'package.json': 'NPM package configuration',
    'tsconfig.json': 'TypeScript configuration',
    '.gitignore': 'Git ignore rules',
    '.env': 'Environment variables',
    '.env.example': 'Environment variables template',
    'next.config.ts': 'Next.js configuration',
    'next.config.js': 'Next.js configuration',
    'tailwind.config.ts': 'Tailwind CSS configuration',
  };

  const lower = fileName.toLowerCase();
  if (specific[lower]) return specific[lower];

  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const extMap: Record<string, string> = {
    ts: 'TypeScript file',
    tsx: 'React TypeScript component',
    js: 'JavaScript file',
    jsx: 'React component',
    css: 'Stylesheet',
    scss: 'Sass stylesheet',
    md: 'Markdown documentation',
    json: 'JSON configuration',
    yaml: 'YAML configuration',
    yml: 'YAML configuration',
    svg: 'SVG vector image',
    png: 'PNG image',
    jpg: 'JPEG image',
    sh: 'Shell script',
    sql: 'SQL script',
    py: 'Python script',
    go: 'Go source file',
    rs: 'Rust source file',
  };

  return extMap[ext] ?? 'File';
};

const getConnector = (isLast: boolean, style: string): string => {
  if (style === 'detailed') return isLast ? '└─── ' : '├─── ';
  if (style === 'minimal') return '  ';
  return isLast ? '└── ' : '├── ';
};

const getChildPrefix = (isLast: boolean, style: string): string => {
  if (style === 'minimal') return '  ';
  return isLast ? '    ' : '│   ';
};

const getIcon = (isDirectory: boolean): string =>
  isDirectory ? '📂 ' : '📄 ';

export const buildStructureString = (
  map: DirectoryMap,
  customizationOptions: TreeCustomizationOptions,
  repoUrl = '',
  prefix = '',
  currentPath = '',
  maxDepth = 50
): string => {
  if (maxDepth <= 0) return `${prefix}... (max depth reached)\n`;

  let result = '';

  if (prefix === '' && customizationOptions.showRootDirectory && repoUrl) {
    const repoName = extractRepoName(repoUrl);
    const icon = customizationOptions.useIcons ? '📂 ' : '';
    result += `${icon}${repoName}\n`;
  }

  const entries = Array.from(map.entries());
  if (entries.length === 0) return result;

  const sorted = [...entries].sort(([keyA, valueA], [keyB, valueB]) => {
    const isDirA = valueA instanceof Map;
    const isDirB = valueB instanceof Map;
    if (isDirA !== isDirB) return isDirA ? -1 : 1;
    return keyA.localeCompare(keyB);
  });

  for (let i = 0; i < sorted.length; i++) {
    const [key, value] = sorted[i];
    const isLast = i === sorted.length - 1;
    const connector = getConnector(isLast, customizationOptions.asciiStyle);
    const childPrefix = getChildPrefix(isLast, customizationOptions.asciiStyle);
    const isDirectory = value instanceof Map;
    const icon = customizationOptions.useIcons ? getIcon(isDirectory) : '';
    const itemPath = currentPath ? `${currentPath}/${key}` : key;
    const displayName = isDirectory && customizationOptions.showTrailingSlash ? `${key}/` : key;
    const description = getDescription(key, isDirectory, itemPath);
    const descText =
      customizationOptions.showDescriptions && description
        ? `                     # ${description}`
        : '';

    result += `${prefix}${connector}${icon}${displayName}${descText}\n`;

    if (isDirectory) {
      result += buildStructureString(
        value,
        customizationOptions,
        repoUrl,
        `${prefix}${childPrefix}`,
        itemPath,
        maxDepth - 1
      );
    }
  }

  return result;
};

export const analyzeRepository = (map: DirectoryMap) => {
  const fileTypes: Record<string, number> = {};
  const languages: Record<string, number> = {};
  let totalFiles = 0;

  const traverse = (node: DirectoryMap | { type: 'file'; name: string }) => {
    if (node instanceof Map) {
      for (const [, value] of node) traverse(value);
    } else if (node.type === 'file') {
      totalFiles++;
      const ext = node.name.split('.').pop() || 'Unknown';
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      const lang = getLanguageFromExtension(ext);
      languages[lang] = (languages[lang] || 0) + 1;
    }
  };

  traverse(map);

  const fileTypeData = Object.entries(fileTypes).map(([name, value]) => ({ name, value }));
  const languageData = Object.entries(languages).map(([name, count]) => ({
    name,
    percentage: totalFiles > 0 ? (count / totalFiles) * 100 : 0,
  }));

  return { fileTypes: fileTypeData, languages: languageData };
};

export interface EntryCounts {
  folders: number;
  files: number;
}

export const countEntries = (map: DirectoryMap): EntryCounts => {
  let folders = 0;
  let files = 0;

  const traverse = (node: DirectoryMap | { type: 'file'; name: string }) => {
    if (node instanceof Map) {
      folders++;
      for (const [, value] of node) {
        traverse(value);
      }
    } else if (node.type === 'file') {
      files++;
    }
  };

  for (const [, value] of map) {
    traverse(value);
  }
  return { folders, files };
};

export interface FilterOptions {
  maxDepth: number | null;
  excludePatterns: string[];
}

export const getPathDepth = (path: string): number => {
  return path.split('/').filter(Boolean).length;
};

const globToRegex = (pattern: string): RegExp => {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
};

export const matchesExclude = (path: string, patterns: string[]): boolean => {
  if (patterns.length === 0) return false;

  const segments = path.split('/');
  const pathParts = segments.filter(Boolean);
  const fileName = pathParts[pathParts.length - 1] || '';

  for (const pattern of patterns) {
    if (!pattern.trim()) continue;

    const trimmedPattern = pattern.trim();
    const regex = globToRegex(trimmedPattern);

    if (regex.test(fileName)) return true;

    if (regex.test(segments[0] || '')) return true;

    for (const segment of pathParts) {
      if (regex.test(segment)) return true;
    }
  }

  return false;
};

export const filterTreeEntries = (
  tree: TreeItem[],
  options: FilterOptions
): TreeItem[] => {
  const { maxDepth, excludePatterns } = options;

  if (!maxDepth && (!excludePatterns || excludePatterns.length === 0)) {
    return tree;
  }

  const excludedDirs = new Set<string>();

  if (excludePatterns.length > 0) {
    for (const item of tree) {
      if (item.type === 'tree' && matchesExclude(item.path, excludePatterns)) {
        excludedDirs.add(item.path);
      }
    }
  }

  return tree.filter((item) => {
    if (excludePatterns.length > 0) {
      if (matchesExclude(item.path, excludePatterns)) {
        return false;
      }
      if (excludedDirs.has(item.path)) {
        return false;
      }
      for (const excludedDir of excludedDirs) {
        if (item.path.startsWith(excludedDir + '/')) {
          return false;
        }
      }
    }

    if (maxDepth !== null && getPathDepth(item.path) > maxDepth) {
      return false;
    }

    return true;
  });
};

const getLanguageFromExtension = (ext: string): string => {
  const map: Record<string, string> = {
    js: 'JavaScript', jsx: 'JavaScript', ts: 'TypeScript', tsx: 'TypeScript',
    py: 'Python', java: 'Java', html: 'HTML', css: 'CSS', scss: 'CSS',
    json: 'JSON', md: 'Markdown', rb: 'Ruby', go: 'Go', rs: 'Rust',
    cpp: 'C++', c: 'C', cs: 'C#', php: 'PHP', swift: 'Swift',
    kt: 'Kotlin', dart: 'Dart', yaml: 'YAML', yml: 'YAML', sh: 'Shell',
    sql: 'SQL', vue: 'Vue', svelte: 'Svelte',
  };
  return map[ext] || 'Other';
};
