import type { Metadata } from 'next';

import { Partners } from '@/components/sections/partners';
import { PartnerEnquiry } from '@/components/sections/partner-enquiry';
import { PartnerHero } from '@/components/sections/partner-hero';
import { PartnerHowItWorks } from '@/components/sections/partner-how-it-works';
import { PartnerValues } from '@/components/sections/partner-values';
import { pageMetadata } from '@/lib/seo';
import { seo } from '@/lib/site';

export const metadata: Metadata = pageMetadata({ path: '/partner', ...seo.partner });

export default function PartnerPage() {
  return (
    <div>
      <PartnerHero />
      <PartnerValues />
      <PartnerHowItWorks />
      <PartnerEnquiry />
      <Partners />
    </div>
  );
}
