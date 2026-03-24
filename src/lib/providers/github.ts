import { Octokit } from '@octokit/rest';
import type { RepoProvider, TreeItem, Repository } from './types';

export class GitHubProvider implements RepoProvider {
  validateUrl(url: string): boolean {
    return /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url);
  }

  parseUrl(url: string): { owner: string; repo: string } {
    const parts = url.replace(/\/$/, '').split('/');
    return {
      owner: parts[parts.length - 2],
      repo: parts[parts.length - 1],
    };
  }

  async fetchTree(owner: string, repo: string, token: string): Promise<TreeItem[]> {
    const octokit = new Octokit({ auth: token || undefined });

    try {
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      const branch = repoData.default_branch;

      const { data: ref } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });

      const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: ref.object.sha,
        recursive: 'true',
      });

      if (!data.tree || !Array.isArray(data.tree)) {
        throw new Error('Invalid repository structure received from GitHub');
      }

      return data.tree.map((item) => ({
        path: item.path ?? '',
        type: item.type === 'tree' ? 'tree' : 'blob',
        name: item.path?.split('/').pop() ?? '',
        size: item.size ?? 0,
      })) as TreeItem[];
    } catch (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 404) {
        throw new Error('Repository not found. Check the URL and your access permissions.');
      } else if (err.status === 403) {
        if (err.message?.includes('rate limit')) {
          throw new Error('GitHub API rate limit exceeded. Sign in to get higher limits.');
        }
        throw new Error('Access denied. You may not have permission to access this repository.');
      } else if (err.status === 401) {
        throw new Error('Authentication failed. Please sign out and sign in again.');
      }
      throw new Error(err.message ?? 'Failed to fetch repository from GitHub');
    }
  }

  async listRepos(token: string): Promise<Repository[]> {
    const octokit = new Octokit({ auth: token });

    const repos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      { per_page: 100, sort: 'updated', direction: 'desc' }
    );

    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      private: r.private,
      html_url: r.html_url,
      description: r.description,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      language: r.language ?? null,
      fork: r.fork,
      visibility: r.visibility ?? (r.private ? 'private' : 'public'),
      owner: {
        login: r.owner.login,
        avatar_url: r.owner.avatar_url,
      },
      updated_at: r.updated_at ?? null,
    }));
  }
}
