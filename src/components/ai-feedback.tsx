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
    return `As an expert software architect, provide a 2-3 sentence feedback on the repository structure. 
    
Project Structure:

${structureDocs}

Feedback:`;
  };

  const extractFeedback = (response: string): string => {
    const feedbackIndex = response.indexOf('Feedback:');
    return feedbackIndex !== -1
      ? response.slice(feedbackIndex + 9).trim()
      : response.trim();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const prompt = generatePrompt(structureMap);
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-1.5B-Instruct',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 12000,
              temperature: 0.9,
              top_p: 0.95,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      const result = await response.json();

      if (result && result[0]?.generated_text) {
        const feedback = extractFeedback(result[0].generated_text);
        setGeneratedDocs(feedback);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      setGeneratedDocs('Error generating feedback. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mt-4 w-full md:w-auto">
        <MessageSquare className="h-4 w-4" /> Generate Feedback
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate AI Feedback</DialogTitle>
            <DialogDescription>
              Get feedback on your repository structure.
              <em className="block mt-2">
                Instructions: First, generate your repository structure, then
                click Generate Feedback.
              </em>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-hidden my-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm text-gray-500">Generating feedback...</p>
              </div>
            ) : generatedDocs ? (
              <div className="h-full overflow-y-auto">
                <Card>
                  <div className="p-4 h-full overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {generatedDocs}
                    </p>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
          <p className="mt-4 text-sm text-gray-600">
            <em>
              Note: This feedback is generated by an AI model and may not always
              be accurate. Use it as a general guideline.
            </em>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
