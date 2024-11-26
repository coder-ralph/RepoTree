'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AboutPage = () => {
  const router = useRouter();

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

        <h1 className="text-3xl font-bold mb-6">About RepoTree</h1>

        <div className="p-6 space-y-4 transition-colors duration-300">
          <p>
            RepoTree is a simple tool to visualize GitHub repositories. It helps
            developers and teams easily explore and understand their project
            structures.
          </p>

          <h2 className="text-xl font-semibold">Our Vision</h2>
          <p>
            We want every developer to quickly see the structure of any project,
            making it easier to collaborate and build efficiently.
          </p>

          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Clean ASCII view of GitHub repository structure</li>
            <li>Interactive tree view for easy navigation</li>
            <li>Download options in various formats</li>
            <li>Real-time search to find files or folders quickly</li>
          </ul>

          <p>
            Whether documenting a project or getting a quick overview, RepoTree
            makes it simple to understand your codebase.
          </p>

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
  );
};

export default AboutPage;
