import Image from 'next/image';

import { AnimatedHeadline } from '@/components/sections/animated-headline';
import { CtaButton } from '@/components/ui/cta-button';
import { experienceCta } from '@/lib/site';

/**
 * Centred call-to-action band. Spec: 1440 fixed / 500 fixed, 100px padding,
 * 8px gap between the heading and the button row — tighter than every other
 * section's spacing on purpose, so the two read as one cluster.
 */
export function ExperienceCta() {
  return (
    <section
      aria-labelledby="experience-cta-heading"
      className="relative isolate flex min-h-[26rem] items-center overflow-hidden bg-black py-16 sm:py-[6.25rem] lg:h-[31.25rem] lg:min-h-0"
    >
      {/* reveal-up, not reveal-media: media-in's keyframe ends on a
          permanently-rounded clip-path, meant for the card-shaped images it
          was designed for — on a sharp-edged, full-bleed background it would
          leave four rounded cutouts at the corners showing the section's
          black fill through. reveal-up has no clip-path, just fade/rise/blur. */}
      <Image
        src={experienceCta.image.src}
        alt={experienceCta.image.alt}
        fill
        sizes="100vw"
        className="reveal-up object-cover"
        style={{ '--rev-start': '0%', '--rev-end': '45%' } as React.CSSProperties}
      />

      {/* Spec fill: flat #000000 at 75%, plus the site's standard green-to-black wash. */}
      <div aria-hidden className="absolute inset-0 bg-black/75" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,165,80,0)_0%,rgba(0,0,0,0.21)_100%)]"
      />

      <div className="container-page relative flex w-full flex-col items-center gap-2 text-center">
        <AnimatedHeadline
          id="experience-cta-heading"
          as="h2"
          reveal="scroll"
          joinOnMobile
          lines={experienceCta.headline}
          className="font-display text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-white"
        />

        <div
          className="reveal-up mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          style={
            { '--rev-start': '30%', '--rev-end': '80%', '--rev-delay': '0.3s' } as React.CSSProperties
          }
        >
          <CtaButton href={experienceCta.primaryCta.href} block>
            {experienceCta.primaryCta.label}
          </CtaButton>
          <CtaButton href={experienceCta.secondaryCta.href} variant="outline" block>
            {experienceCta.secondaryCta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
