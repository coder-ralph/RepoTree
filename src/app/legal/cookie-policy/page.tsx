import type { Metadata } from 'next';
import BackButton from '@/components/back-button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Cookie Policy — RepoTree',
  description: 'RepoTree Cookie Policy: we use only a single session cookie for authentication.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://ascii-repotree.vercel.app/legal/cookie-policy' },
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-8">
            Last updated: March 23, 2026
          </p>

          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Cookies we use
              </h2>
              <p className="leading-relaxed mb-3">
                RepoTree sets exactly one cookie when you sign in:
              </p>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Purpose</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-white">next-auth.session-token</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">Encrypted OAuth session</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Cookie details
              </h2>
              <p className="leading-relaxed">
                The session cookie is an <strong className="text-gray-800 dark:text-gray-200">httpOnly</strong>,{' '}
                <strong className="text-gray-800 dark:text-gray-200">secure</strong>,{' '}
                <strong className="text-gray-800 dark:text-gray-200">SameSite=Lax</strong> cookie.
                It is not accessible to JavaScript and cannot be read by third parties.
                It stores an encrypted JWT containing your session — no raw tokens.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Cookies we do not use
              </h2>
              <ul className="leading-relaxed space-y-1">
                <li>✗ No advertising or tracking cookies</li>
                <li>✗ No analytics cookies (we use server-side analytics only)</li>
                <li>✗ No third-party cookies</li>
                <li>✗ No persistent preference cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Unauthenticated users
              </h2>
              <p className="leading-relaxed">
                If you use RepoTree without signing in, no cookies are set at all.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Removing the cookie
              </h2>
              <p className="leading-relaxed">
                Click &quot;Sign out&quot; in the header to clear your session cookie immediately.
                It will also expire automatically after 24 hours.
              </p>
            </section>

            <p className="text-xs">
              See also:{' '}
              <a href="/legal/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
