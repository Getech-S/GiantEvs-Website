import { EvCharger } from 'lucide-react';

import { ContactForm } from '@/components/sections/contact-form';
import { ContactInfoPanel } from '@/components/sections/contact-info-panel';
import { contactPage } from '@/lib/site';

/**
 * "We're easy to reach" — form on the left, photo + call/email panel on the
 * right. The section itself is white; the mint (#F4F8F5) tint used
 * elsewhere on the site (Vision & Mission, etc.) is the form's own card
 * here, not the section background.
 */
export function ContactDetails() {
  return (
    <section aria-labelledby="contact-heading" className="bg-white py-16 sm:py-24">
      <div className="container-page">
        {/* Flush against the photo panel, 0 radius on both — the two used to
            sit apart with rounded corners; the design wants one continuous
            block instead. */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div
            className="reveal-up rounded-none bg-[#F4F8F5] p-6 sm:p-10"
            style={{ '--rev-start': '2%', '--rev-end': '40%' } as React.CSSProperties}
          >
            <p className="text-brand-500 inline-flex items-center gap-2 text-[1rem] leading-4 font-bold tracking-[0.5px]">
              {contactPage.eyebrow}
              <EvCharger className="h-[1.1rem] w-[1.1rem] rotate-[-68deg]" strokeWidth={2.25} aria-hidden />
            </p>
            <h2
              id="contact-heading"
              className="font-display mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.15] font-bold tracking-normal text-black"
            >
              {contactPage.headline}
            </h2>

            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <ContactInfoPanel />
        </div>
      </div>
    </section>
  );
}
