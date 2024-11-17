'use client'

import { useEffect } from 'react'
import { useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Header from '@/components/layout/header'
import Hero from '@/components/hero'
import About from '@/components/about'
import ProductShowcase from '@/components/product-showcase'
import FAQ from '@/components/faq'
import Footer from '@/components/layout/footer'

export default function LandingPage() {
  const controls = useAnimation()
  const [, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        <Hero />
        <About />
        <ProductShowcase />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
