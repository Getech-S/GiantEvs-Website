'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

import { AnimatedHeadline } from '@/components/sections/animated-headline';
import { HeroVideo } from '@/components/sections/hero-video';
import { CtaButton } from '@/components/ui/cta-button';
import { hero } from '@/lib/site';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  // Parallax the copy against the video as the hero scrolls away. This is the
  // one part of the hero that genuinely needs JS, and it degrades to a plain
  // static block when the script is absent.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '38%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.78], [1, prefersReduced ? 1 : 0]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate flex h-[calc(100svh-var(--spacing-header))] max-h-[46rem] min-h-[34rem] w-full flex-col justify-end overflow-hidden lg:h-[43.75rem]"
    >
      <HeroVideo />

      {/*
        Overlay stack, following the design spec: a flat 20% black scrim, then
        the green-to-black gradient, plus a left-hand ramp that guarantees the
        copy stays legible over any frame of the clip.
      */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,165,80,0.26)_0%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.45)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.34)_46%,rgba(0,0,0,0)_80%)]" />
        {/* Corner falloff, so the frame settles into the section edge. */}
        <div className="absolute inset-0 bg-[radial-gradient(62%_46%_at_100%_100%,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.22)_40%,rgba(0,0,0,0)_100%)]" />
      </div>

      {/* Curtain that lifts on first paint, tying the hero to the header entrance. */}
      <div aria-hidden className="bg-ink-900 animate-curtain-up absolute inset-0 z-20 origin-top" />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="container-page relative z-10 pb-16 sm:pb-20 lg:pb-24"
      >
        {/* Centred on phones, left-aligned from the sm breakpoint up. */}
        <div className="max-w-[42rem] text-center sm:text-left">
          <AnimatedHeadline
            id="hero-heading"
            lines={hero.headline}
            delay={0.55}
            className="font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.1] font-bold tracking-normal drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
          />

          <p
            className="animate-rise-in mx-auto mt-6 max-w-[41.75rem] text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-normal text-white sm:mx-0"
            style={{ animationDelay: '0.95s' }}
          >
            {hero.subheadline}
          </p>

          <div
            className="animate-rise-in mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            style={{ animationDelay: '1.1s' }}
          >
            <CtaButton href={hero.primaryCta.href} block>
              {hero.primaryCta.label}
            </CtaButton>
            <CtaButton href={hero.secondaryCta.href} variant="outline" block>
              {hero.secondaryCta.label}
            </CtaButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
