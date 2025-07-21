'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <div className="p-6 space-y-4 transition-colors duration-300">
          <p>
            This Privacy Policy outlines RepoTree&apos;s approach to your privacy when using our website (https://ascii-repotree.vercel.app).
          </p>

          <h2 className="text-xl font-semibold">No Data Collection</h2>
          <p>
            RepoTree does <strong>not collect, store, or share</strong> any personal data. We do not require account creation or authentication, and we do not use cookies or tracking technologies.
          </p>

          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p>
            We may use GitHub&apos;s public APIs to fetch repository data, but this interaction is read-only and does not involve your personal data.
          </p>

          <h2 className="text-xl font-semibold">Security and Transparency</h2>
          <p>
            Since we do not collect any data, there is no personal information to secure. RepoTree is designed with simplicity and user privacy as a core principle.
          </p>

          <p>
            If you have any questions about this Privacy Policy, feel free to reach out to us at <a href="mailto:privacy@repotree.com" className="text-blue-500 hover:underline">privacy@repotree.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
