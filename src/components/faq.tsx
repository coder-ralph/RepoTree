'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

interface FAQItemProps {
  question: string
  answer: string
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div 
      variants={fadeIn} 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <button
        className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-base sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{question}</h4>
        {isOpen ? <Minus className="flex-shrink-0 text-blue-600" /> : <Plus className="flex-shrink-0 text-blue-600" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-6 pb-6 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FAQ = () => {
  const faqItems = [
    {
      question: "How does RepoTree work?",
      answer: "RepoTree fetches the structure of your GitHub repository and generates it into a clean ASCII tree format, making it easy to visualize and share."
    },
    {
      question: "Is RepoTree free to use?",
      answer: "Yes, RepoTree is completely free to use for public GitHub repositories."
    },
    {
      question: "Can I use RepoTree for private repositories?",
      answer: "Currently, RepoTree only supports public repositories. We're working on adding support for private repositories in the future."
    }
  ]

  return (
    <section id="faq" className="py-16 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-20 lg:px-32">
        <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">Frequently Asked Questions</h3>
        <div className="space-y-6 max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
