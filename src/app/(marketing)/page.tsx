import { headers } from 'next/headers';

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
import { site } from '@/lib/site';
import { listStations } from '@/lib/stations/store';

/** Schema.org payload so search engines can surface the brand + phone number. */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  slogan: site.tagline,
  url: site.url,
  description: site.description,
  logo: `${site.url}/brand/giant-evs-logo.png`,
  areaServed: { '@type': 'Country', name: 'Rwanda' },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: site.phone.display,
      contactType: 'customer service',
      areaServed: 'RW',
      availableLanguage: ['English', 'French', 'Kinyarwanda'],
    },
  ],
};

export default async function HomePage() {
  // The strict CSP blocks unnonced inline <script>, JSON-LD included.
  const nonce = (await headers()).get('x-nonce') ?? undefined;
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

      <script
        nonce={nonce}
        type="application/ld+json"
        // Static, developer-authored object — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
