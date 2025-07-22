"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import AIFeedback from "@/components/ai-feedback"
import InteractiveTreeView from "@/components/interactive-tree-view"
import PrivateReposDialog from "@/components/private-repos-dialog"
import { RepoGraphs } from "@/components/repo-graphs"
import TokenStatus from "@/components/token-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  analyzeRepository,
  buildStructureString,
  type DirectoryMap,
  fetchProjectStructure,
  generateStructure,
  validateGitHubUrl,
  validateGitLabUrl,
} from "@/lib/repo-tree-utils"
import type { TreeCustomizationOptions } from "@/types/tree-customization"
import { saveAs } from "file-saver"
import {
  Check,
  CircleX,
  Copy,
  Download,
  Github,
  GitlabIcon as GitLab,
  Maximize,
  Minimize,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"

import CustomizationOptions from "./customization-options"

interface ValidationError {
  message: string
  isError: boolean
}

type RepoType = "github" | "gitlab"

interface FileTypeData {
  name: string
  value: number
}

interface LanguageData {
  name: string
  percentage: number
}

// Default customization options
const DEFAULT_CUSTOMIZATION_OPTIONS: TreeCustomizationOptions = {
  asciiStyle: "basic",
  useIcons: false,
  showLineNumbers: false,
  showRootDirectory: false,
  showTrailingSlash: false,
}

// Load customization options from localStorage
const loadCustomizationOptions = (): TreeCustomizationOptions => {
  if (typeof window === "undefined") return DEFAULT_CUSTOMIZATION_OPTIONS
  
  try {
    const saved = localStorage.getItem("treeCustomizationOptions")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_CUSTOMIZATION_OPTIONS, ...parsed }
    }
  } catch (error) {
    console.warn("Failed to load customization options from localStorage:", error)
  }
  
  return DEFAULT_CUSTOMIZATION_OPTIONS
}

// Save customization options to localStorage
const saveCustomizationOptions = (options: TreeCustomizationOptions): void => {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem("treeCustomizationOptions", JSON.stringify(options))
  } catch (error) {
    console.warn("Failed to save customization options to localStorage:", error)
  }
}

export default function RepoProjectStructure() {
  const [repoUrl, setRepoUrl] = useState("")
  const [repoType, setRepoType] = useState<RepoType>("github")
  const [structureMap, setStructureMap] = useState<DirectoryMap>(new Map())
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState<ValidationError>({
    message: "",
    isError: false,
  })
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<"ascii" | "interactive">("ascii")
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadFormat, setDownloadFormat] = useState<"md" | "txt" | "json" | "html">("md")
  const inputRef = useRef<HTMLInputElement>(null)
  const treeRef = useRef<HTMLDivElement>(null)

  const [customizationOptions, setCustomizationOptions] = useState<TreeCustomizationOptions>(loadCustomizationOptions())

  const [fileTypeData, setFileTypeData] = useState<FileTypeData[]>([])
  const [languageData, setLanguageData] = useState<LanguageData[]>([])
  const [hasPrivateToken, setHasPrivateToken] = useState(false)

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value
      setRepoUrl(url)
      localStorage.setItem("lastRepoUrl", url)

      if (!url) {
        setValidation({ message: "Repository URL is required", isError: true })
      } else if (repoType === "github" && !validateGitHubUrl(url)) {
        setValidation({ message: "Enter a valid GitHub URL", isError: true })
      } else if (repoType === "gitlab" && !validateGitLabUrl(url)) {
        setValidation({ message: "Enter a valid GitLab URL", isError: true })
      } else {
        setValidation({ message: "", isError: false })
      }
    },
    [repoType],
  )

  const handleFetchStructure = useCallback(
    async (url: string = repoUrl) => {
      if (!url) {
        setValidation({ message: "Repository URL is required", isError: true })
        return
      }

      if ((repoType === "github" && !validateGitHubUrl(url)) || (repoType === "gitlab" && !validateGitLabUrl(url))) {
        setValidation({
          message: `Enter a valid ${repoType === "github" ? "GitHub" : "GitLab"} URL`,
          isError: true,
        })
        return
      }

      setLoading(true)
      try {
        const tree = await fetchProjectStructure(url, repoType)
        const map = generateStructure(tree)
        setStructureMap(map)
        setValidation({ message: "", isError: false })
        localStorage.setItem("lastRepoUrl", url)

        const { fileTypes, languages } = analyzeRepository(map)
        setFileTypeData(fileTypes)
        setLanguageData(languages)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err)
          setValidation({
            message: err.message,
            isError: true,
          })
        } else {
          console.error("An unknown error occurred:", err)
          setValidation({
            message: "Failed to fetch structure",
            isError: true,
          })
        }
      }
      setLoading(false)
    },
    [repoUrl, repoType],
  )

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastRepoUrl")
    if (savedUrl) {
      setRepoUrl(savedUrl)
    }
  }, [])

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("github_personal_token")
      setHasPrivateToken(!!token)
    }

    checkToken()

    const handleTokenUpdate = () => {
      checkToken()
    }

    window.addEventListener("github-token-updated", handleTokenUpdate)
    return () => {
      window.removeEventListener("github-token-updated", handleTokenUpdate)
    }
  }, [])

  const filterStructure = useCallback((map: DirectoryMap, term: string): DirectoryMap => {
    const filteredMap: DirectoryMap = new Map()

    for (const [key, value] of map.entries()) {
      if (value && typeof value === "object" && "type" in value && value.type === "file") {
        if (key.toLowerCase().includes(term.toLowerCase())) {
          filteredMap.set(key, value)
        }
      } else if (value instanceof Map) {
        const filteredSubMap = filterStructure(value, term)
        if (filteredSubMap.size > 0 || key.toLowerCase().includes(term.toLowerCase())) {
          filteredMap.set(key, filteredSubMap)
        }
      }
    }

    return filteredMap
  }, [])

  const filteredStructureMap = useMemo(
    () => filterStructure(structureMap, searchTerm),
    [filterStructure, structureMap, searchTerm],
  )

  const customizedStructure = useMemo(
    () => buildStructureString(filteredStructureMap, "", customizationOptions),
    [filteredStructureMap, customizationOptions],
  )

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(customizedStructure).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [customizedStructure])

  const handleClearInput = useCallback(() => {
    setRepoUrl("")
    localStorage.removeItem("lastRepoUrl")
    setStructureMap(new Map())
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const handleDownload = useCallback(() => {
    let content: string
    let mimeType: string
    let fileName: string

    switch (downloadFormat) {
      case "md":
        content = `# Directory Structure\n\n\`\`\`\n${customizedStructure}\`\`\``
        mimeType = "text/markdown;charset=utf-8"
        fileName = "README.md"
        break
      case "txt":
        content = customizedStructure
        mimeType = "text/plain;charset=utf-8"
        fileName = "directory-structure.txt"
        break
      case "json":
        content = JSON.stringify(Array.from(filteredStructureMap), null, 2)
        mimeType = "application/json;charset=utf-8"
        fileName = "directory-structure.json"
        break
      case "html":
        content = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Repository Structure</title>
            <style>
              body { font-family: monospace; white-space: pre; }
            </style>
          </head>
          <body>${customizedStructure}</body>
          </html>
        `
        mimeType = "text/html;charset=utf-8"
        fileName = "directory-structure.html"
        break
    }

    saveAs(new Blob([content], { type: mimeType }), fileName)
  }, [downloadFormat, customizedStructure, filteredStructureMap])

  const handleCustomizationChange = (newOptions: Partial<TreeCustomizationOptions>) => {
    setCustomizationOptions((prevOptions: TreeCustomizationOptions) => {
      const updatedOptions = {
        ...prevOptions,
        ...newOptions,
      }
      // Save to localStorage whenever options change
      saveCustomizationOptions(updatedOptions)
      return updatedOptions
    })
  }

  const noStructureMessage = `No structure generated yet. Enter a ${repoType === "github" ? "GitHub" : "GitLab"} URL and click Generate.`
  const noResultsMessage = useCallback(
    (searchTerm: string) =>
      `No files or folders found matching "${searchTerm}".\n\nTips:\n- Check the spelling\n- Try searching for partial names\n- Include file extensions (.js, .ts, .json)`,
    [],
  )

  return (
    <div>
      <Card
        className="w-full max-w-5xl mx-auto p-2 md:p-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-xl"
        id="generator"
      >
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black dark:text-white flex items-center justify-center gap-2">
            Generate ASCII<span className="text-emerald-600">Tree</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Token Status */}
            <TokenStatus />

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Select value={repoType} onValueChange={(value: RepoType) => setRepoType(value)}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 text-black dark:text-white border-blue-500" aria-label="Repository Type">
                  <SelectValue placeholder="Select repo type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub {hasPrivateToken && "(Private)"}</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                </SelectContent>
              </Select>
              {repoType === "github" && (
                <div className="flex items-center gap-2">
                  <PrivateReposDialog />
                </div>
              )}
              <div className="relative flex-grow">
                <Input
                  placeholder={`Enter ${repoType === "github" ? "GitHub" : "GitLab"} repository URL`}
                  value={repoUrl}
                  onChange={handleUrlChange}
                  className={`p-3 pr-10 text-base sm:text-lg text-black dark:text-white border-blue-500 ${validation.isError ? "border-red-500" : ""}`}
                  ref={inputRef}
                />
                {repoUrl && (
                  <button
                    onClick={handleClearInput}
                    className="absolute inset-y-0 right-0 flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                    aria-label="Clear input"
                  >
                    <CircleX size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
              <Button
                onClick={() => handleFetchStructure()}
                disabled={loading || validation.isError}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg transition-colors duration-300"
                aria-label={`Generate ${repoType === "github" ? "GitHub" : "GitLab"} structure`}
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : repoType === "github" ? (
                  <Github className="h-5 w-5" />
                ) : (
                  <GitLab className="h-5 w-5" />
                )}
                {loading ? "Generating..." : "Generate"}
              </Button>
            </div>

            {validation.isError && <p className="text-red-500 text-sm mt-2">{validation.message}</p>}

            <div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between mb-4">
                <div className="flex space-x-2 items-center">
                  <Button
                    onClick={() => setViewMode("ascii")}
                    className={`${viewMode === "ascii" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                  >
                    ASCII
                  </Button>
                  <Button
                    onClick={() => setViewMode("interactive")}
                    className={`${viewMode === "interactive" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                  >
                    Interactive
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="ASCII Themes Settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>ASCII Themes</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                          Customize your ASCII theme preferences to match your style.
                        </p>
                      </DialogHeader>
                      <CustomizationOptions options={customizationOptions} onChange={handleCustomizationChange} />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative w-full sm:w-auto">
                  <Input
                    type="text"
                    placeholder="Search files/folders"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full border-blue-500"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
              <div className="relative" ref={treeRef}>
                {viewMode === "ascii" ? (
                  <SyntaxHighlighter
                    language="plaintext"
                    style={atomDark}
                    className={`rounded-lg overflow-x-auto mt-6 ${expanded ? "max-h-[none]" : "max-h-96"} overflow-y-auto min-h-[200px]`}
                    showLineNumbers={customizationOptions.showLineNumbers}
                    wrapLines={true}
                  >
                    {customizedStructure
                      ? customizedStructure
                      : searchTerm
                        ? noResultsMessage(searchTerm)
                        : noStructureMessage}
                  </SyntaxHighlighter>
                ) : filteredStructureMap.size > 0 ? (
                  <InteractiveTreeView structure={filteredStructureMap} customizationOptions={customizationOptions} />
                ) : (
                  <SyntaxHighlighter
                    language="plaintext"
                    style={atomDark}
                    className="rounded-lg overflow-x-auto mt-6 max-h-96 overflow-y-auto min-h-[200px]"
                  >
                    {searchTerm ? noResultsMessage(searchTerm) : noStructureMessage}
                  </SyntaxHighlighter>
                )}

                <div className="absolute top-2 right-2 md:right-6 flex items-center gap-2">
                  {copied ? (
                    <Button className="p-2 text-green-500 dark:text-green-400" aria-label="Copied">
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
                    aria-label={expanded ? "Collapse" : "Expand"}
                    title={expanded ? "Collapse" : "Expand"}
                  >
                    {expanded ? <Minimize size={20} /> : <Maximize size={20} />}
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Select
                  onValueChange={(value: "md" | "txt" | "json" | "html") => setDownloadFormat(value)}
                  aria-label="Download Format"
                >
                  <SelectTrigger
                    className="w-[180px] bg-white dark:bg-gray-800 text-black dark:text-white border-blue-500"
                    aria-label="Select download format"
                  >
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="md">.md</SelectItem>
                    <SelectItem value="txt">.txt</SelectItem>
                    <SelectItem value="json">.json</SelectItem>
                    <SelectItem value="html">.html</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Download file"
                >
                  <Download aria-hidden="true" /> Download
                </Button>
              </div>
              {structureMap.size > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Repository Analysis</h2>
                  <RepoGraphs fileTypeData={fileTypeData} languageData={languageData} />
                </div>
              )}
              <AIFeedback structureMap={structureMap} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
