import { AnimatedHeadline } from '@/components/sections/animated-headline';

/**
 * Shared dark page-title band — /stations, /about, /contact and /news all
 * use this exact fill, kept in one place instead of copy-pasted per page so
 * they can never drift apart. Same formula as the homepage's dark "Our
 * Stations" section, plus the soft centred green glow from the original
 * design (same recipe as the ComingSoon placeholder's corner glow, just
 * centred and sized for this shorter band instead of a full-height hero).
 */
export function PageHeroBand({ title }: { title: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-black py-14 sm:py-16">
      {/* Solid #000000, then a linear gradient from transparent #00A550 to #000000 at 21%. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 bg-[linear-gradient(180deg,rgba(0,165,80,0)_0%,rgba(0,0,0,0.21)_100%)]"
      />

      {/* Centred glow. The band clips it via overflow-hidden, so only a soft
          horizontal wash shows through behind the title. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-20 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,165,80,0.35),transparent_65%)] blur-3xl"
      />

      {/* The design's texture layer, tinted with its own ink colour (#009966). */}
      <div
        aria-hidden
        className="lattice-texture pointer-events-none absolute inset-0 -z-10 bg-[#009966] opacity-[0.08]"
      />

      <div className="container-page relative">
        {/* `reveal="load"` — this band sits above the fold on every page that
            uses it, so a scroll-linked reveal would have nothing to key off
            (same reasoning as the homepage hero's own headline). */}
        <AnimatedHeadline
          reveal="load"
          lines={[title]}
          className="font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.1] font-bold"
        />
      </div>
    </section>
  );
}
