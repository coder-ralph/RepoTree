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
            This Privacy Policy explains how RepoTree (&quot;we&quot;,
            &quot;us&quot;, and &quot;our&quot;) collects, uses, and protects
            your personal data when you visit our website https://repotree.com
            (&quot;Website&quot;). It also explains your rights regarding your
            data.
          </p>

          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when
            you fill out forms or communicate with us. This may include your
            name, email address, and any other information you provide.
          </p>

          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <p>
            We use your information to improve the functionality of our Website
            and provide a better user experience. We do not sell your personal
            information to third parties.
          </p>

          <h2 className="text-xl font-semibold">Data Security</h2>
          <p>
            We take appropriate security measures to protect your personal
            information from unauthorized access, alteration, or destruction.
          </p>

          <p>
            For any questions regarding your data or this Privacy Policy, please
            contact us at privacy@repotree.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
