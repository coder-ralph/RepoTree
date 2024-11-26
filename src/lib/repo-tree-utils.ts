import { TreeCustomizationOptions } from '@/types/tree-customization';
import { Octokit } from '@octokit/rest';
import axios from 'axios';

export interface TreeItem {
  path: string;
  type: 'tree' | 'blob';
}

export type DirectoryMap = Map<string, DirectoryMap | { type: 'file' }>;

interface GitLabTreeItem {
  path: string;
  type: 'tree' | 'blob';
}

// Validate GitHub and GitLab URLs
export const validateGitHubUrl = (url: string): boolean => {
  const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubUrlPattern.test(url);
};

export const validateGitLabUrl = (url: string): boolean => {
  const gitlabUrlPattern = /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+\/?$/;
  return gitlabUrlPattern.test(url);
};

// Initialize Octokit instance
const getOctokit = () => {
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  return new Octokit({
    auth: githubToken,
    request: {
      fetch: fetch,
    },
  });
};

// Fetch project structure from GitHub or GitLab
export const fetchProjectStructure = async (
  repoUrl: string,
  repoType: 'github' | 'gitlab',
): Promise<TreeItem[]> => {
  if (repoType === 'github') {
    return fetchGitHubProjectStructure(repoUrl);
  } else {
    return fetchGitLabProjectStructure(repoUrl);
  }
};

const fetchGitHubProjectStructure = async (
  repoUrl: string,
): Promise<TreeItem[]> => {
  const [owner, repo] = repoUrl.split('/').slice(-2);
  const octokit = getOctokit();

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
      throw new Error('Invalid repository structure received');
    }

    return data.tree.map((item) => ({
      path: item.path,
      type: item.type === 'tree' ? 'tree' : 'blob',
    })) as TreeItem[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching GitHub project structure:', error);
      throw new Error(
        `Failed to fetch GitHub repository structure: ${error.message}`,
      );
    }
    throw new Error(
      'An unknown error occurred while fetching GitHub project structure',
    );
  }
};

const fetchGitLabProjectStructure = async (
  repoUrl: string,
): Promise<TreeItem[]> => {
  const projectId = encodeURIComponent(repoUrl.split('gitlab.com/')[1]);

  try {
    const response = await axios.get<GitLabTreeItem[]>(
      `https://gitlab.com/api/v4/projects/${projectId}/repository/tree`,
      {
        params: { recursive: true, per_page: 100 },
      },
    );

    return response.data.map((item: GitLabTreeItem) => ({
      path: item.path,
      type: item.type,
    }));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching GitLab project structure:', error);
      throw new Error(
        `Failed to fetch GitLab repository structure: ${error.message}`,
      );
    }
    throw new Error(
      'An unknown error occurred while fetching GitLab project structure',
    );
  }
};

// Generate and build project structure
export const generateStructure = (tree: TreeItem[]): DirectoryMap => {
  const structureMap: DirectoryMap = new Map();
  tree.forEach((item: TreeItem) => {
    const parts = item.path.split('/');
    let currentLevel: DirectoryMap | { type: 'file' } = structureMap;

    parts.forEach((part: string, index: number) => {
      if (!(currentLevel instanceof Map)) return;
      if (!currentLevel.has(part)) currentLevel.set(part, new Map());
      if (index === parts.length - 1 && item.type === 'blob') {
        currentLevel.set(part, { type: 'file' });
      }
      currentLevel = currentLevel.get(part)!;
    });
  });
  return structureMap;
};

export const buildStructureString = (
  map: DirectoryMap,
  prefix = '',
  options: TreeCustomizationOptions,
): string => {
  let result = '';
  const entries = Array.from(map.entries());
  const lastIndex = entries.length - 1;

  entries.forEach(([key, value], index) => {
    if (key === 'type') return;
    const isLast = index === lastIndex;
    const connector = getConnector(isLast, options.asciiStyle);
    const childPrefix = getChildPrefix(isLast, options.asciiStyle);
    const icon = options.useIcons ? getIcon(value instanceof Map) : '';

    result += `${prefix}${connector}${icon}${key}\n`;
    if (value instanceof Map) {
      result += buildStructureString(value, `${prefix}${childPrefix}`, options);
    }
  });

  return result;
};

const getConnector = (isLast: boolean, asciiStyle: string): string => {
  switch (asciiStyle) {
    case 'basic':
      return isLast ? '└── ' : '├── ';
    case 'detailed':
      return isLast ? '└─── ' : '├─── ';
    case 'minimal':
      return '  ';
    default:
      return isLast ? '└── ' : '├── ';
  }
};

const getChildPrefix = (isLast: boolean, asciiStyle: string): string => {
  switch (asciiStyle) {
    case 'basic':
    case 'detailed':
      return isLast ? '    ' : '│   ';
    case 'minimal':
      return '  ';
    default:
      return isLast ? '    ' : '│   ';
  }
};

const getIcon = (isDirectory: boolean): string => {
  return isDirectory ? '📂 ' : '📄 ';
};
