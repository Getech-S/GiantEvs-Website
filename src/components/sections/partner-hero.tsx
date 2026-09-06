import Image from 'next/image';
import Link from 'next/link';

import { AnimatedHeadline } from '@/components/sections/animated-headline';
import { partnerHero } from '@/lib/site';

/**
 * Full-bleed image band, above the fold — same treatment as the homepage's
 * Host Promo section (components/sections/host-promo.tsx), same real photo
 * too, just this page's own headline/body and a CTA that scrolls to the
 * enquiry form below instead of linking out.
 */
export function PartnerHero() {
  return (
    <section
      aria-labelledby="partner-hero-heading"
      className="relative flex min-h-[26rem] items-end overflow-hidden bg-black sm:min-h-[30rem] lg:min-h-[34rem]"
    >
      <Image
        src={partnerHero.image.src}
        alt={partnerHero.image.alt}
        fill
        sizes="100vw"
        className="reveal-up object-cover"
        style={{ '--rev-start': '0%', '--rev-end': '45%' } as React.CSSProperties}
      />

      {/* Same legibility ramp as Host Promo: strong at the copy edge, fading across the frame. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.15)_60%,rgba(0,0,0,0)_100%),linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.75)_100%)]"
      />

      <div className="container-page relative w-full pb-10 sm:pb-14">
        <AnimatedHeadline
          id="partner-hero-heading"
          as="h1"
          reveal="load"
          joinOnMobile
          lines={partnerHero.headline}
          className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] font-bold tracking-normal text-white"
        />

        <p className="animate-rise-in mt-5 max-w-[32rem] text-[1rem] leading-[1.39] font-normal text-white/85">
          {partnerHero.body}
        </p>

        <div className="animate-rise-in mt-8" style={{ animationDelay: '0.7s' }}>
          <Link
            href={partnerHero.cta.href}
            className="bg-brand-500 hover:bg-brand-400 inline-flex h-12 items-center gap-2.5 rounded-[4px] px-6 text-[0.9375rem] font-bold text-white transition-colors duration-300 ease-[var(--ease-brand)]"
          >
            {partnerHero.cta.label}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
