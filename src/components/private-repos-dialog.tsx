"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, Eye, EyeOff, ExternalLink, Shield, Info, ChevronDown, ChevronRight } from "lucide-react"

interface PrivateReposDialogProps {
  repoType: "github" | "gitlab"
}

// Token validation functions
const validateGitHubToken = (token: string): boolean => {
  // GitHub classic tokens: ghp_ followed by 36 characters
  // GitHub fine-grained tokens: github_pat_ followed by more characters
  const classicPattern = /^ghp_[A-Za-z0-9]{36}$/
  const fineGrainedPattern = /^github_pat_[A-Za-z0-9_]{82,}$/
  return classicPattern.test(token) || fineGrainedPattern.test(token)
}

const validateGitLabToken = (token: string): boolean => {
  // GitLab personal access tokens: glpat- followed by 20 characters
  // GitLab project access tokens: glpat- followed by 20 characters
  // GitLab group access tokens: glpat- followed by 20 characters
  const personalTokenPattern = /^glpat-[A-Za-z0-9_-]{20}$/
  return personalTokenPattern.test(token)
}

export default function PrivateReposDialog({ repoType }: PrivateReposDialogProps) {
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false)

  const storageKey = repoType === "github" ? "github_personal_token" : "gitlab_personal_token"
  const eventName = repoType === "github" ? "github-token-updated" : "gitlab-token-updated"

  useEffect(() => {
    const storedToken = localStorage.getItem(storageKey)
    setHasToken(!!storedToken)
  }, [storageKey])

  const isTokenValid = (): boolean => {
    if (!token.trim()) return false
    
    if (repoType === "github") {
      return validateGitHubToken(token.trim())
    } else {
      return validateGitLabToken(token.trim())
    }
  }

  const handleSaveToken = () => {
    if (isTokenValid()) {
      localStorage.setItem(storageKey, token.trim())
      setHasToken(true)
      setToken("")
      setIsOpen(false)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent(eventName))
    }
  }

  const handleClearToken = () => {
    localStorage.removeItem(storageKey)
    setHasToken(false)
    setToken("")
    setIsOpen(false)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(eventName))
  }

  const getTokenPlaceholder = () => {
    return repoType === "github" 
      ? "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
      : "glpat-xxxxxxxxxxxxxxxxxxxx"
  }

  const getDocsUrl = () => {
    return repoType === "github"
      ? "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
      : "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
  }

  const getTokenRequirements = () => {
    if (repoType === "github") {
      return (
        <ul className="list-disc list-inside space-y-1">
          <li>Must have &quot;repo&quot; scope for private repository access</li>
          <li>Can be a classic token (ghp_) or fine-grained token (github_pat_)</li>
          <li>Should not expire soon (or set no expiration)</li>
          <li>Classic tokens should be exactly 40 characters (ghp_ + 36 chars)</li>
        </ul>
      )
    } else {
      return (
        <ul className="list-disc list-inside space-y-1">
          <li>Must have &quot;read_repository&quot; scope for repository access</li>
          <li>Personal access token format: glpat- followed by 20 characters</li>
          <li>Should not expire soon (or set no expiration)</li>
          <li>Must be exactly 26 characters total (glpat- + 20 chars)</li>
        </ul>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white border-blue-500">
          {hasToken ? (
            <>
              <Unlock className="h-4 w-4 text-green-600" />
              Private Repos enabled
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Private Repos
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter {repoType === "github" ? "GitHub" : "GitLab"} Personal Access Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            To enable access to private repositories, you&apos;ll need to provide a {repoType === "github" ? "GitHub" : "GitLab"} Personal Access Token with the
            {repoType === "github" ? " repo" : " read_repository"} scope. The token will be stored locally in your browser.{" "}
            <a
              href={getDocsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
            >
              Find out how here
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>

          <div className="space-y-3">
            {/* Disclaimer Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-md">
              <button
                onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
                className="w-full flex items-center gap-2 p-2.5 text-left"
              >
                {isDisclaimerExpanded ? (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-medium text-sm text-blue-600">Token Disclaimer</span>
              </button>
              
              {isDisclaimerExpanded && (
                <div className="px-2.5 pb-2.5 space-y-2">
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Security:</strong> Your token is stored locally in your browser and used directly with {repoType === "github" ? "GitHub" : "GitLab"}&apos;s
                      API. It&apos;s never sent to our servers or shared with anyone.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Important:</strong> Your token will only give you access to repositories you own or have been
                      granted access to. You cannot access other people&apos;s private repositories with your token.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>

          {hasToken && (
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                Private repository access is currently enabled for {repoType === "github" ? "GitHub" : "GitLab"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <div className="relative">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                placeholder={getTokenPlaceholder()}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`pr-10 ${token && !isTokenValid() ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {token && !isTokenValid() && (
              <p className="text-sm text-red-500">
                Please enter a valid {repoType === "github" ? "GitHub" : "GitLab"} personal access token.
              </p>
            )}
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Token Requirements:</strong>
            </p>
            {getTokenRequirements()}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveToken} disabled={!isTokenValid()} className="flex-1">
              Save Token
            </Button>
            {hasToken && (
              <Button onClick={handleClearToken} variant="outline" className="flex-1 bg-transparent">
                Clear Token
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
