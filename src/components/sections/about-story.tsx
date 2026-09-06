'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

import { AnimatedHeadline } from '@/components/sections/animated-headline';
import { InlineVideo } from '@/components/ui/inline-video';
import { useMediaQuery } from '@/hooks/use-media-query';
import { aboutStory } from '@/lib/site';

/**
 * The About page's take on "Our Story" — same image+video treatment as the
 * homepage's version (components/sections/our-story.tsx), same two real
 * assets too (see aboutStory in site.ts), just the fuller two-paragraph copy.
 */
export function AboutStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const drift = !prefersReduced && isDesktop;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const leftY = useTransform(scrollYProgress, [0, 1], drift ? [30, -30] : [0, 0]);
  const rightY = useTransform(scrollYProgress, [0, 1], drift ? [-24, 24] : [0, 0]);

  return (
    <section ref={sectionRef} aria-labelledby="about-story-heading" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="container-page flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <motion.div
          style={{ y: leftY }}
          className="w-[46%] max-w-[18rem] shrink-0 lg:order-1 lg:w-72"
        >
          <div className="reveal-media relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={aboutStory.image.src}
              alt={aboutStory.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 288px, 46vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <div className="max-w-[42.5rem] text-center lg:order-2 lg:mt-2 lg:text-left">
          <p
            className="font-tag reveal-up text-brand-500 text-[1rem] leading-4 font-bold tracking-[0.5px]"
            style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
          >
            {aboutStory.eyebrow}
          </p>

          <AnimatedHeadline
            id="about-story-heading"
            as="h2"
            reveal="scroll"
            joinOnMobile
            lines={aboutStory.headline}
            className="font-display mt-4 text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          />

          {aboutStory.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 24)}
              className="reveal-up text-sage-500 mx-auto mt-6 max-w-[42.5rem] text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-normal first:mt-6 lg:mx-0"
              style={
                {
                  '--rev-start': `${28 + index * 12}%`,
                  '--rev-end': `${78 + index * 12}%`,
                  '--rev-delay': `${0.3 + index * 0.1}s`,
                } as React.CSSProperties
              }
            >
              {paragraph}
            </p>
          ))}
        </div>

        <motion.div
          style={{ y: rightY }}
          className="w-[38%] max-w-[14.8125rem] shrink-0 lg:order-3 lg:mt-30 lg:w-[14.8125rem]"
        >
          <div className="reveal-media relative aspect-[237/217] overflow-hidden rounded-2xl">
            <InlineVideo
              src={aboutStory.video.src}
              label={aboutStory.video.label}
              // Portrait source in a landscape box: bias the crop downward so
              // the two figures fill the frame rather than the wall above them.
              className="object-[50%_62%]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
