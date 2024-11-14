'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderTreeIcon, DownloadIcon, BookOpenIcon } from 'lucide-react'

interface AboutCardProps {
  icon: React.ElementType
  title: string
  description: string
  index: number
}

const AboutCard = ({ icon: Icon, title, description, index }: AboutCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
  >
    <Card className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Icon className="w-16 h-16 text-blue-600" />
        <CardTitle className="font-bold text-2xl text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-center text-lg">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
)

const About = () => {
  const features = [
    {
      icon: FolderTreeIcon,
      title: "Preview Structure",
      description: "Enter GitHub repo URL to preview structure instantly.",
    },
    {
      icon: DownloadIcon,
      title: "Quick Download",
      description: "Download as README.md with just one click.",
    },
    {
      icon: BookOpenIcon,
      title: "Easy Documentation",
      description: "Simplify your project documentation effortlessly.",
    },
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover <span className="text-blue-600">RepoTree</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Generate, preview, and download your repository structure in seconds.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AboutCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
