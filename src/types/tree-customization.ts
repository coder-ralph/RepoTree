export interface TreeCustomizationOptions {
  asciiStyle: 'basic' | 'detailed' | 'minimal';
  useIcons: boolean;
  showLineNumbers: boolean;
  showDescriptions: boolean
  showRootDirectory: boolean;
  showTrailingSlash: boolean;
}

export type DirectoryEntry = { type: "file" } | DirectoryMap
export type DirectoryMap = Map<string, DirectoryEntry>