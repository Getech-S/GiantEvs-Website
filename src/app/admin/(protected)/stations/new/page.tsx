import type { Metadata } from 'next';

import { StationForm } from '@/components/admin/station-form';

export const metadata: Metadata = { title: 'Admin — Add station', robots: { index: false, follow: false } };

export default function NewStationPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">Add station</h1>
      <div className="mt-6">
        <StationForm mode="create" />
      </div>
    </div>
  );
}
