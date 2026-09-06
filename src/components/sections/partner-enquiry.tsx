import { Mail, MapPin, Phone } from 'lucide-react';

import { PartnerEnquiryForm } from '@/components/sections/partner-enquiry-form';
import { partnerEnquiry, site } from '@/lib/site';

/**
 * Enquiry-form band — black section, form card left, "prefer to talk"
 * contact panel right. Same dark fill formula as the other dark sections
 * (page-hero-band.tsx / team.tsx): black, green-to-black wash, lattice
 * texture.
 */
export function PartnerEnquiry() {
  return (
    <section
      id="partner-enquiry"
      aria-labelledby="partner-enquiry-heading"
      className="relative isolate overflow-hidden bg-black py-20 sm:py-25"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,165,80,0)_0%,rgba(0,0,0,0.21)_100%)]"
      />
      <div
        aria-hidden
        className="lattice-texture pointer-events-none absolute inset-0 -z-10 bg-[#009966] opacity-[0.08]"
      />

      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          {partnerEnquiry.eyebrow}
        </p>

        <h2
          id="partner-enquiry-heading"
          className="font-display reveal-up mt-3 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-white"
          style={{ '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties}
        >
          {partnerEnquiry.headline}
        </h2>

        <div className="reveal-up mx-auto mt-12 grid max-w-[62.5rem] grid-cols-1 overflow-hidden rounded-none lg:grid-cols-[1fr_0.7fr]" style={{ '--rev-start': '18%', '--rev-end': '58%', '--rev-delay': '0.2s' } as React.CSSProperties}>
          <PartnerEnquiryForm />

          <div className="bg-[#0A0A0A] p-6 sm:p-8">
            <p className="text-[0.8125rem] leading-4 font-medium text-white/70">
              {partnerEnquiry.sideEyebrow}
            </p>
            <p className="font-display mt-2 text-[1.1875rem] leading-[1.3] font-bold text-white">
              {partnerEnquiry.sideHeadline}
            </p>

            <div className="mt-8 space-y-6">
              <a href={site.phone.href} className="flex items-start gap-3">
                <span className="bg-brand-500 grid h-9 w-9 shrink-0 place-items-center rounded-md">
                  <Phone className="h-4 w-4 text-white" strokeWidth={2.25} aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.75rem] leading-4 text-white/70">
                    {partnerEnquiry.phoneCaption}
                  </span>
                  <span className="mt-0.5 block text-[0.9375rem] font-bold text-white">
                    {site.phone.display}
                  </span>
                </span>
              </a>

              <a href={`mailto:${site.email}`} className="flex items-start gap-3">
                <span className="bg-brand-500 grid h-9 w-9 shrink-0 place-items-center rounded-md">
                  <Mail className="h-4 w-4 text-white" strokeWidth={2.25} aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.75rem] leading-4 text-white/70">
                    {partnerEnquiry.emailCaption}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.9375rem] font-bold text-white">
                    {site.email}
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3">
                <span className="bg-brand-500 grid h-9 w-9 shrink-0 place-items-center rounded-md">
                  <MapPin className="h-4 w-4 text-white" strokeWidth={2.25} aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.75rem] leading-4 text-white/70">
                    {partnerEnquiry.location.caption}
                  </span>
                  <span className="mt-0.5 block text-[0.9375rem] font-bold text-white">
                    {partnerEnquiry.location.detail}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
