'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Octokit } from '@octokit/rest'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Download, Github, Copy, Check, CircleX, Maximize } from 'lucide-react'

// Define types for TreeItem and ValidationError
interface TreeItem {
  path: string
  type: string
}

interface ValidationError {
  message: string
  isError: boolean
}

// Define a recursive type for the directory map structure
type DirectoryMap = Map<string, DirectoryMap | { type: 'file' }>

export default function GitHubProjectStructure() {
  const [repoUrl, setRepoUrl] = useState('')
  const [structure, setStructure] = useState('')
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationError>({ message: '', isError: false })
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Function to validate GitHub repository URL
  const validateUrl = (url: string): boolean => {
    const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  }

  // Handle URL input change and validation
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setRepoUrl(url)

    if (!url) {
      setValidation({ message: 'GitHub URL is required', isError: true })
    } else if (!validateUrl(url)) {
      setValidation({ message: 'Enter a valid GitHub URL', isError: true })
    } else {
      setValidation({ message: '', isError: false })
    }
  }

  // Function to fetch project structure from GitHub
  const fetchProjectStructure = async () => {
    if (!repoUrl) {
      setValidation({ message: 'GitHub URL is required', isError: true })
      return
    }

    if (!validateUrl(repoUrl)) {
      setValidation({ message: 'Enter a valid GitHub URL', isError: true })
      return
    }

    setLoading(true)
    try {
      const [owner, repo] = repoUrl.split('/').slice(-2)

      // Fetch the default branch name
      const { data: repoData } = await new Octokit().rest.repos.get({ owner, repo })
      const defaultBranch = repoData.default_branch

      // Fetch the project structure from the default branch
      const { data } = await new Octokit().rest.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: 'true',
      })

      setStructure(generateStructure(data.tree as TreeItem[]))
      setValidation({ message: '', isError: false })
    } catch (err) {
      console.error(err)
      setStructure('Error fetching repository structure. Please check the URL and try again.')
      setValidation({ message: 'Failed to fetch repository structure', isError: true })
    }
    setLoading(false)
  }

  // Generate the ASCII directory structure
  const generateStructure = (tree: TreeItem[]): string => {
    const structureMap: DirectoryMap = new Map<string, DirectoryMap | { type: 'file' }>()
    tree.forEach((item: TreeItem) => {
      const parts = item.path.split('/')
      let currentLevel: DirectoryMap | { type: 'file' } = structureMap

      parts.forEach((part: string, index: number) => {
        if (!(currentLevel instanceof Map)) return
        if (!currentLevel.has(part)) currentLevel.set(part, new Map())
        if (index === parts.length - 1 && item.type === 'blob') {
          currentLevel.set(part, { type: 'file' })
        }
        currentLevel = currentLevel.get(part)!
      })
    })
    return buildStructureString(structureMap)
  }

  // Build the structure string for display
  const buildStructureString = (map: DirectoryMap, prefix = ''): string => {
    let result = ''
    for (const [key, value] of map.entries()) {
      if (key === 'type') continue
      result += `${prefix}├── ${key}\n`
      if (value instanceof Map) {
        result += buildStructureString(value, `${prefix}│   `)
      }
    }
    return result
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(structure).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Handle clear input
  const handleClearInput = () => {
    setRepoUrl('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Toggle expand and scroll to RepoStructure
  const toggleExpand = () => {
    setExpanded(!expanded);

    if (expanded) {
      // Scroll to the generator section when collapsing
      const repoStructureElement = document.getElementById('generator');
      if (repoStructureElement) {
        repoStructureElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto p-1 md:p-8 bg-gradient-to-br from-blue-50 to-white shadow-xl" id="generator">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 flex items-center justify-center gap-2">
            Generate ASCII<span className="text-blue-600">Tree</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="relative flex-grow">
                <Input
                  placeholder="Enter GitHub repository URL"
                  value={repoUrl}
                  onChange={handleUrlChange}
                  className={`p-3 pr-10 text-lg text-black dark:text-black ${validation.isError ? 'border-red-500' : ''}`}
                  ref={inputRef}
                />
                {repoUrl && (
                  <button
                    onClick={handleClearInput}
                    className="absolute inset-y-0 right-0 flex items-center justify-center p-2 text-gray-500 hover:text-gray-900"
                    aria-label="Clear input"
                  >
                    <CircleX size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
              <Button
                onClick={fetchProjectStructure}
                disabled={loading || validation.isError}
                className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-300"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
                Generate
              </Button>
            </div>

            <AnimatePresence>
              {validation.isError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {validation.message}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {structure && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <pre
                      className={`bg-gray-800 text-green-400 p-6 rounded-lg overflow-x-auto mt-6 whitespace-pre-wrap break-words text-sm sm:text-base md:text-lg ${
                        expanded ? 'max-h-[none]' : 'max-h-96'
                      } overflow-y-auto`}
                    >
                      <code>{structure}</code>
                    </pre>
                    <div className="absolute top-2 right-2 md:right-6 flex items-center gap-2">
                    {copied ? (
                      <Button
                        className="p-2 text-green-500 dark:text-green-400"
                        aria-label="Copied"
                      >
                        <Check size={16} />
                      </Button>
                    ) : (
                      <Button
                        onClick={copyToClipboard}
                        className="p-2 text-white dark:text-gray-400 dark:hover:text-gray-900 bg-transparent border-none"
                        aria-label="Copy to clipboard"
                        title="Copy to clipboard"
                      >
                        <Copy size={20} />
                      </Button>
                    )}
                      <Button
                        onClick={toggleExpand}
                        className="p-2 text-white dark:text-gray-400 dark:hover:text-gray-900 bg-transparent border-none"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                        title={expanded ? "Collapse" : "Expand"}
                      >
                        <Maximize size={20} />
                      </Button>
                      <Button
                        onClick={() => saveAs(new Blob([`# Directory Structure\n\n\`\`\`\n${structure}\`\`\``], { type: 'text/markdown;charset=utf-8' }), 'README.md')}
                        className="p-2 text-white dark:text-gray-400 dark:hover:text-gray-900 bg-transparent border-none"
                        aria-label="Download as README.md"
                        title="Download as README.md"
                      >
                        <Download size={20} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
