import { useEffect, useRef } from 'react'

interface LazyVideoProps {
  src: string
  className?: string
}

export default function LazyVideo({ src, className }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.src = src
          videoRef.current.load()

          // Play the video only once it's ready
          videoRef.current.oncanplay = () => {
            videoRef.current?.play().catch(error => console.error('Auto-play was prevented:', error))
          }

          observer.unobserve(entry.target)
        }
      })
    }, options)

    // Capture the current ref value at the time the effect runs
    const currentVideoRef = videoRef.current;

    if (currentVideoRef) {
      observer.observe(currentVideoRef)
    }

    return () => {
      // Cleanup by referencing the captured currentVideoRef
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef)
      }
    }
  }, [src])

  return (
    <video 
      ref={videoRef}
      loop
      muted
      playsInline
      className={className}
      aria-label="Product demo video"
    >
      <source type="video/webm" />
      Your browser does not support the video tag.
    </video>
  )
}
