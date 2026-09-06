import type { Metadata } from 'next';

import { Partners } from '@/components/sections/partners';
import { PartnerEnquiry } from '@/components/sections/partner-enquiry';
import { PartnerHero } from '@/components/sections/partner-hero';
import { PartnerHowItWorks } from '@/components/sections/partner-how-it-works';
import { PartnerValues } from '@/components/sections/partner-values';

export const metadata: Metadata = { title: 'Partner with Us' };

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
