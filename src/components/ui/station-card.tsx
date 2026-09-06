'use client';

import Link from 'next/link';
import { MapPin, Zap } from 'lucide-react';
import { motion } from 'motion/react';

import { AvailabilityMeter } from '@/components/ui/availability-meter';
import { stationStatus, type StationRecord } from '@/lib/stations/types';
import { cn } from '@/lib/utils';

/**
 * Status colours come straight from the comp (#B45309 for Occupied). They are
 * paired with a text label rather than standing alone, so the state is legible
 * without relying on hue.
 */
const statusStyles = {
  available: {
    label: 'Available',
    pill: 'text-brand-500 ring-brand-500/45 bg-brand-500/10',
    bolt: 'text-brand-500',
  },
  occupied: {
    label: 'Occupied',
    pill: 'text-[#B45309] ring-[#B45309]/45 bg-[#B45309]/12',
    bolt: 'text-[#B45309]',
  },
} as const;

type StationCardProps = {
  station: StationRecord;
  /** Position in the grid, used to stagger the reveal. */
  index: number;
};

export function StationCard({ station, index }: StationCardProps) {
  const status = stationStatus(station);
  const tone = statusStyles[status];

  return (
    // The whole card is the hit target, not just its text — it takes you to
    // /stations with this station pre-selected, so the map flies straight to
    // it (see the ?station= handling in stations-explorer.tsx).
    <Link
      href={`/stations?station=${encodeURIComponent(station.id)}`}
      className="group/link block h-full outline-none"
    >
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className={cn(
          'reveal-up group relative h-full overflow-hidden rounded-xl p-7 sm:p-9',
          'bg-[#0d0d0d]/90 ring-1 ring-inset ring-white/8 backdrop-blur-[1px]',
          'transition-[box-shadow,--tw-ring-color] duration-500 ease-[var(--ease-brand)]',
          'hover:ring-brand-500/35 hover:shadow-[0_24px_60px_-40px_rgba(0,165,80,0.9)]',
          'group-focus-visible/link:ring-2 group-focus-visible/link:ring-brand-500/60',
        )}
        style={
          {
            '--rev-start': `${10 + index * 3}%`,
            '--rev-end': `${62 + index * 3}%`,
            '--rev-delay': `${index * 0.09}s`,
          } as React.CSSProperties
        }
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2.5 py-1 ring-1 ring-inset',
              'text-[0.875rem] leading-4 font-medium tracking-normal',
              tone.pill,
            )}
          >
            {tone.label}
          </span>

          <Zap
            className={cn(
              'h-5 w-5 shrink-0 transition-transform duration-500 ease-[var(--ease-brand)]',
              'group-hover:scale-110',
              tone.bolt,
            )}
            strokeWidth={1.9}
            aria-hidden
          />
        </div>

        <h3 className="font-display mt-7 text-[1.5rem] leading-tight font-bold text-white">
          {station.name}
        </h3>

        <p className="mt-2.5 flex items-center gap-1.5 text-[0.875rem] leading-5 text-white/55">
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
          {station.address}
        </p>

        <div className="mt-8 flex items-center gap-3">
          <AvailabilityMeter free={station.freeBays} total={station.totalBays} />
          <span className="text-[0.875rem] leading-5 text-white/55">
            {station.freeBays}/{station.totalBays} available
          </span>
        </div>
      </motion.article>
    </Link>
  );
}
