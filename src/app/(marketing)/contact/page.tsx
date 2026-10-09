import type { Metadata } from 'next';

import { ContactDetails } from '@/components/sections/contact-details';
import { PageHeroBand } from '@/components/sections/page-hero-band';
import { pageMetadata } from '@/lib/seo';
import { seo } from '@/lib/site';

export const metadata: Metadata = pageMetadata({ path: '/contact', ...seo.contact });

export default function ContactPage() {
  return (
    <div>
      <PageHeroBand title="Contact us" />
      <ContactDetails />
    </div>
  );
}
