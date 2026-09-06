import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StationForm } from '@/components/admin/station-form';
import { getStation } from '@/lib/stations/store';

export const metadata: Metadata = { title: 'Admin — Edit station', robots: { index: false, follow: false } };

export default async function EditStationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await getStation(id);
  if (!station) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">Edit station</h1>
      <div className="mt-6">
        <StationForm mode="edit" station={station} />
      </div>
    </div>
  );
}
