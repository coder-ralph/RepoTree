"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock, Eye, EyeOff, ExternalLink, Shield, Info } from "lucide-react"

export default function PrivateReposDialog() {
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("github_personal_token")
    setHasToken(!!storedToken)
  }, [])

  const handleSaveToken = () => {
    if (token.trim()) {
      localStorage.setItem("github_personal_token", token.trim())
      setHasToken(true)
      setToken("")
      setIsOpen(false)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("github-token-updated"))
    }
  }

  const handleClearToken = () => {
    localStorage.removeItem("github_personal_token")
    setHasToken(false)
    setToken("")
    setIsOpen(false)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("github-token-updated"))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          {hasToken ? (
            <>
              <Unlock className="h-4 w-4 text-green-600" />
              Private Repos
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Private Repos
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enter GitHub Personal Access Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            To enable access to private repositories, you&apos;ll need to provide a GitHub Personal Access Token with the
            repo scope. The token will be stored locally in your browser.{" "}
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
            >
              Find out how here
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>

          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Security:</strong> Your token is stored locally in your browser and used directly with GitHub&apos;s
              API. It&apos;s never sent to our servers or shared with anyone.
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Your token will only give you access to repositories you own or have been
              granted access to. You cannot access other people&apos;s private repositories with your token.
            </AlertDescription>
          </Alert>

          {hasToken && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                Private repository access is currently enabled
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <div className="relative">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pr-10"
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
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Token Requirements:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Must have &quot;repo&quot; scope for private repository access</li>
              <li>Can be a classic token or fine-grained token</li>
              <li>Should not expire soon (or set no expiration)</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveToken} disabled={!token.trim()} className="flex-1">
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
