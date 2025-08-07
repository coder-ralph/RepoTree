"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// import AIFeedback from "@/components/ai-feedback"
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
import { convertMapToJson } from "@/lib/utils"
import type { TreeCustomizationOptions } from "@/types/tree-customization"
import { saveAs } from "file-saver"
import {
  Check,
  ChevronDown,
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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const treeRef = useRef<HTMLDivElement>(null)

  const [customizationOptions, setCustomizationOptions] = useState<TreeCustomizationOptions>(loadCustomizationOptions())

  const [fileTypeData, setFileTypeData] = useState<FileTypeData[]>([])
  const [languageData, setLanguageData] = useState<LanguageData[]>([])
  const [hasGitHubToken, setHasGitHubToken] = useState(false)
  const [hasGitLabToken, setHasGitLabToken] = useState(false)

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
    const checkTokens = () => {
      const githubToken = localStorage.getItem("github_personal_token")
      const gitlabToken = localStorage.getItem("gitlab_personal_token")
      setHasGitHubToken(!!githubToken)
      setHasGitLabToken(!!gitlabToken)
    }

    checkTokens()

    const handleTokenUpdate = () => {
      checkTokens()
    }

    window.addEventListener("github-token-updated", handleTokenUpdate)
    window.addEventListener("gitlab-token-updated", handleTokenUpdate)
    return () => {
      window.removeEventListener("github-token-updated", handleTokenUpdate)
      window.removeEventListener("gitlab-token-updated", handleTokenUpdate)
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

  const handleDownloadWithFormat = useCallback((format: "md" | "txt" | "json" | "html") => {
    let content: string
    let mimeType: string
    let fileName: string

    switch (format) {
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
        content = JSON.stringify(convertMapToJson(filteredStructureMap), null, 2)
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
    setShowDownloadMenu(false)
  }, [customizedStructure, filteredStructureMap])

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
          <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black dark:text-white flex items-center justify-center gap-2">
            Repo<span className="text-blue-600">Tree</span>Generator
          </CardTitle>
          <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-300">
            Generate and share clean ASCII trees of your GitHub & GitLab repositories.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Token Status */}
            <TokenStatus />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              {/* Repository Type Select */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository Type
                </label>
                <Select value={repoType} onValueChange={(value: RepoType) => setRepoType(value)}>
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm" aria-label="Repository Type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <SelectItem value="github" className="hover:bg-gray-50 dark:hover:bg-gray-700 py-2">
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub {hasGitHubToken && "(Private)"}
                      </div>
                    </SelectItem>
                    <SelectItem value="gitlab" className="hover:bg-gray-50 dark:hover:bg-gray-700 py-2">
                      <div className="flex items-center gap-2">
                        <GitLab className="h-4 w-4" />
                        GitLab {hasGitLabToken && "(Private)"}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Repository URL Input with Private Repos Label */}
              <div className="sm:col-span-7">
                <div className="flex items-center gap-3 mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Repository URL
                  </label>
                  {/* Private Repos Clickable Label */}
                  <PrivateReposDialog repoType={repoType} />
                </div>
                <div className="relative">
                  <Input
                    // placeholder={`Enter ${repoType === "github" ? "GitHub" : "GitLab"} repository URL`}
                    placeholder={
                      repoType === "github"
                        ? "https://github.com/username/repo"
                        : "https://gitlab.com/username/repo"
                    }
                    value={repoUrl}
                    onChange={handleUrlChange}
                    className={`h-11 pl-4 pr-10 text-base bg-white dark:bg-gray-800 text-black dark:text-white border-2 rounded-lg shadow-sm transition-colors duration-200 ${
                      validation.isError 
                        ? "border-red-400 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400" 
                        : "border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                    }`}
                    ref={inputRef}
                  />
                  {repoUrl && (
                    <button
                      onClick={handleClearInput}
                      className="absolute inset-y-0 right-0 flex items-center justify-center p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Clear input"
                    >
                      <CircleX size={18} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="sm:col-span-2">
                <Button
                  onClick={() => handleFetchStructure()}
                  disabled={loading || validation.isError}
                  className="w-full h-11 flex items-center justify-center gap-2 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white text-base font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  aria-label={`Generate ${repoType === "github" ? "GitHub" : "GitLab"} structure`}
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : repoType === "github" ? (
                    <Github className="h-5 w-5" />
                  ) : (
                    <GitLab className="h-5 w-5" />
                  )}
                  {loading ? "Generating" : "Generate"}
                </Button>
              </div>
            </div>

            {validation.isError && <p className="text-red-500 text-sm mt-2">{validation.message}</p>}

            <div>
              {/* Menu Bar*/}
              <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-800">
                {/* Menu Items Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-600 gap-3 sm:gap-0">
                  <div className="flex items-center space-x-1 order-2 sm:order-1">
                    {/* View Mode Tabs */}
                    <button
                      onClick={() => setViewMode("ascii")}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        viewMode === "ascii"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      ASCII
                    </button>
                    <button
                      onClick={() => setViewMode("interactive")}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        viewMode === "interactive"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      Interactive
                    </button>

                    {/* Settings Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          aria-label="Settings"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto order-1 sm:order-2">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-auto">
                      <Input
                        type="text"
                        placeholder="Search files/folders"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-48 h-8 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      {/* Download Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                          disabled={structureMap.size === 0}
                          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white border border-gray-500 rounded transition-colors ${
                            structureMap.size === 0 ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          aria-label="Download"
                        >
                          <Download size={14} />
                          <span className="hidden sm:inline">Download</span>
                          <ChevronDown size={12} />
                        </button>
                        
                        {showDownloadMenu && structureMap.size > 0 && (
                          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg min-w-[120px] z-10">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                              File Format
                            </div>
                            <button 
                              onClick={() => handleDownloadWithFormat("txt")}
                              className="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                            >
                              .txt
                            </button>
                            <button 
                              onClick={() => handleDownloadWithFormat("md")}
                              className="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                            >
                              .md
                            </button>
                            <button 
                              onClick={() => handleDownloadWithFormat("json")}
                              className="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                            >
                              .json
                            </button>
                            <button 
                              onClick={() => handleDownloadWithFormat("html")}
                              className="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                            >
                              .html
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={structureMap.size === 0 ? () => {} : copyToClipboard}
                        className={`p-1.5 rounded transition-colors ${
                          structureMap.size === 0
                            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            : copied
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        aria-label="Copy to clipboard"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>

                      <button
                        onClick={toggleExpand}
                        className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label={expanded ? "Collapse" : "Expand"}
                        title={expanded ? "Collapse" : "Expand"}
                      >
                        {expanded ? <Minimize size={16} /> : <Maximize size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Block */}
              <div className="relative border border-gray-300 dark:border-gray-600 border-t-0 rounded-b-lg overflow-hidden" ref={treeRef}>
                {viewMode === "ascii" ? (
                  <SyntaxHighlighter
                    language="plaintext"
                    style={atomDark}
                    className={`${expanded ? "max-h-[none]" : "max-h-96"} overflow-y-auto min-h-[200px]`}
                    showLineNumbers={customizationOptions.showLineNumbers}
                    wrapLines={true}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      border: 'none'
                    }}
                  >
                    {customizedStructure
                      ? customizedStructure
                      : searchTerm
                        ? noResultsMessage(searchTerm)
                        : noStructureMessage}
                  </SyntaxHighlighter>
                ) : filteredStructureMap.size > 0 ? (
                  <div className="bg-gray-900 min-h-[200px] p-4">
                    <InteractiveTreeView structure={filteredStructureMap} customizationOptions={customizationOptions} />
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language="plaintext"
                    style={atomDark}
                    className="max-h-96 overflow-y-auto min-h-[200px]"
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      border: 'none'
                    }}
                  >
                    {searchTerm ? noResultsMessage(searchTerm) : noStructureMessage}
                  </SyntaxHighlighter>
                )}
              </div>

              {structureMap.size > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Repository Analysis</h2>
                  <RepoGraphs fileTypeData={fileTypeData} languageData={languageData} />
                </div>
              )}
              {/* <AIFeedback structureMap={structureMap} /> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Close dropdown */}
      {showDownloadMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDownloadMenu(false)}
        />
      )}
    </div>
  )
}
