import type { Metadata } from 'next';

import { PageHeroBand } from '@/components/sections/page-hero-band';
import { StationsExplorer } from '@/components/stations/stations-explorer';
import { listStations } from '@/lib/stations/store';

export const metadata: Metadata = { title: 'Stations' };

// The list changes whenever an admin edits it, and every visitor should see
// the current state — never cache this page.
export const dynamic = 'force-dynamic';

export default async function StationsPage() {
  const stations = await listStations();

  return (
    <div>
      <PageHeroBand title="Stations" />
      <StationsExplorer stations={stations} />
    </div>
  );
}
