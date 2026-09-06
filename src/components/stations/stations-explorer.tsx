'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { StationListItem } from '@/components/stations/station-list-item';
import { stationStatus, type StationRecord, type StationStatus } from '@/lib/stations/types';
import { trackStationView } from '@/lib/track-station-view';
import { cn } from '@/lib/utils';

// Leaflet touches `window` at import time, so the map can only render on the
// client. `ssr: false` keeps it out of the server render entirely rather than
// hydrating into a mismatch.
const StationsMap = dynamic(
  () => import('@/components/stations/stations-map').then((mod) => mod.StationsMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-[#EEF3F0] text-sm text-[#5A6E5A]">
        Loading map…
      </div>
    ),
  },
);

type Filter = 'all' | StationStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'occupied', label: 'Occupied' },
];

export function StationsExplorer({ stations }: { stations: StationRecord[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // Deep link from elsewhere on the site (the homepage station cards link
  // here as /stations?station=<id>) — a lazy initializer, not an effect, so
  // this is the selection on the very first render rather than a follow-up
  // one. Tracking the view still needs an effect, since that's a call to an
  // external system rather than a plain state derivation — see below.
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const focusId = searchParams.get('station');
    return focusId && stations.some((station) => station.id === focusId) ? focusId : null;
  });

  const counts = useMemo(() => {
    const result = { all: stations.length, available: 0, occupied: 0 };
    for (const station of stations) result[stationStatus(station)] += 1;
    return result;
  }, [stations]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stations.filter((station) => {
      if (filter !== 'all' && stationStatus(station) !== filter) return false;
      if (!needle) return true;
      return (
        station.name.toLowerCase().includes(needle) ||
        station.city.toLowerCase().includes(needle) ||
        station.address.toLowerCase().includes(needle)
      );
    });
  }, [stations, filter, query]);

  function selectStation(id: string) {
    setSelectedId(id);
    trackStationView(id);
  }

  // The deep-linked station (see the selectedId initializer above) is
  // already selected on first render; this only records the engagement ping
  // for it, same as a manual click would.
  useEffect(() => {
    const focusId = searchParams.get('station');
    if (focusId && stations.some((station) => station.id === focusId)) {
      trackStationView(focusId);
    }
    // Only ever meant to run once, for the id present when the page loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col lg:h-[42rem] lg:flex-row">
      <aside className="flex flex-col border-b border-black/8 bg-white lg:h-full lg:w-[23.75rem] lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A6E5A]/60"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or city…"
              aria-label="Search stations by name or city"
              className="focus:border-brand-500 w-full rounded-md border border-black/12 bg-white py-2.5 pr-3 pl-9 text-[0.875rem] leading-4 text-[#0A0A0A] outline-none placeholder:text-[#5A6E5A]/50"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setFilter(entry.id)}
                  aria-pressed={filter === entry.id}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[0.8125rem] leading-4 font-medium transition-colors',
                    filter === entry.id
                      ? 'bg-brand-500 text-white'
                      : 'text-[#5A6E5A] hover:bg-black/5',
                  )}
                >
                  {entry.label} ({counts[entry.id]})
                </button>
              ))}
            </div>
            <span className="shrink-0 text-[0.75rem] text-[#5A6E5A]/70">
              {visible.length} station{visible.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4 lg:max-h-none">
          {stations.length === 0 ? (
            <p className="p-4 text-center text-sm text-[#5A6E5A]">
              No stations published yet. Check back soon.
            </p>
          ) : visible.length === 0 ? (
            <p className="p-4 text-center text-sm text-[#5A6E5A]">
              No stations match your search.
            </p>
          ) : (
            visible.map((station) => (
              <StationListItem
                key={station.id}
                station={station}
                selected={station.id === selectedId}
                onSelect={() => selectStation(station.id)}
              />
            ))
          )}
        </div>

        <div className="border-t border-black/8 p-4 text-center text-[0.8125rem] text-[#5A6E5A]">
          Can&apos;t find a station?{' '}
          <Link href="/contact" className="text-brand-500 font-semibold hover:underline">
            Contact our support team.
          </Link>
        </div>
      </aside>

      {/* `isolate` is load-bearing: Leaflet's own CSS gives its zoom/attribution
          controls z-index: 1000, and without a stacking context here to
          contain that, it escapes past the site's fixed header (z-50) and
          mobile nav (z-[60]) — exactly the bug this fixes. */}
      <div className="relative isolate h-[26rem] w-full sm:h-[32rem] lg:h-full lg:flex-1">
        <StationsMap stations={visible} selectedId={selectedId} onSelect={selectStation} />

        <div className="pointer-events-none absolute right-4 bottom-4 z-[400] rounded-md bg-white/95 p-3 text-[0.75rem] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur">
          <p className="mb-1.5 font-semibold text-[#0A0A0A]">Legend</p>
          <p className="flex items-center gap-1.5 text-[#5A6E5A]">
            <span className="h-2 w-2 rounded-full bg-[#00A550]" /> Available
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[#5A6E5A]">
            <span className="h-2 w-2 rounded-full bg-[#B45309]" /> Occupied
          </p>
        </div>
      </div>
    </div>
  );
}
