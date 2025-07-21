'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
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

        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>

        <div className="p-6 space-y-4 transition-colors duration-300">
          <p>
            RepoTree does <strong>not use cookies</strong> or any similar tracking technologies on our website (https://ascii-repotree.vercel.app).
          </p>

          <h2 className="text-xl font-semibold">No Use of Cookies</h2>
          <p>
            Our goal is to provide a simple, privacy-friendly experience. We do not place any cookies on your device, including essential, functional, analytical, or advertising cookies.
          </p>

          <h2 className="text-xl font-semibold">Third-Party Tracking</h2>
          <p>
            RepoTree does not embed third-party tracking scripts or services that set cookies. All interactions with GitHub repositories happen client-side using public APIs and do not involve any user-identifiable data.
          </p>

          <h2 className="text-xl font-semibold">Your Privacy Matters</h2>
          <p>
            Since we do not use cookies, there&apos;s no need to manage or opt out of cookie settings. RepoTree was built with privacy by design.
          </p>

          <p>
            If you have any questions about our Cookie Policy, feel free to contact us at <a href="mailto:privacy@repotree.com" className="text-blue-500 hover:underline">privacy@repotree.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
