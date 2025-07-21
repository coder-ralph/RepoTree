"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle, ExternalLink } from "lucide-react"

export default function GitHubHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-900 text-white hover:bg-blue-700 transition-colors duration-200 ease-in-out"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5 text-white" />
          <span className="text-white">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Use RepoTree</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-2">🔓 Public Repositories</h3>
            <p className="text-sm text-muted-foreground mb-2">
              You can generate structure for any public GitHub repository without authentication:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Simply paste the GitHub repository URL</li>
              <li>Click &quot;Generate&quot; to fetch the structure</li>
              <li>No token required for public repos</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🔒 Private Repositories</h3>
            <p className="text-sm text-muted-foreground mb-2">
              To access your private repositories, you need a Personal Access Token:
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
              <li>Generate a new token with &quot;repo&quot; scope</li>
              <li>Click &quot;Private Repos&quot; button and paste your token</li>
              <li>Your token is stored locally and never shared</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🛡️ Security & Privacy</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Your token is stored only in your browser&apos;s localStorage</li>
              <li>Tokens are never sent to our servers</li>
              <li>All API calls go directly from your browser to GitHub</li>
              <li>You can clear your token anytime</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">❓ Troubleshooting</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>
                <strong>Repository not found:</strong> Check URL and access permissions
              </li>
              <li>
                <strong>Rate limit exceeded:</strong> Add a personal access token
              </li>
              <li>
                <strong>Invalid token:</strong> Verify token has correct permissions
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help creating a token?{" "}
              <a
                href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                Follow GitHub&apos;s guide
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
