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

  try {
    const response = await axios.get<GitLabTreeItem[]>(
      `https://gitlab.com/api/v4/projects/${projectId}/repository/tree`,
      {
        params: { recursive: true, per_page: 100 },
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
      throw new Error(`Failed to fetch GitLab repository structure: ${error.message}`)
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

export const buildStructureString = (map: DirectoryMap, prefix = "", options: TreeCustomizationOptions): string => {
  let result = ""
  
  // Add root directory indicator if enabled
  if (prefix === "" && options.showRootDirectory) {
    result += "./\n"
  }

  const entries = Array.from(map.entries())
  const lastIndex = entries.length - 1

  entries.forEach(([key, value], index) => {
    const isLast = index === lastIndex
    const connector = getConnector(isLast, options.asciiStyle)
    const childPrefix = getChildPrefix(isLast, options.asciiStyle)
    const icon = options.useIcons ? getIcon(value instanceof Map) : ""
    
    // Add trailing slash for directories if enabled
    const displayName = (value instanceof Map && options.showTrailingSlash) ? `${key}/` : key

    result += `${prefix}${connector}${icon}${displayName}\n`
    if (value instanceof Map) {
      result += buildStructureString(value, `${prefix}${childPrefix}`, options)
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
