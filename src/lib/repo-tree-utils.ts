import { Octokit } from '@octokit/rest';

export interface TreeItem {
  path: string;
  type: string;
}

export type DirectoryMap = Map<string, DirectoryMap | { type: 'file' }>;

export const validateUrl = (url: string): boolean => {
  const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubUrlPattern.test(url);
};

export const fetchProjectStructure = async (repoUrl: string): Promise<TreeItem[]> => {
  const [owner, repo] = repoUrl.split('/').slice(-2);
  const octokit = new Octokit();

  // Fetch the default branch name
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  // Fetch the project structure from the default branch
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: defaultBranch,
    recursive: 'true',
  });

  return data.tree as TreeItem[];
};

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

export const buildStructureString = (map: DirectoryMap, prefix = ''): string => {
  let result = '';
  for (const [key, value] of map.entries()) {
    if (key === 'type') continue;
    result += `${prefix}├── ${key}\n`;
    if (value instanceof Map) {
      result += buildStructureString(value, `${prefix}│   `);
    }
  }
  return result;
};
