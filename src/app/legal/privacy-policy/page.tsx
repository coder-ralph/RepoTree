import type { Metadata } from 'next';
import BackButton from '@/components/back-button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — RepoTree',
  description: 'RepoTree Privacy Policy: how we handle your data and authentication.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://ascii-repotree.vercel.app/legal/privacy-policy' },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-8">
            Last updated: March 23, 2026
          </p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Overview</h2>
              <p className="leading-relaxed">
                RepoTree is designed to respect your privacy. We collect minimal data and do not
                sell or share your information with third parties.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Authentication data
              </h2>
              <p className="leading-relaxed">
                When you sign in with GitHub or GitLab via OAuth, we receive an access token and
                basic profile information (name, avatar, email if public). This data is stored
                in an encrypted JWT session cookie. We do not store your access token in a
                database — it lives only in your browser session cookie and expires after 24 hours.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Repository access
              </h2>
              <p className="leading-relaxed">
                When you generate a repository tree, RepoTree fetches data from the GitHub or
                GitLab API on your behalf using your session token. Repository content is not
                stored on our servers — it is processed in memory and returned to your browser.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Local storage
              </h2>
              <p className="leading-relaxed">
                RepoTree stores your last-used repository URL and customization preferences
                in your browser&apos;s localStorage for convenience. This data never leaves your
                device and contains no sensitive information.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Analytics
              </h2>
              <p className="leading-relaxed">
                We use Vercel Analytics for anonymous usage metrics. No personal data is
                collected. No cross-site tracking occurs.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Third-party services
              </h2>
              <p className="leading-relaxed">
                RepoTree uses the GitHub REST API and GitLab REST API to fetch repository data.
                These interactions are governed by their respective privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Contact
              </h2>
              <p className="leading-relaxed">
                Questions about this policy? Open an issue on{' '}
                <a
                  href="https://github.com/coder-ralph/RepoTree/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:no-underline"
                >
                  GitHub
                </a>.
              </p>
            </section>

            <p className="text-xs">
              See also:{' '}
              <a href="/legal/cookie-policy" className="text-blue-600 underline hover:no-underline">
                Cookie Policy
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
