export interface TreeItem {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  size?: number;
}

export interface Repository {
  id: number | string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  visibility: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  updated_at: string | null;
}

export interface RepoValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  totalEntries: number;
  estimatedSize: number;
}

export interface RepoProvider {
  fetchTree(owner: string, repo: string, token: string): Promise<TreeItem[]>;
  listRepos(token: string): Promise<Repository[]>;
  parseUrl(url: string): { owner: string; repo: string };
  validateUrl(url: string): boolean;
}

export type ProviderType = 'github' | 'gitlab';

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
  provider: ProviderType;
}
