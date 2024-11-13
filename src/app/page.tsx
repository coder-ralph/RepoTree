import Header from '@/components/header'
import Footer from '@/components/footer'
import About from '@/components/about'
import RepoTree from './repo-structure'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <About />
        <RepoTree />
      </main>
      <Footer />
    </div>
  )
}
