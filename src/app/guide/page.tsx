'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const GuidePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => router.back()}
          className="mb-8 flex items-center text-white rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>

        <h1 className="text-3xl font-bold mb-6">How to Use RepoTree Generator?</h1>

        <div className="p-6 space-y-6 transition-colors duration-300">
          <section className="mb-8">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Select your repository type and enter the GitHub or GitLab repository URL.</li>
              <li>Click the <strong>Generate</strong> button.</li>
              <li>Explore the structure with ASCII or interactive mode for easy navigation.</li>
              <li>Customize your ASCII theme to match your style.</li>
              <li>Use the real-time search to quickly find files or folders.</li>
              <li>Copy or download the tree structure in multiple formats.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">For Public Repositories</h2>
            <p>
              <strong>GitHub API Rate Limit:</strong> 60 requests per hour for unauthenticated users.
              <br />
              See the official GitHub rate limit documentation{' '}
              <a
                href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                here
              </a>
              .
              <br />
              <br />
              <strong>GitLab API:</strong> Rate limits vary based on server configuration.
              <br />
              Learn more from the GitLab rate limit documentation{' '}
              <a
                href="https://docs.gitlab.com/security/rate_limits/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                here
              </a>
              .
              <br />
              <br />
              To avoid rate limiting and access private repositories, it&apos;s recommended to use a Personal Access Token (PAT) for both platforms.
            </p>
          </section>

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

export default GuidePage;
