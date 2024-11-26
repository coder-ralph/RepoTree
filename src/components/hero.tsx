'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

import { HeroHighlight, Highlight } from './hero-highlight';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Hero = () => {
  return (
    <HeroHighlight>
      <section id="home" className="pt-32 md:pt-40 pb-20 md:pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white font-bold mb-6">
              Visualize Your <Highlight>GitHub Repos</Highlight>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto">
              Generate a clean ASCII tree format of any GitHub repository in
              seconds.
            </p>
            <Link href="/generator">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-5 sm:py-6 px-8 sm:px-10 rounded-full transition-colors duration-300"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </HeroHighlight>
  );
};

export default Hero;
