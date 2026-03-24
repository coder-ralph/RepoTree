import { GitHubProvider } from './github';
import { GitLabProvider } from './gitlab';
import type { RepoProvider, ProviderType } from './types';

const providers: Record<ProviderType, RepoProvider> = {
  github: new GitHubProvider(),
  gitlab: new GitLabProvider(),
};

export function getProvider(providerName: string): RepoProvider {
  const provider = providers[providerName as ProviderType];
  if (!provider) return providers.github;
  return provider;
}

export function detectProviderFromUrl(url: string): ProviderType | null {
  if (url.includes('github.com')) return 'github';
  if (url.includes('gitlab.com')) return 'gitlab';
  return null;
}

export function validateRepoUrl(url: string, providerType: ProviderType): boolean {
  return providers[providerType].validateUrl(url);
}

export type { RepoProvider, ProviderType };
export type { TreeItem, Repository, RepoValidationResult } from './types';
