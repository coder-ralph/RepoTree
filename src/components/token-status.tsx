"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle, CheckCircle } from "lucide-react"

export default function TokenStatus() {
  const [hasToken, setHasToken] = useState(false)
  const [hasEnvToken, setHasEnvToken] = useState(false)

  useEffect(() => {
    const checkTokens = () => {
      const storedToken = localStorage.getItem("github_personal_token")
      setHasToken(!!storedToken)
      setHasEnvToken(!!process.env.NEXT_PUBLIC_GITHUB_TOKEN)
    }

    checkTokens()

    const handleTokenUpdate = () => {
      checkTokens()
    }

    window.addEventListener("github-token-updated", handleTokenUpdate)
    return () => {
      window.removeEventListener("github-token-updated", handleTokenUpdate)
    }
  }, [])

  if (hasEnvToken) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Developer Mode:</strong> Using environment token. You can access any public repository and your own
          private repositories.
        </AlertDescription>
      </Alert>
    )
  }

  if (hasToken) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Private Access Enabled:</strong> You can now access your private repositories. Your token is stored
          locally and never shared.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <strong>Public Access Only:</strong> Currently limited to public repositories. Click &quot;Private Repos&quot; to add your
        personal access token for private repository access.
      </AlertDescription>
    </Alert>
  )
}
