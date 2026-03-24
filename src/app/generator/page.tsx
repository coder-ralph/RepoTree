import RepoTreeGenerator from '@/components/generator/repo-tree-generator';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <RepoTreeGenerator />
      </main>
      <Footer />
    </div>
  );
}
