'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';

type InlineVideoProps = {
  src: string;
  /** Announced to assistive tech, since the clip carries meaning here. */
  label: string;
  className?: string;
  poster?: string;
};

/**
 * A small, muted, looping clip used as page content.
 *
 * Plays only while it is on screen and the tab is visible, so an autoplaying
 * video further down the page never sits decoding in the background. Holds a
 * still frame when the visitor prefers reduced motion.
 */
export function InlineVideo({ src, label, className, poster }: InlineVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (prefersReduced) {
      video.pause();
      return;
    }

    const tryPlay = () => void video.play().catch(() => undefined);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);

    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
      else if (video.getBoundingClientRect().top < window.innerHeight) tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReduced]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      poster={poster}
      aria-label={label}
      className={cn('h-full w-full object-cover', className)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
