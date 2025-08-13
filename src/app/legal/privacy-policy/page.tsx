import type { Metadata } from 'next';
import BackButton from '@/components/back-button';

export const metadata: Metadata = {
  title: 'Privacy Policy - RepoTree',
  description:
    'RepoTree Privacy Policy: We do not collect personal data, use cookies, or track users. Read more about our privacy practices.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://ascii-repotree.vercel.app/legal/privacy-policy',
  },
};

const PrivacyPolicy = () => {
  const lastUpdated = '2025-07-21';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'PrivacyPolicy',
    name: 'RepoTree Privacy Policy',
    url: 'https://ascii-repotree.vercel.app/legal/privacy-policy',
    dateModified: lastUpdated,
    publisher: {
      '@type': 'Organization',
      name: 'RepoTree',
      url: 'https://ascii-repotree.vercel.app',
    },
    description:
      'RepoTree does not collect, store, or share any personal data. No cookies or tracking technologies are used.',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-3xl mx-auto">
        <BackButton />

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Last updated: July 21, 2025
        </p>

        <div className="p-6 space-y-4">
          <p>
            This Privacy Policy outlines RepoTree&apos;s approach to your privacy when using our website (
            <a href="https://ascii-repotree.vercel.app" className="text-blue-500 hover:underline">
              https://ascii-repotree.vercel.app
            </a>
            ).
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
            RepoTree was built with simplicity and privacy by design. Since we do not collect any data, there is no personal information to secure.
          </p>

          <h2 className="text-xl font-semibold">Policy Changes</h2>
          <p>
            If our privacy practices change in the future, we will update this policy and notify users accordingly.
          </p>

          <p>
            If you have any questions about this Privacy Policy, feel free to reach out to us at{' '}
            <a href="mailto:privacy@repotree.com" className="text-blue-500 hover:underline">
              privacy@repotree.com
            </a>.
          </p>

          <p>
            You can also read our{' '}
            <a href="/legal/cookie-policy" className="text-blue-500 hover:underline">
              Cookie Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
