'use client';

import RepoTree from '@/app/generator/repo-tree-generator';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export default function RepoStructurePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900">
      <Header />
      <main className="py-20">
        <section id="generator" className="container mx-auto px-4">
          <RepoTree />
        </section>
      </main>
      <Footer />
    </div>
  );
}
