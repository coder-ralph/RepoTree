'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText } from 'lucide-react'

type StructureMap = Map<string, StructureMap | { type: 'file' }>

export default function AICodeDocumentation({ structureMap }: { structureMap: StructureMap }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedDocs, setGeneratedDocs] = useState<string | null>(null)

  const generateStructureDocs = (structure: StructureMap, depth: number = 0): string => {
    let doc = ""
    const indent = "  ".repeat(depth)

    structure.forEach((value, key) => {
      if (value && (value as { type: 'file' }).type === 'file') {
        doc += `${indent}- ${key} (File)\n`
      } else if (value instanceof Map) {
        doc += `${indent}- ${key} (Directory)\n`
        doc += generateStructureDocs(value, depth + 1)
      }
    })

    return doc
  }

  const generatePrompt = (structure: StructureMap): string => {
    const structureDocs = generateStructureDocs(structure)
    return `Project Documentation\n\nFolder Structure:\n\n${structureDocs}`
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    try {
      const prompt = generatePrompt(structureMap)
      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 8000,
            temperature: 0.9,
            top_p: 0.8,
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate documentation')

      const result = await response.json()
      setGeneratedDocs(result[0].generated_text)
    } catch (error) {
      console.error('Error generating documentation:', error)
      setGeneratedDocs('Error generating documentation. Please try again.')
    }

    setIsGenerating(false)
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mt-4 w-full md:w-auto">
        <FileText className="h-4 w-4" /> Generate Documentation
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate AI Documentation</DialogTitle>
            <DialogDescription>
              Create documentation based on your repository structure.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="documentation-level" className="text-right sm:text-left">
                Documentation Level
              </Label>
              <Select>
                <SelectTrigger id="documentation-level" className="col-span-3">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-grow overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500">Generating documentation...</p>
              </div>
            ) : generatedDocs ? (
              <div className="h-full overflow-y-auto">
                <Card>
                  <div className="p-4 h-full overflow-y-auto">
                    <pre className="text-sm font-mono break-words whitespace-pre-wrap">{generatedDocs}</pre>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Documentation'}
            </Button>
          </DialogFooter>
          <p className="mt-4 text-sm text-gray-600">
            <em>Note: The AI model can make mistakes or miss details. It may also struggle to document large repository structures.</em>
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
