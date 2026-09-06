import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';

import { contactPage, site } from '@/lib/site';

/**
 * The photo beside the contact form — one full-bleed image with a bottom
 * gradient scrim, "Call Now! / E-mail Us!" sitting directly on top of it
 * (not a separate bar below), per the Figma spec: 600 fixed / fill height,
 * ~600:612 (near-square), 40px inset padding, 16px gap between the two.
 */
export function ContactInfoPanel() {
  return (
    // reveal-up, not reveal-media: see the note in host-promo.tsx — the
    // media-in keyframe's clip-path permanently rounds this box's corners by
    // 16px regardless of its own border-radius, which is exactly what the
    // rounded-none below is trying to undo. reveal-up has no clip-path.
    <div
      className="reveal-up relative aspect-[600/612] overflow-hidden rounded-none"
      style={{ '--rev-start': '10%', '--rev-end': '55%', '--rev-delay': '0.1s' } as React.CSSProperties}
    >
      <Image
        src={contactPage.image.src}
        alt={contactPage.image.alt}
        fill
        sizes="(min-width: 1024px) 37.5rem, 92vw"
        // The source is a wide panorama; bias the crop right-of-centre so it
        // keeps the chargers, buses and skyline rather than the entry sign.
        className="object-cover object-[62%_42%]"
        quality={92}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.9)_100%)]"
      />

      <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-4 p-6 sm:p-10">
        {/* Divider between the two columns, matching the reference design. */}
        <div aria-hidden className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-white/30 sm:inset-y-10" />

        <a href={site.phone.href} className="flex flex-col gap-3 transition-opacity hover:opacity-80">
          <span className="bg-brand-500 grid h-10 w-10 place-items-center rounded-md">
            <Phone className="h-[1.125rem] w-[1.125rem] text-white" strokeWidth={2.25} aria-hidden />
          </span>
          <span>
            <span className="font-display block text-[1.0625rem] font-bold text-white">Call Now!</span>
            <span className="mt-0.5 block text-[0.8125rem] text-white/80">{site.phone.display}</span>
          </span>
        </a>
        <a href={`mailto:${site.email}`} className="flex flex-col gap-3 transition-opacity hover:opacity-80">
          <span className="bg-brand-500 grid h-10 w-10 place-items-center rounded-md">
            <Mail className="h-[1.125rem] w-[1.125rem] text-white" strokeWidth={2.25} aria-hidden />
          </span>
          <span>
            <span className="font-display block text-[1.0625rem] font-bold text-white">E-mail Us!</span>
            <span className="mt-0.5 block truncate text-[0.8125rem] text-white/80">{site.email}</span>
          </span>
        </a>
      </div>
    </div>
  );
}
