'use client'

import { useState } from 'react'
import { Octokit } from '@octokit/rest'
import { saveAs } from 'file-saver'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, Github } from 'lucide-react'

interface TreeItem {
  path: string
  type: string
}

interface ValidationError {
  message: string;
  isError: boolean;
}

export default function GitHubProjectStructure() {
  const [repoUrl, setRepoUrl] = useState('')
  const [structure, setStructure] = useState('')
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationError>({ message: '', isError: false })

  const validateUrl = (url: string): boolean => {
    const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);
    
    if (!url) {
      setValidation({ message: 'GitHub URL is required', isError: true });
    } else if (!validateUrl(url)) {
      setValidation({ message: 'Enter a valid GitHub URL', isError: true });
    } else {
      setValidation({ message: '', isError: false });
    }
  }

  const fetchProjectStructure = async () => {
    if (!repoUrl) {
      setValidation({ message: 'GitHub URL is required', isError: true });
      return;
    }

    if (!validateUrl(repoUrl)) {
      setValidation({ message: 'Enter a valid GitHub URL', isError: true });
      return;
    }

    setLoading(true);
    try {
      const [owner, repo] = repoUrl.split('/').slice(-2);

      // Fetch the default branch name (either 'main', 'master', or another branch)
      const { data: repoData } = await new Octokit().rest.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      // Fetch the project structure from the default branch
      const { data } = await new Octokit().rest.git.getTree({ owner, repo, tree_sha: defaultBranch, recursive: 'true' });
      setStructure(generateStructure(data.tree as TreeItem[]));
      setValidation({ message: '', isError: false });
    } catch (err) {
      console.error(err);
      setStructure('Error fetching repository structure. Please check the URL and try again.');
      setValidation({ message: 'Failed to fetch repository structure', isError: true });
    }
    setLoading(false);
  }

  const generateStructure = (tree: TreeItem[]): string => {
    const structureMap = new Map<string, Map<string, any>>()
    tree.forEach((item: TreeItem) => {
      const parts = item.path.split('/')
      let currentLevel: Map<string, any> = structureMap
      parts.forEach((part: string, index: number) => {
        if (!currentLevel.has(part)) currentLevel.set(part, new Map())
        if (index === parts.length - 1 && item.type === 'blob') currentLevel.get(part)!.set('type', 'file')
        currentLevel = currentLevel.get(part)!
      })
    })
    return buildStructureString(structureMap)
  }

  const buildStructureString = (map: Map<string, any>, prefix = ''): string => {
    let result = ''
    for (const [key, value] of map.entries()) {
      if (key === 'type') continue
      result += `${prefix}├── ${key}\n`
      if (value.size > 0 && value.get('type') !== 'file') {
        result += buildStructureString(value, prefix + '│   ')
      }
    }
    return result
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 md:p-8" id="generator">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Generate Your Repo<span className="text-blue-600 font-bold">Tree</span></CardTitle>
        <p className="text-center text-gray-600">
          Convert GitHub repository structure into a clean ASCII format, perfect for documentation and sharing.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <Input
              placeholder="Enter GitHub repository URL"
              value={repoUrl}
              onChange={handleUrlChange}
              className={`flex-grow ${validation.isError ? 'border-red-500' : ''} p-3`}
            />
            <Button
              onClick={fetchProjectStructure}
              disabled={loading || validation.isError}
              className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center py-3 px-4"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              Generate
            </Button>
          </div>

          {validation.isError && (
            <p className="text-red-500 text-sm mt-2">{validation.message}</p>
          )}

          {structure && (
            <>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mt-6 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                <code>{structure}</code>
              </pre>
              <Button
                onClick={() =>
                  saveAs(
                    new Blob([`# Directory Structure\n\n\`\`\`\n${structure}\`\`\``], {
                      type: 'text/markdown;charset=utf-8',
                    }),
                    'README.md'
                  )
                }
                className="mt-4 w-full sm:w-auto"
              >
                <Download className="h-5 w-5" />
                Download README.md
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
