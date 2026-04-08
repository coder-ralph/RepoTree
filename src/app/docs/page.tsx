'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

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
    const updateDuration = () => setDuration(video.duration);
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
    if (isPlaying) video.pause();
    else video.play();
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
    video.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else video.requestFullscreen();
  };

  const formatTime = (t: number) =>
    `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

  return (
    <div
      className="relative w-full bg-black rounded-xl overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video ref={videoRef} className="w-full h-auto" src={src} onClick={togglePlay} />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 hover:h-1.5 transition-all"
            onClick={handleProgressClick}
          >
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <span className="text-white text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Go back
          </button>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
            Documentation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Everything you need to know about using RepoTree.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Introduction
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                RepoTree generates clean ASCII tree representations of GitHub and GitLab
                repositories — perfect for README files, documentation, and code reviews.
                Public repositories work immediately without signing in. Private repositories
                require OAuth authentication.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Features
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="core">
                  <AccordionTrigger className="text-sm">Core features</AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                      <li><strong className="text-gray-800 dark:text-gray-300">ASCII tree output</strong> — clean, copy-ready directory structures</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Interactive tree view</strong> — collapsible folder explorer</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Repository analysis</strong> — file type and language breakdown charts</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Multiple export formats</strong> — .md, .txt, .json, .html</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Export as image</strong> — download tree as PNG or SVG for sharing</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Real-time search</strong> — filter files and folders instantly</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="customization">
                  <AccordionTrigger className="text-sm">Customization options</AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                      <li><strong className="text-gray-800 dark:text-gray-300">ASCII styles</strong> — basic, detailed, or minimal connectors</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">File icons</strong> — VS Code-style icons in both views</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Line numbers</strong> — numbered output (ASCII view)</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Descriptions</strong> — auto-generated file/folder descriptions</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Root folder name</strong> — show or hide the repository name</li>
                      <li><strong className="text-gray-800 dark:text-gray-300">Trailing slashes</strong> — append / to directories</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="auth">
                  <AccordionTrigger className="text-sm">Authentication</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      RepoTree uses OAuth for authentication — no personal access tokens needed.
                      Sign in with GitHub or GitLab to access private repositories and get higher
                      API rate limits (5,000 req/hr vs 60 req/hr unauthenticated for GitHub).
                      Your session token is stored in an encrypted httpOnly cookie and never
                      exposed to client-side JavaScript.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Demo
              </h2>
              <MinimalistVideoPlayer src="/video/demo2.webm" />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Roadmap
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 leading-relaxed">
                <li>→ Shareable tree links</li>
              </ul>
            </section>

            <div className="pt-4">
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Open Generator →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
