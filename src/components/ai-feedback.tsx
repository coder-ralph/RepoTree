'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, MessageSquare } from 'lucide-react';

type StructureMap = Map<string, StructureMap | { type: 'file' }>;

export default function AIFeedback({
  structureMap,
}: {
  structureMap: StructureMap;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateStructureDocs = (
    structure: StructureMap,
    depth: number = 0,
  ): string => {
    let doc = '';
    const indent = '  '.repeat(depth);

    structure.forEach((value, key) => {
      if (value && (value as { type: 'file' }).type === 'file') {
        doc += `${indent}- ${key} (File)\n`;
      } else if (value instanceof Map) {
        doc += `${indent}- ${key} (Directory)\n`;
        doc += generateStructureDocs(value, depth + 1);
      }
    });

    return doc;
  };

  const generatePrompt = (structure: StructureMap): string => {
    const structureDocs = generateStructureDocs(structure);
    return `You are an expert software architect. Analyze this repository structure and provide concise, actionable feedback on:
1. Code organization and modularity.
2. Best practices or areas for improvement.
3. Architectural concerns, if any.
    
Project Structure:
    
${structureDocs}
    
Provide your feedback in a structured format, using bullet points or numbered lists. Keep your response practical and to the point, limited to 2-3 sentences.`;  
  };

  const handleGenerate = async () => {
    // Reset previous states
    setIsGenerating(true);
    setGeneratedDocs(null);
    setError(null);

    try {
      const prompt = generatePrompt(structureMap);
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate feedback');
      }

      setGeneratedDocs(responseData.feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      setGeneratedDocs(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mt-4 w-full md:w-auto">
        <MessageSquare className="h-4 w-4 mr-2" /> Generate Feedback
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Repository Analysis</DialogTitle>
            <DialogDescription>
              Get expert feedback on your repository structure and organization using Gemini AI.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-hidden my-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm text-gray-500">Analyzing repository structure...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                <p>Error: {error}</p>
                <p className="text-sm text-gray-500 mt-2">Please try again or check your API setup.</p>
              </div>
            ) : generatedDocs ? (
              <div className="h-full overflow-y-auto">
                <Card>
                  <div className="p-4 h-full overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{generatedDocs}</p>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Click Generate to analyze your repository structure
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Generate Analysis'
              )}
            </Button>
          </DialogFooter>
          <p className="mt-4 text-sm text-gray-600">
            <em>
              Note: This feedback is AI-generated and meant as a general guide.
            </em>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
