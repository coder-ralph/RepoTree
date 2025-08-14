'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BookOpenIcon, DownloadIcon, FolderTreeIcon } from 'lucide-react';

interface AboutCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const AboutCard = ({
  icon: Icon,
  title,
  description,
  index,
}: AboutCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
  >
    <Card className="p-6 rounded-xl bg-white dark:bg-blue-700 shadow-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/50 transition-all duration-300 transform hover:scale-105">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Icon className="w-16 h-16 text-blue-600 dark:text-white" />
        <CardTitle className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base md:text-lg">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const About = () => {
  const features = [
    {
      icon: FolderTreeIcon,
      title: 'Preview Structure',
      description: 'Enter a GitHub or GitLab repo URL to instantly preview its structure.',
    },
    {
      icon: DownloadIcon,
      title: 'Quick Download',
      description: 'Download in your chosen format with one click.',
    },
    {
      icon: BookOpenIcon,
      title: 'Easy Documentation',
      description: 'Simplify your project documentation effortlessly.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Discover <span className="text-blue-600">RepoTree</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Generate, preview, and download your repository structure in
            seconds.
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
  );
};

export default About;
