import Image from 'next/image';

import { AnimatedHeadline } from '@/components/sections/animated-headline';
import { CtaButton } from '@/components/ui/cta-button';
import { hostPromo } from '@/lib/site';

/**
 * Full-bleed image band: copy bottom-left, call to action bottom-right.
 * Server component — the reveals are CSS, only the button is interactive.
 */
export function HostPromo() {
  return (
    <section
      aria-labelledby="host-promo-heading"
      className="relative flex min-h-[30rem] items-end overflow-hidden bg-black sm:min-h-[34rem] lg:min-h-[39.25rem]"
    >
      {/* reveal-up, not reveal-media: see the note in experience-cta.tsx —
          media-in's permanently-rounded clip-path is meant for card-shaped
          images, and would cut rounded corners into this sharp-edged,
          full-bleed background. reveal-up has no clip-path. */}
      <Image
        src={hostPromo.image.src}
        alt={hostPromo.image.alt}
        fill
        sizes="100vw"
        className="reveal-up object-cover"
        style={{ '--rev-start': '0%', '--rev-end': '45%' } as React.CSSProperties}
      />

      {/*
        Legibility gradient from the comp: black, 95% at the copy edge fading to
        transparent across the frame. Below `lg` the crop puts the copy over the
        bright car body, so a bottom-up ramp is layered under it there.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0)_100%),linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,0.7)_100%)] lg:bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0)_100%)]"
      />

      <div className="container-page relative w-full pb-10 sm:pb-12">
        <AnimatedHeadline
          id="host-promo-heading"
          as="h2"
          reveal="scroll"
          joinOnMobile
          lines={hostPromo.headline}
          className="font-display text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-white"
        />

        <p
          className="reveal-up mt-8 max-w-[36.25rem] text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-normal text-white"
          style={
            { '--rev-start': '26%', '--rev-end': '78%', '--rev-delay': '0.28s' } as React.CSSProperties
          }
        >
          {hostPromo.body}
        </p>

        <div
          className="reveal-up mt-6 flex justify-start sm:justify-end"
          style={
            { '--rev-start': '34%', '--rev-end': '86%', '--rev-delay': '0.4s' } as React.CSSProperties
          }
        >
          {/* Spec: hug 159.2 x 48, 4px radius, 1px #00A550 border on a #00A550 fill. */}
          <CtaButton
            href={hostPromo.cta.href}
            className="h-12 gap-2 rounded-[4px] border border-[#00A550] px-[1.2875rem] py-0 sm:px-[1.2875rem]"
          >
            {hostPromo.cta.label}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
