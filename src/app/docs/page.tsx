'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const MinimalistVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    video.currentTime = newTime;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-auto"
        src={src}
        onClick={togglePlay}
      />
      
      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Play/Pause Button in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            title={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 hover:h-2 transition-all duration-200"
            onClick={handleProgressClick}
            role="progressbar"
            aria-label="Video progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`Video progress: ${Math.round(progress)}%`}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors duration-200"
                aria-label={isPlaying ? "Pause video" : "Play video"}
                title={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors duration-200"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                title={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors duration-200"
              aria-label="Toggle fullscreen"
              title="Toggle fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocsPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => router.back()}
          className="mb-8 flex items-center text-white rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>

        <h1 className="text-3xl font-bold mb-6">RepoTree Documentation</h1>

        <div className="p-6 space-y-4 transition-colors duration-300">
          <section id="introduction" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              RepoTree is a powerful tool that generates a clean ASCII
              representation of a GitHub or GitLab repository structure, perfect for
              documentation and sharing.
            </p>
          </section>

          <section id="features" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Core Features</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Download in Different Formats:</strong> Users can download the directory structure in formats like README.md, .txt, .json, or .html.</li>
                    <li><strong>Syntax Highlighting:</strong> Enhances readability using prism-react-renderer for syntax highlighting.</li>
                    <li><strong>Real-time Search Bar:</strong> Quickly filter and highlight specific files or directories within the generated structure.</li>
                    <li><strong>AI Feedback Analysis:</strong> Provides feedback and suggestions for your repository structure based on AI analysis.</li>
                    <li><strong>Repository Analysis Graphs:</strong> Visualizes repository data, such as file type distribution and languages breakdown, with interactive graphs.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>User Experience</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Interactive Tree View:</strong> Allows expansion or collapse of folders for better navigation.</li>
                    <li><strong>Clipboard Copy Notification:</strong> Provides a toast notification when the directory structure is copied to the clipboard.</li>
                    <li><strong>View Mode Toggle:</strong> Switch between ASCII view and Interactive view for an enhanced user experience.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Technical Features</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Persistent State with LocalStorage:</strong> Saves the last fetched repository URL, maintaining input between sessions.</li>
                    <li><strong>Server-Side Fetching with Next.js:</strong> Optimized server-side fetching improves performance and SEO.</li>
                    <li><strong>Error Handling and Validation:</strong> Validates GitHub URLs and shows error messages for invalid inputs.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section id="tech-stack" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Next.js:</strong> React framework for server-side rendering and routing</li>
              <li><strong>React:</strong> JavaScript library for building user interfaces</li>
              <li><strong>TypeScript:</strong> Typed superset of JavaScript for improved developer experience</li>
              <li><strong>Tailwind CSS:</strong> Utility-first CSS framework for rapid UI development</li>
              <li><strong>Shadcn UI:</strong> Component library for consistent and customizable UI elements</li>
              <li><strong>Octokit:</strong> GitHub API client for fetching repository data</li>
              <li><strong>Recharts:</strong> Composable charting library for data visualization</li>
              <li><strong>Axios:</strong> Promise-based HTTP client for making requests</li>
              <li><strong>Framer Motion:</strong> Animation library for React</li>
              <li><strong>Lucide:</strong> A set of open-source icons for React</li>
              <li><strong>Radix UI:</strong> Low-level UI primitives for building accessible, high-quality design systems</li>
              <li><strong>File Saver:</strong> Library to save files on the client-side</li>
              <li><strong>Mini SVG Data URI:</strong> Utility for converting SVGs to data URIs</li>
            </ul>
          </section>

          <section id="demo" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Demo</h2>
            <div className="w-full">
              <MinimalistVideoPlayer src="/video/demo2.webm" />
            </div>
          </section>

          <section id="future-features" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Future Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Integration with Bitbucket repositories</li>
              <li>Advanced filtering options for large repositories</li>
              <li>Customizable ASCII art styles for tree representation</li>
            </ul>
          </section>

          <div className="mt-8">
            <Link
              href="/generator"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
            >
              Try RepoTree Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
