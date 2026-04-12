export type SortOrder = 'default' | 'name-asc' | 'name-desc';

export interface TreeCustomizationOptions {
  asciiStyle: 'basic' | 'detailed' | 'minimal';
  useIcons: boolean;
  showLineNumbers: boolean;
  showDescriptions: boolean;
  showRootDirectory: boolean;
  showTrailingSlash: boolean;
  sortOrder: SortOrder;
  hideHiddenFiles: boolean;
  includePatterns: string;
  focusPath: string;
}

export type DirectoryEntry = { type: 'file' } | DirectoryMap;
export type DirectoryMap = Map<string, DirectoryEntry>;