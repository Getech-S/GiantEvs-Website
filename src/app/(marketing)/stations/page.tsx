import { cache } from 'react';
import type { Metadata } from 'next';

import { PageHeroBand } from '@/components/sections/page-hero-band';
import { JsonLd } from '@/components/seo/json-ld';
import { StationsExplorer } from '@/components/stations/stations-explorer';
import { pageMetadata, stationsJsonLd } from '@/lib/seo';
import { seo } from '@/lib/site';
import { listStations } from '@/lib/stations/store';

// The list changes whenever an admin edits it, and every visitor should see
// the current state — never cache this page.
export const dynamic = 'force-dynamic';

// One database read per request, shared by generateMetadata and the page.
const getStations = cache(listStations);

export async function generateMetadata(): Promise<Metadata> {
  const stations = await getStations();
  // Name real stations in the snippet — "GiantEvs Kimironko Station (KG 213 St)" is what
  // someone searching for a charger near a landmark actually types.
  const named = stations
    .slice(0, 2)
    .map((station) => `${station.name} (${station.address})`)
    .join(' and ');
  const description = named
    ? `Live map of Giant Evs EV charging stations in Kigali and across Rwanda — including ${named}. See which chargers are free right now.`
    : seo.stations.description;

  return pageMetadata({ path: '/stations', title: seo.stations.title, description });
}

export default async function StationsPage() {
  const stations = await getStations();

  return (
    <div>
      <PageHeroBand title="Stations" />
      <StationsExplorer stations={stations} />
      {stations.length > 0 ? <JsonLd data={stationsJsonLd(stations)} /> : null}
    </div>
  );
}
