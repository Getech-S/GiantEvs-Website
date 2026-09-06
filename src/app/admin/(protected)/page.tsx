import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity, BatteryCharging, Eye, Gauge, Zap } from 'lucide-react';

import { StatCard } from '@/components/admin/stat-card';
import { formatRelativeTime } from '@/lib/format';
import { listStations } from '@/lib/stations/store';
import { stationStatus } from '@/lib/stations/types';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stations = await listStations();

  const available = stations.filter((station) => stationStatus(station) === 'available').length;
  const occupied = stations.length - available;

  const totalBays = stations.reduce((sum, station) => sum + station.totalBays, 0);
  const freeBays = stations.reduce((sum, station) => sum + station.freeBays, 0);
  const occupiedBays = totalBays - freeBays;
  const utilization = totalBays === 0 ? 0 : Math.round((occupiedBays / totalBays) * 100);

  const totalViews = stations.reduce((sum, station) => sum + station.viewCount, 0);

  const topEngaged = [...stations]
    .filter((station) => station.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#5A6E5A]">
            Live snapshot of every station on the public map.
          </p>
        </div>
        <Link
          href="/admin/stations"
          className="bg-brand-500 hover:bg-brand-400 flex h-10 items-center rounded-md px-4 text-sm font-semibold text-white transition-colors"
        >
          Manage stations
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total stations" value={String(stations.length)} icon={Zap} />
        <StatCard label="Available now" value={String(available)} icon={BatteryCharging} tone="brand" />
        <StatCard label="Occupied now" value={String(occupied)} icon={Activity} tone="amber" />
        <StatCard label="Bay utilization" value={`${utilization}%`} icon={Gauge} />
        <StatCard label="Total views" value={totalViews.toLocaleString()} icon={Eye} />
      </div>

      {/* Available vs occupied, by bay count — the number that actually
          matters for capacity planning, not just station-level status. */}
      <div className="mt-8 rounded-lg border border-black/8 bg-white p-5">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium text-[#0A0A0A]">Bay availability</p>
          <p className="text-[#5A6E5A]">
            {freeBays} free / {totalBays} total
          </p>
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#F4F8F5]">
          {totalBays > 0 ? (
            <>
              <div
                className="h-full bg-[#00A550]"
                style={{ width: `${(freeBays / totalBays) * 100}%` }}
                title={`${freeBays} free`}
              />
              <div
                className="h-full bg-[#B45309]"
                style={{ width: `${(occupiedBays / totalBays) * 100}%` }}
                title={`${occupiedBays} occupied`}
              />
            </>
          ) : null}
        </div>
        <div className="mt-2 flex gap-4 text-xs text-[#5A6E5A]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00A550]" /> Free
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#B45309]" /> Occupied
          </span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-[#0A0A0A]">Most visited stations</h2>
        <p className="mt-1 text-sm text-[#5A6E5A]">
          Counted when a visitor selects a station on the public map or list — real traffic, not
          estimates.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-black/8 bg-white">
          {topEngaged.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#5A6E5A]">
              No visitor engagement recorded yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/8 text-[#5A6E5A]">
                  <th className="px-4 py-3 font-medium">Station</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Last viewed</th>
                </tr>
              </thead>
              <tbody>
                {topEngaged.map((station) => (
                  <tr key={station.id} className="border-b border-black/6 last:border-0">
                    <td className="px-4 py-3 font-medium text-[#0A0A0A]">{station.name}</td>
                    <td className="px-4 py-3 text-[#5A6E5A]">{station.city}</td>
                    <td className="px-4 py-3 tabular-nums text-[#0A0A0A]">{station.viewCount}</td>
                    <td className="px-4 py-3 text-[#5A6E5A]">
                      {formatRelativeTime(station.lastViewedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
