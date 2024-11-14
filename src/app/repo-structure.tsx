'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Octokit } from '@octokit/rest'
import { saveAs } from 'file-saver'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, Github, Copy, Check } from 'lucide-react'

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

  // Function to validate GitHub repository URL
  const validateUrl = (url: string): boolean => {
    const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/
    return githubUrlPattern.test(url)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-gradient-to-br from-blue-50 to-white shadow-xl" id="generator">
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-8">
              <Input
                placeholder="Enter GitHub repository URL"
                value={repoUrl}
                onChange={handleUrlChange}
                className={`flex-grow ${validation.isError ? 'border-red-500' : ''} p-3 text-lg`}
              />
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
                    <pre className="bg-gray-800 text-green-400 p-6 rounded-lg overflow-x-auto mt-6 whitespace-pre-wrap break-words max-h-96 overflow-y-auto text-sm">
                      <code>{structure}</code>
                    </pre>
                    <div className="absolute top-2 right-2 md:right-6 flex items-center gap-2">
                      {copied && (
                        <span className="bg-gray-500 text-white px-2 py-1 rounded-md text-sm animate-slide-in-left">
                          Copied!
                        </span>
                      )}
                      <Button
                        onClick={copyToClipboard}
                        className="bg-gray-700 hover:bg-gray-600 text-white z-10"
                        size="sm"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      saveAs(
                        new Blob([`# Directory Structure\n\n\`\`\`\n${structure}\`\`\``], {
                          type: 'text/markdown;charset=utf-8',
                        }),
                        'README.md'
                      )
                    }
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300"
                  >
                    <Download className="h-5 w-5" />
                    Download README.md
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
