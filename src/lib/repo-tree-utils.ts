import type { TreeCustomizationOptions } from "@/types/tree-customization"
import { Octokit } from "@octokit/rest"
import axios from "axios"

export interface TreeItem {
  path: string
  type: "tree" | "blob"
  name: string
}

export type DirectoryMap = Map<string, DirectoryMap | { type: "file"; name: string }>

interface GitLabTreeItem {
  path: string
  type: "tree" | "blob"
  name: string
}

// Validate GitHub and GitLab URLs
export const validateGitHubUrl = (url: string): boolean => {
  const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/
  return githubUrlPattern.test(url)
}

export const validateGitLabUrl = (url: string): boolean => {
  const gitlabUrlPattern = /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+\/?$/
  return gitlabUrlPattern.test(url)
}

// Initialize Octokit instance with proper token handling
const getOctokit = () => {
  // Check for environment variable first
  let githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN

  // If no environment token and we're on the client side, check localStorage
  if (!githubToken && typeof window !== "undefined") {
    const storedToken = localStorage.getItem("github_personal_token")
    githubToken = storedToken || undefined
  }

  return new Octokit({
    auth: githubToken,
    request: {
      fetch: fetch,
    },
  })
}

// Get GitLab token with proper token handling
const getGitLabToken = (): string | undefined => {
  // Check for environment variable first
  let gitlabToken = process.env.NEXT_PUBLIC_GITLAB_TOKEN

  // If no environment token and we're on the client side, check localStorage
  if (!gitlabToken && typeof window !== "undefined") {
    const storedToken = localStorage.getItem("gitlab_personal_token")
    gitlabToken = storedToken || undefined
  }

  return gitlabToken
}

// Fetch project structure from GitHub or GitLab
export const fetchProjectStructure = async (repoUrl: string, repoType: "github" | "gitlab"): Promise<TreeItem[]> => {
  if (repoType === "github") {
    return fetchGitHubProjectStructure(repoUrl)
  } else {
    return fetchGitLabProjectStructure(repoUrl)
  }
}

const fetchGitHubProjectStructure = async (repoUrl: string): Promise<TreeItem[]> => {
  const [owner, repo] = repoUrl.split("/").slice(-2)
  const octokit = getOctokit()

  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo })
    const branch = repoData.default_branch

    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    })

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: ref.object.sha,
      recursive: "true",
    })

    if (!data.tree || !Array.isArray(data.tree)) {
      throw new Error("Invalid repository structure received")
    }

    return data.tree.map((item) => ({
      path: item.path || "",
      type: item.type === "tree" ? "tree" : "blob",
      name: item.path ? item.path.split("/").pop() || "" : "",
    })) as TreeItem[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching GitHub project structure:", error)

    // Enhanced error handling with specific messages
    if (error.status === 404) {
      throw new Error("Repository not found. Please check the URL and ensure you have access to this repository.")
    } else if (error.status === 403) {
      if (error.message.includes("rate limit")) {
        throw new Error(
          "GitHub API rate limit exceeded. Please add a personal access token to increase your rate limit.",
        )
      } else {
        throw new Error("Access denied. You may need a personal access token to access this repository.")
      }
    } else if (error.status === 401) {
      throw new Error("Invalid or expired personal access token. Please check your token and try again.")
    } else {
      throw new Error(`Failed to fetch GitHub repository structure: ${error.message || "Unknown error"}`)
    }
  }
}

const fetchGitLabProjectStructure = async (repoUrl: string): Promise<TreeItem[]> => {
  const projectId = encodeURIComponent(repoUrl.split("gitlab.com/")[1])
  const gitlabToken = getGitLabToken()

  try {
    const headers: { [key: string]: string } = {}
    if (gitlabToken) {
      headers['PRIVATE-TOKEN'] = gitlabToken
    }

    const response = await axios.get<GitLabTreeItem[]>(
      `https://gitlab.com/api/v4/projects/${projectId}/repository/tree`,
      {
        params: { 
          recursive: true, 
          per_page: 100 
        },
        headers
      },
    )

    return response.data.map((item: GitLabTreeItem) => ({
      path: item.path,
      type: item.type,
      name: item.name,
    }))
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching GitLab project structure:", error)
      
      // Enhanced error handling for GitLab
      if (error.response?.status === 404) {
        throw new Error("Repository not found. Please check the URL and ensure you have access to this repository.")
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. You may need a personal access token to access this repository.")
      } else if (error.response?.status === 401) {
        throw new Error("Invalid or expired personal access token. Please check your token and try again.")
      } else {
        throw new Error(`Failed to fetch GitLab repository structure: ${error.message}`)
      }
    }
    throw new Error("An unknown error occurred while fetching GitLab project structure")
  }
}

// Generate and build project structure
export const generateStructure = (tree: TreeItem[]): DirectoryMap => {
  const structureMap: DirectoryMap = new Map()
  tree.forEach((item: TreeItem) => {
    const parts = item.path.split("/")
    let currentLevel: DirectoryMap | { type: "file"; name: string } = structureMap

    parts.forEach((part: string, index: number) => {
      if (!(currentLevel instanceof Map)) return
      if (!currentLevel.has(part)) {
        if (index === parts.length - 1 && item.type === "blob") {
          currentLevel.set(part, { type: "file", name: item.name })
        } else {
          currentLevel.set(part, new Map() as DirectoryMap)
        }
      }
      currentLevel = currentLevel.get(part)!
    })
  })
  return structureMap
}

// Get description for files and directories
const getDescription = (name: string, isDirectory: boolean, path?: string): string => {
  if (isDirectory) {
    return getDirectoryDescription(name, path || "")
  } else {
    return getFileDescription(name)
  }
}

// Directory descriptions based on common patterns
const getDirectoryDescription = (dirName: string, fullPath: string): string => {
  const lowerName = dirName.toLowerCase()
  const lowerPath = fullPath.toLowerCase()

  // Common directory patterns
  const directoryDescriptions: { [key: string]: string } = {
    // Build/Config directories
    ".github": "GitHub workflows and templates",
    ".vscode": "VS Code workspace settings",
    ".next": "Next.js build output",
    "dist": "Distribution/build files",
    "build": "Compiled application files",
    "out": "Output directory",
    "public": "Static assets and public files",
    "static": "Static assets",
    "assets": "Project assets and resources",
    
    // Source directories
    "src": "Source code",
    "app": "Application pages and routing",
    "pages": "Application pages",
    "components": "React components",
    "lib": "Utility functions and libraries",
    "utils": "Utility functions",
    "helpers": "Helper functions",
    "hooks": "Custom React hooks",
    "context": "React context providers",
    "store": "State management",
    "styles": "CSS and styling files",
    "css": "Stylesheets",
    "scss": "Sass stylesheets",
    "images": "Image assets",
    "fonts": "Font files",
    "icons": "Icon assets",
    
    // API and backend
    "api": "API routes and endpoints",
    "server": "Server-side code",
    "backend": "Backend application code",
    "routes": "Application routes",
    "controllers": "Route controllers",
    "models": "Data models",
    "middleware": "Express middleware",
    "database": "Database files and migrations",
    "migrations": "Database migrations",
    "seeds": "Database seed files",
    
    // Testing
    "test": "Test files",
    "tests": "Test files",
    "__tests__": "Jest test files",
    "spec": "Test specifications",
    "e2e": "End-to-end tests",
    "cypress": "Cypress test files",
    
    // Documentation
    "docs": "Documentation files",
    "documentation": "Project documentation",
    
    // Configuration
    "config": "Configuration files",
    "configs": "Configuration files",
    
    // Dependencies
    "node_modules": "NPM dependencies",
    "vendor": "Third-party libraries",
    
    // UI specific
    "ui": "UI components",
    "layout": "Layout components",
    "layouts": "Page layouts",
    "templates": "Component templates",
    
    // Types
    "types": "TypeScript type definitions",
    "@types": "TypeScript declarations",
    
    // Workflows
    "workflows": "CI/CD workflow files"
  }

  // Check exact matches first
  if (directoryDescriptions[lowerName]) {
    return directoryDescriptions[lowerName]
  }

  // Check for patterns in the full path
  if (lowerPath.includes("workflow") || lowerPath.includes(".github")) {
    return "CI/CD workflows"
  }
  if (lowerPath.includes("component")) {
    return "Component files"
  }
  if (lowerPath.includes("page")) {
    return "Page components"
  }
  if (lowerPath.includes("api")) {
    return "API endpoints"
  }

  return "Directory"
}

// File descriptions based on extensions and names
const getFileDescription = (fileName: string): string => {
  const lowerName = fileName.toLowerCase()
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  // Specific file names
  const specificFiles: { [key: string]: string } = {
    "readme.md": "Project documentation",
    "license": "Project license",
    "license.txt": "Project license",
    "license.md": "Project license",
    "changelog.md": "Version history",
    "contributing.md": "Contribution guidelines",
    "package.json": "NPM package configuration",
    "package-lock.json": "Dependency lock file",
    "yarn.lock": "Yarn dependency lock file",
    "tsconfig.json": "TypeScript configuration",
    "next.config.js": "Next.js configuration",
    "next.config.ts": "Next.js configuration",
    "tailwind.config.js": "Tailwind CSS configuration",
    "tailwind.config.ts": "Tailwind CSS configuration",
    "postcss.config.js": "PostCSS configuration",
    "eslint.config.js": "ESLint configuration",
    ".eslintrc.json": "ESLint rules",
    ".gitignore": "Git ignore rules",
    ".env": "Environment variables",
    ".env.example": "Environment variables template",
    ".env.local": "Local environment variables",
    "vercel.json": "Vercel deployment config",
    "dockerfile": "Docker container config",
    "docker-compose.yml": "Docker compose config",
    "makefile": "Build automation",
    "components.json": "Component configuration",
    "prettier.config.js": "Code formatting rules"
  }

  // Check specific file names first
  if (specificFiles[lowerName]) {
    return specificFiles[lowerName]
  }

  // Extension-based descriptions
  const extensionDescriptions: { [key: string]: string } = {
    // Web technologies
    "js": "JavaScript file",
    "jsx": "React component",
    "ts": "TypeScript file",
    "tsx": "React TypeScript component",
    "html": "HTML page",
    "css": "Stylesheet",
    "scss": "Sass stylesheet",
    "sass": "Sass stylesheet",
    "less": "Less stylesheet",
    
    // Configuration
    "json": "JSON configuration",
    "yaml": "YAML configuration",
    "yml": "YAML configuration",
    "toml": "TOML configuration",
    "xml": "XML file",
    
    // Documentation
    "md": "Markdown documentation",
    "txt": "Text file",
    "pdf": "PDF document",
    
    // Images
    "png": "PNG image",
    "jpg": "JPEG image",
    "jpeg": "JPEG image",
    "gif": "GIF image",
    "svg": "SVG vector image",
    "webp": "WebP image",
    "ico": "Icon file",
    
    // Video/Audio
    "mp4": "MP4 video",
    "webm": "WebM video",
    "avi": "AVI video",
    "mov": "QuickTime video",
    "mp3": "MP3 audio",
    "wav": "WAV audio",
    
    // Other programming languages
    "py": "Python script",
    "java": "Java source file",
    "cpp": "C++ source file",
    "c": "C source file",
    "php": "PHP script",
    "rb": "Ruby script",
    "go": "Go source file",
    "rs": "Rust source file",
    "swift": "Swift source file",
    "kt": "Kotlin source file",
    
    // Database
    "sql": "SQL script",
    "db": "Database file",
    
    // Archives
    "zip": "ZIP archive",
    "tar": "TAR archive",
    "gz": "Gzip archive",
    
    // Others
    "sh": "Shell script",
    "bat": "Batch script",
    "ps1": "PowerShell script"
  }

  return extensionDescriptions[extension] || "File"
}

export const buildStructureString = (map: DirectoryMap, prefix = "", options: TreeCustomizationOptions, currentPath = ""): string => {
  let result = ""
  
  // Add root directory indicator if enabled
  if (prefix === "" && options.showRootDirectory) {
    result += "./\n"
  }

  const entries = Array.from(map.entries())
  
  // Sort entries: directories first, then files
  // Within each group, sort alphabetically
  const sortedEntries = entries.sort(([keyA, valueA], [keyB, valueB]) => {
    const isDirectoryA = valueA instanceof Map
    const isDirectoryB = valueB instanceof Map
    
    // If one is directory and other is file, directory comes first
    if (isDirectoryA && !isDirectoryB) return -1
    if (!isDirectoryA && isDirectoryB) return 1
    
    // If both are same type (both directories or both files), sort alphabetically
    return keyA.localeCompare(keyB)
  })
  
  const lastIndex = sortedEntries.length - 1

  sortedEntries.forEach(([key, value], index) => {
    const isLast = index === lastIndex
    const connector = getConnector(isLast, options.asciiStyle)
    const childPrefix = getChildPrefix(isLast, options.asciiStyle)
    const icon = options.useIcons ? getIcon(value instanceof Map) : ""
    const isDirectory = value instanceof Map
    
    // Build current file/directory path
    const itemPath = currentPath ? `${currentPath}/${key}` : key
    
    // Add trailing slash for directories if enabled
    const displayName = (isDirectory && options.showTrailingSlash) ? `${key}/` : key
    
    // Get description for this item
    const description = getDescription(key, isDirectory, itemPath)
    const descriptionText = options.showDescriptions && description ? `                     # ${description}` : ""

    result += `${prefix}${connector}${icon}${displayName}${descriptionText}\n`
    if (isDirectory) {
      result += buildStructureString(value, `${prefix}${childPrefix}`, options, itemPath)
    }
  })

  return result
}

const getConnector = (isLast: boolean, asciiStyle: string): string => {
  switch (asciiStyle) {
    case "basic":
      return isLast ? "└── " : "├── "
    case "detailed":
      return isLast ? "└─── " : "├─── "
    case "minimal":
      return "  "
    default:
      return isLast ? "└── " : "├── "
  }
}

const getChildPrefix = (isLast: boolean, asciiStyle: string): string => {
  switch (asciiStyle) {
    case "basic":
    case "detailed":
      return isLast ? "    " : "│   "
    case "minimal":
      return "  "
    default:
      return isLast ? "    " : "│   "
  }
}

const getIcon = (isDirectory: boolean): string => {
  return isDirectory ? "📂 " : "📄 "
}

export const analyzeRepository = (map: DirectoryMap) => {
  const fileTypes: { [key: string]: number } = {}
  const languages: { [key: string]: number } = {}
  let totalFiles = 0

  const traverse = (node: DirectoryMap | { type: "file"; name: string }) => {
    if (node instanceof Map) {
      for (const [, value] of node) {
        traverse(value)
      }
    } else if (node.type === "file") {
      totalFiles++
      const extension = node.name.split(".").pop() || "Unknown"
      fileTypes[extension] = (fileTypes[extension] || 0) + 1

      const lang = getLanguageFromExtension(extension)
      languages[lang] = (languages[lang] || 0) + 1
    }
  }

  traverse(map)

  const fileTypeData = Object.entries(fileTypes).map(([name, value]) => ({ name, value }))
  const languageData = Object.entries(languages).map(([name, count]) => ({
    name,
    percentage: (count / totalFiles) * 100,
  }))

  return { fileTypes: fileTypeData, languages: languageData }
}

// Commonly used programming languages
const getLanguageFromExtension = (ext: string): string => {
  const languageMap: { [key: string]: string } = {
    js: "JavaScript",
    ts: "TypeScript",
    py: "Python",
    java: "Java",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    rb: "Ruby",
    cpp: "C++",
    c: "C",
    go: "Go",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    sql: "SQL",
    yaml: "YAML",
    xml: "XML",
    bash: "Bash",
    lua: "Lua",
    r: "R",
    dart: "Dart",
    rust: "Rust",
    vue: "Vue",
    sh: "Shell Script",
    cs: "C#",
    asp: "ASP.NET",
    fsharp: "F#",
    scala: "Scala",
    obj: "Objective-C",
    perl: "Perl",
    groovy: "Groovy",
    latex: "LaTeX",
    vhdl: "VHDL",
    m: "MATLAB",
    actionscript: "ActionScript",
    htmlbars: "HTMLBars",
    pug: "Pug",
    stylus: "Stylus",
    sass: "Sass",
    less: "Less",
    tsx: "TypeScript JSX",
    jsx: "JavaScript JSX",
    erb: "Ruby on Rails",
    hbs: "Handlebars",
    coffee: "CoffeeScript",
    aspnet: "ASP.NET",
    // Add more mappings as needed
  }
  return languageMap[ext] || "Other"
}
