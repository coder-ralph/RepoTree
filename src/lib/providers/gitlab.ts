import type { RepoProvider, TreeItem, Repository } from './types';

interface GitLabTreeItem {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  id: string;
  mode: string;
}

interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  visibility: string;
  web_url: string;
  description: string | null;
  star_count: number;
  forks_count: number;
  last_activity_at: string;
  namespace: { path: string; avatar_url: string | null };
  forked_from_project?: { id: number };
}

export class GitLabProvider implements RepoProvider {
  private readonly baseUrl = 'https://gitlab.com/api/v4';

  validateUrl(url: string): boolean {
    return /^https?:\/\/gitlab\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url);
  }

  parseUrl(url: string): { owner: string; repo: string } {
    const parts = url.replace(/\/$/, '').split('/');
    return {
      owner: parts[parts.length - 2],
      repo: parts[parts.length - 1],
    };
  }

  private getHeaders(token: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['PRIVATE-TOKEN'] = token;
    }
    return headers;
  }

  private async fetchAllPages<T>(url: string, token: string, params: Record<string, string> = {}): Promise<T[]> {
    const items: T[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const searchParams = new URLSearchParams({
        ...params,
        page: String(page),
        per_page: String(perPage),
      });

      const response = await fetch(`${url}?${searchParams}`, {
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 404) throw new Error('Repository not found. Check the URL and your access permissions.');
        if (status === 403) throw new Error('Access denied. You may not have permission to access this repository.');
        if (status === 401) throw new Error('Authentication failed. Please sign out and sign in again.');
        throw new Error(`GitLab API error: ${response.statusText}`);
      }

      const data: T[] = await response.json();
      items.push(...data);

      const nextPage = response.headers.get('x-next-page');
      if (!nextPage || data.length < perPage) break;
      page = parseInt(nextPage, 10);
    }

    return items;
  }

  async fetchTree(owner: string, repo: string, token: string): Promise<TreeItem[]> {
    const projectId = encodeURIComponent(`${owner}/${repo}`);

    // Get default branch first
    const projectRes = await fetch(
      `${this.baseUrl}/projects/${projectId}`,
      { headers: this.getHeaders(token) }
    );

    if (!projectRes.ok) {
      const status = projectRes.status;
      if (status === 404) throw new Error('Repository not found. Check the URL and your access permissions.');
      if (status === 403) throw new Error('Access denied. You may not have permission to access this repository.');
      if (status === 401) throw new Error('Authentication failed. Please sign out and sign in again.');
      throw new Error(`GitLab API error: ${projectRes.statusText}`);
    }

    const projectData = await projectRes.json();
    const defaultBranch = projectData.default_branch ?? 'main';

    const items = await this.fetchAllPages<GitLabTreeItem>(
      `${this.baseUrl}/projects/${projectId}/repository/tree`,
      token,
      { recursive: 'true', ref: defaultBranch }
    );

    return items.map((item) => ({
      path: item.path,
      type: item.type === 'tree' ? 'tree' : 'blob',
      name: item.name,
    }));
  }

  async listRepos(token: string): Promise<Repository[]> {
    const projects = await this.fetchAllPages<GitLabProject>(
      `${this.baseUrl}/projects`,
      token,
      { membership: 'true', order_by: 'last_activity_at', sort: 'desc' }
    );

    return projects.map((p) => ({
      id: p.id,
      name: p.path,
      full_name: p.path_with_namespace,
      private: p.visibility === 'private',
      html_url: p.web_url,
      description: p.description,
      stargazers_count: p.star_count,
      forks_count: p.forks_count,
      language: null,
      fork: p.forked_from_project != null,
      visibility: p.visibility,
      owner: {
        login: p.namespace.path,
        avatar_url: p.namespace.avatar_url ?? '',
      },
      updated_at: p.last_activity_at,
    }));
  }
}
