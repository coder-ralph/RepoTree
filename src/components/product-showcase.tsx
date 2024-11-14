'use client'

import { motion } from 'framer-motion'

const ProductShowcase = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 mb-10 lg:mb-0"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Simplify Your Repository Structure
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              RepoTree provides a clean and intuitive way to visualize your GitHub repository structure. 
              Perfect for documentation and easy sharing with your team.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="rounded-lg shadow-2xl overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase
