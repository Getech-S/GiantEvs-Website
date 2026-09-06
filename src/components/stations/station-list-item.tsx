'use client';

import { MapPin, Zap } from 'lucide-react';

import { stationStatus, type StationRecord } from '@/lib/stations/types';
import { cn } from '@/lib/utils';

const STATUS_STYLE = {
  available: {
    label: 'Available',
    dot: 'bg-[#00A550]',
    pill: 'bg-[#00A550]/8 border-[#00A550]/20 text-[#00A550]',
    accent: 'text-[#00A550]',
  },
  occupied: {
    label: 'Occupied',
    dot: 'bg-[#B45309]',
    pill: 'bg-[#B45309]/8 border-[#B45309]/20 text-[#B45309]',
    accent: 'text-[#B45309]',
  },
} as const;

type StationListItemProps = {
  station: StationRecord;
  selected: boolean;
  onSelect: () => void;
};

export function StationListItem({ station, selected, onSelect }: StationListItemProps) {
  const status = stationStatus(station);
  const tone = STATUS_STYLE[status];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'block w-full rounded-md border p-4 text-left transition-colors duration-200 ease-[var(--ease-brand)]',
        selected ? 'border-brand-500 bg-brand-500/5' : 'border-black/8 bg-white hover:border-black/15',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn('h-2.5 w-2.5 shrink-0 rounded-full', tone.dot)} />
          <span className="font-display text-[1rem] leading-[1.1] font-bold tracking-normal text-[#0A0A0A]">
            {station.name}
          </span>
        </span>

        <span
          className={cn(
            'shrink-0 rounded-sm border px-3 py-1.5 text-[0.875rem] leading-4 font-medium whitespace-nowrap',
            tone.pill,
          )}
        >
          {tone.label}
        </span>
      </div>

      <p className="mt-2 flex items-center gap-1.5 pl-[1.125rem] text-[0.875rem] leading-4 text-[#5A6E5A]">
        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden />
        {station.address}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 pl-[1.125rem]">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {station.connectors.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[0.75rem] leading-4 font-medium text-[#5A6E5A]/65"
            >
              <Zap className="h-3 w-3" strokeWidth={2} aria-hidden />
              {tag}
            </span>
          ))}
        </span>

        <span className={cn('shrink-0 text-[0.75rem] leading-4 font-bold whitespace-nowrap', tone.accent)}>
          {status === 'available' ? `${station.freeBays}/${station.totalBays} available` : 'Occupied'}
        </span>
      </div>
    </button>
  );
}
