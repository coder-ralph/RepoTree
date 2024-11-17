'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const DocsPage = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => router.back()}
          className="mb-8 flex items-center text-white rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Button>

        <h1 className="text-3xl font-bold mb-6">RepoTree Documentation</h1>

        <div className="p-6 space-y-4 transition-colors duration-300">
          <h2 className="text-xl font-semibold">Introduction</h2>
          <p>
            RepoTree is a powerful tool that generates a clean ASCII representation of a GitHub repository structure, perfect for documentation and sharing.
          </p>

          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Download in Different Formats:</strong> Users can download the directory structure in formats like README.md, .txt, .json, or .html.</li>
            <li><strong>Syntax Highlighting:</strong> Enhances readability using prism-react-renderer for syntax highlighting.</li>
            <li><strong>Real-time Search Bar:</strong> Quickly filter and highlight specific files or directories within the generated structure.</li>
            <li><strong>Persistent State with LocalStorage:</strong> Saves the last fetched repository URL, maintaining input between sessions.</li>
            <li><strong>Interactive Tree View:</strong> Allows expansion or collapse of folders for better navigation.</li>
            <li><strong>Clipboard Copy Notification:</strong> Provides a toast notification when the directory structure is copied to the clipboard.</li>
            <li><strong>View Mode Toggle:</strong> Switch between ASCII view and Interactive view for an enhanced user experience.</li>
            <li><strong>Clear Input Functionality:</strong> Includes a button to clear the input field, improving usability.</li>
            <li><strong>Loading State Animation:</strong> Displays a spinner during data fetching for a smoother experience.</li>
            <li><strong>Error Handling and Validation:</strong> Validates GitHub URLs and shows error messages for invalid inputs.</li>
            <li><strong>Expandable ASCII Tree:</strong> Toggle the expansion of the ASCII tree to view a complete or limited structure.</li>
            <li><strong>Filtered Structure Generation:</strong> Generates a structure based on search terms for quick file/folder location.</li>
            <li><strong>Enhanced UI with Tailwind CSS:</strong> Provides a responsive and visually appealing interface using Tailwind CSS.</li>
            <li><strong>Server-Side Fetching with Next.js:</strong> Optimized server-side fetching improves performance and SEO.</li>
            <li><strong>Save Last Fetched URL:</strong> Automatically saves and repopulates the last fetched URL for convenience.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">Future Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Fetching User Branches:</strong> Allows users to select a specific branch instead of defaulting to the main branch.</li>
          </ul>

          <div className="mt-8">
            <Link
              href="/generator"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
            >
              Try RepoTree Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocsPage
