import type { Metadata } from 'next';

import { Hero } from '@/components/sections/hero';
import { OurStory } from '@/components/sections/our-story';
import { Calculator } from '@/components/sections/calculator';
import { HostPromo } from '@/components/sections/host-promo';
import { HowToCharge } from '@/components/sections/how-to-charge';
import { Partners } from '@/components/sections/partners';
import { Services } from '@/components/sections/services';
import { Stations } from '@/components/sections/stations';
import { Stories } from '@/components/sections/stories';
import { VipReserveFab } from '@/components/ui/vip-reserve-fab';
import { pageMetadata } from '@/lib/seo';
import { seo } from '@/lib/site';
import { listStations } from '@/lib/stations/store';

// The Organization structured data that used to live here is now emitted
// site-wide from the marketing layout (see organizationJsonLd in lib/seo.ts).
export const metadata: Metadata = pageMetadata({
  path: '/',
  title: seo.home.title,
  description: seo.home.description,
  absoluteTitle: true,
});

export default async function HomePage() {
  const stations = await listStations();

  return (
    <>
      <Hero />
      <OurStory />
      <Stations stations={stations} />
      <HowToCharge />
      <HostPromo />
      <Services />
      <Calculator />
      <Stories />
      <Partners />
      <VipReserveFab />
    </>
  );
}
