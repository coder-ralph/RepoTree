'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

interface HeroProps {
  onShowRepoTree: () => void
}

const Hero = ({ onShowRepoTree }: HeroProps) => {
  const scrollToRepoStructure = () => {
    onShowRepoTree()
    setTimeout(() => {
      const repoStructureElement = document.getElementById('generator')
      if (repoStructureElement) {
        repoStructureElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <section id="home" className="pt-32 md:pt-40 pb-20 md:pb-32 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Visualize Your GitHub Repos
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Convert any GitHub repository into a clean ASCII tree format in seconds
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-6 px-10 transition-colors duration-300"
            onClick={scrollToRepoStructure}
          >
            Try RepoTree Now
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
