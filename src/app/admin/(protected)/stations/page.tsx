import type { Metadata } from 'next';
import Link from 'next/link';

import { DeleteStationButton } from '@/components/admin/delete-station-button';
import { QuickBayAdjuster } from '@/components/admin/quick-bay-adjuster';
import { formatRelativeTime } from '@/lib/format';
import { listStations } from '@/lib/stations/store';
import { stationStatus, type StationStatus } from '@/lib/stations/types';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin — Stations', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type StatusFilter = 'all' | StationStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'occupied', label: 'Occupied' },
];

export default async function AdminStationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const filter: StatusFilter =
    statusParam === 'available' || statusParam === 'occupied' ? statusParam : 'all';

  const stations = await listStations();
  const counts = {
    all: stations.length,
    available: stations.filter((station) => stationStatus(station) === 'available').length,
    occupied: 0,
  };
  counts.occupied = counts.all - counts.available;

  const visible = stations.filter(
    (station) => filter === 'all' || stationStatus(station) === filter,
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">Stations</h1>
          <p className="mt-1 text-sm text-[#5A6E5A]">
            {stations.length} station{stations.length === 1 ? '' : 's'} published on the public map.
          </p>
        </div>
        <Link
          href="/admin/stations/new"
          className="bg-brand-500 hover:bg-brand-400 flex h-10 items-center rounded-md px-4 text-sm font-semibold text-white transition-colors"
        >
          Add station
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-1.5">
        {FILTERS.map((entry) => (
          <Link
            key={entry.id}
            href={entry.id === 'all' ? '/admin/stations' : `/admin/stations?status=${entry.id}`}
            className={cn(
              'rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition-colors',
              filter === entry.id ? 'bg-brand-500 text-white' : 'text-[#5A6E5A] hover:bg-black/5',
            )}
          >
            {entry.label} ({counts[entry.id]})
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-black/8 bg-white">
        {stations.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#5A6E5A]">
            No stations yet. Add the first one to put it on the public map.
          </p>
        ) : visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#5A6E5A]">
            No {filter} stations right now.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/8 text-[#5A6E5A]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Bays</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((station) => {
                const status = stationStatus(station);
                return (
                  <tr key={station.id} className="border-b border-black/6 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0A0A0A]">{station.name}</p>
                      <p className="text-xs text-[#5A6E5A]">{station.address}</p>
                    </td>
                    <td className="px-4 py-3 text-[#5A6E5A]">{station.city}</td>
                    <td className="px-4 py-3">
                      <QuickBayAdjuster
                        id={station.id}
                        freeBays={station.freeBays}
                        totalBays={station.totalBays}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={status === 'available' ? 'text-[#00A550]' : 'text-[#B45309]'}>
                        {status === 'available' ? 'Available' : 'Occupied'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5A6E5A]">
                      <span className="tabular-nums text-[#0A0A0A]">{station.viewCount}</span>
                      <span className="ml-1.5 text-xs">
                        · {formatRelativeTime(station.lastViewedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/stations/${station.id}/edit`}
                          className="text-brand-500 text-sm font-medium hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteStationButton id={station.id} name={station.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
