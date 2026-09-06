import Link from 'next/link';

import { CtaButton } from '@/components/ui/cta-button';
import { StationCard } from '@/components/ui/station-card';
import { stationsSection } from '@/lib/site';
import type { StationRecord } from '@/lib/stations/types';

export function Stations({ stations }: { stations: StationRecord[] }) {
  // Up to 6 of the most recently added stations — this is a teaser, the full
  // set with search and a live map lives at /stations.
  const featured = stations.slice(0, 6);

  return (
    <section
      aria-labelledby="stations-heading"
      // Spec: 1440 fixed, 100px block padding, 60px inline (via container-page).
      className="relative isolate overflow-hidden bg-black py-20 sm:py-25"
    >
      {/*
        Section fills from the spec: solid #000000, then a linear gradient from
        transparent #00A550 to #000000 at 21%. Both decorative.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,165,80,0)_0%,rgba(0,0,0,0.21)_100%)]"
      />

      {/*
        The design's texture layer, tinted with its own ink colour (#009966 —
        the RGB carried in the source file), which is where the section's faint
        green cast comes from.
      */}
      <div
        aria-hidden
        className="lattice-texture pointer-events-none absolute inset-0 -z-10 bg-[#009966] opacity-[0.08]"
      />

      <div className="container-page">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div className="max-w-[38.1875rem]">
            <p
              className="font-tag reveal-up text-brand-500 text-[1rem] leading-4 font-bold tracking-[0.5px]"
              style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
            >
              {stationsSection.eyebrow}
            </p>

            <h2
              id="stations-heading"
              className="font-display reveal-up mt-3 text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-white"
              style={
                { '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties
              }
            >
              {stationsSection.headline}
            </h2>
          </div>

          <div
            className="reveal-up shrink-0"
            style={
              { '--rev-start': '20%', '--rev-end': '70%', '--rev-delay': '0.24s' } as React.CSSProperties
            }
          >
            <CtaButton href={stationsSection.cta.href} variant="outline-brand">
              {stationsSection.cta.label}
            </CtaButton>
          </div>
        </div>

        {/* 56px gap between the header block and the grid, per the spec. */}
        {featured.length === 0 ? (
          <p className="mt-14 text-white/60">
            Stations are being added right now —{' '}
            <Link href="/stations" className="text-brand-400 font-semibold hover:underline">
              check the live map
            </Link>{' '}
            for the latest list.
          </p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((station, index) => (
              <li key={station.id}>
                <StationCard station={station} index={index} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
