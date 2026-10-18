'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

import { hero } from '@/lib/site';

/**
 * Full-bleed background video.
 *
 * The reveal (a fade over the placeholder) is CSS, so the frame still appears
 * if this script never runs — a muted, playsInline, autoplay video needs no
 * JavaScript to start. No zoom or pan is applied on top: the clip plays exactly
 * as shot, so the framing stays locked. The script only adds the niceties
 * browsers won't do for us:
 *
 * - retry play() for engines that reject the initial autoplay attempt,
 * - pause when the hero scrolls out of view or the tab is hidden, which keeps
 *   the video decoder off the CPU (and off the battery),
 * - hold a still frame when the visitor prefers reduced motion.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReduced) {
      video.pause();
      return;
    }

    const tryPlay = () => void video.play().catch(() => undefined);
    tryPlay();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0.05 },
    );
    observer.observe(video);

    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
      else tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReduced]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/*
        Plate behind the video: an upscaled 40px thumbnail of the clip's own
        mid-point frame. It paints with the HTML, matches the video's colours,
        and stays visible if decoding ever fails.
      */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url("${hero.video.lqip}")` }}
      />
      <div className="from-ink-900/60 via-brand-900/25 to-ink-900/60 absolute inset-0 bg-gradient-to-br" />

      {/*
        Full frame, no crop and no scaling beyond what object-cover needs, so
        the clip renders at the smallest upscale its resolution allows.
      */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="hero-video-motion absolute inset-0 h-full w-full object-cover"
      >
        <source src={hero.video.src} type="video/mp4" />
      </video>
    </div>
  );
}
