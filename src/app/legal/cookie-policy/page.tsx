import type { Metadata } from 'next';
import BackButton from '@/components/back-button';

export const metadata: Metadata = {
  title: 'Cookie Policy - RepoTree',
  description:
    'RepoTree Cookie Policy: We do not use cookies, tracking technologies, or third-party trackers. Full details here.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://ascii-repotree.vercel.app/legal/cookie-policy',
  },
};

const CookiePolicy = () => {
  const lastUpdated = '2025-07-21';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'RepoTree Cookie Policy',
    url: 'https://ascii-repotree.vercel.app/legal/cookie-policy',
    dateModified: lastUpdated,
    publisher: {
      '@type': 'Organization',
      name: 'RepoTree',
      url: 'https://ascii-repotree.vercel.app',
    },
    description:
      'RepoTree does not use cookies or tracking technologies. We do not place any cookies, including essential, functional, analytical, or advertising cookies.',
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

        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Last updated: July 21, 2025
        </p>

        <div className="p-6 space-y-4">
          <p>
            RepoTree does <strong>not use cookies</strong> or any similar tracking technologies on our website (
            <a href="https://ascii-repotree.vercel.app" className="text-blue-500 hover:underline">
              https://ascii-repotree.vercel.app
            </a>
            ).
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
            RepoTree was built with simplicity and privacy by design. Since we do not use cookies, there&apos;s no need to manage or opt out of cookie settings.
          </p>

          <h2 className="text-xl font-semibold">Policy Changes</h2>
          <p>
            If our cookie practices change in the future, we will update this policy and notify users accordingly.
          </p>

          <p>
            If you have any questions about our Cookie Policy, feel free to contact us at{' '}
            <a href="mailto:privacy@repotree.com" className="text-blue-500 hover:underline">
              privacy@repotree.com
            </a>.
          </p>

          <p>
            You can also read our{' '}
            <a href="/legal/privacy-policy" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
