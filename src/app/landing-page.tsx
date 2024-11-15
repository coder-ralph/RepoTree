'use client'

import { useEffect, useState } from 'react'
import { useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Header from '@/components/header'
import Hero from '@/components/hero'
import About from '@/components/about'
import ProductShowcase from '@/components/product-showcase'
import RepoTree from './repo-structure'
import FAQ from '@/components/faq'
import Footer from '@/components/footer'

export default function LandingPage() {
  const controls = useAnimation()
  const [, inView] = useInView()
  const [showRepoTree, setShowRepoTree] = useState(false)

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const handleShowRepoTree = () => {
    setShowRepoTree(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        <Hero onShowRepoTree={handleShowRepoTree} />
        {showRepoTree && (
          <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" id="generator">
            <div className="container mx-auto px-4">
              <RepoTree />
            </div>
          </section>
        )}
        <About />
        <ProductShowcase />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
