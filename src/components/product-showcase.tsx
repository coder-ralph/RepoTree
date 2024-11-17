'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import LazyVideo from '@/components/lazy-video'

const ProductShowcase = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 mb-10 lg:mb-0"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Simplify Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Repository Structure
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              RepoTree provides a clean and intuitive way to visualize your GitHub repository structure.
              Perfect for documentation and easy sharing with your team.
            </p>

            <Link href="/generator">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-5 sm:py-6 px-8 sm:px-10 rounded-full transition-colors duration-300"
              >
                Try it now
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="rounded-lg shadow-2xl overflow-hidden">
              {isClient && (
                <LazyVideo
                  src="/video/demo.webm"
                  className="w-full h-auto"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase
