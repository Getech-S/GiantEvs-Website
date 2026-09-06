import type { Metadata } from 'next';

import { ContactDetails } from '@/components/sections/contact-details';
import { PageHeroBand } from '@/components/sections/page-hero-band';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <div>
      <PageHeroBand title="Contact us" />
      <ContactDetails />
    </div>
  );
}
