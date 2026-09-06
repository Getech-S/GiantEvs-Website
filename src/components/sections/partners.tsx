import Image from 'next/image';

import { partners, partnersSection } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Partner logo strip. Server component — the reveal is CSS only.
 */
export function Partners() {
  return (
    <section aria-labelledby="partners-heading" className="bg-white py-16 sm:py-20">
      <div className="container-page">
        {/* Rule running the full width, fading at both ends, with the label sitting on top of it. */}
        <div className="relative flex justify-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.12)_16%,rgba(0,0,0,0.12)_84%,rgba(0,0,0,0)_100%)]"
          />
          <h2
            id="partners-heading"
            className="font-display reveal-up relative rounded-full border border-black/10 bg-white px-6 py-2 text-[0.875rem] leading-4 font-bold tracking-normal text-[#0A0A0A]"
            style={{ '--rev-start': '8%', '--rev-end': '58%' } as React.CSSProperties}
          >
            {partnersSection.label}
          </h2>
        </div>

        <ul className="mt-12 grid grid-cols-2 lg:grid-cols-4">
          {partners.map((partner, index) => (
            <li
              key={partner.id}
              className={cn(
                'reveal-up flex h-[118px] items-center justify-center px-6',
                // Alternating tint only once the row is a single line of four;
                // in the two-column stack it would read as a vertical stripe.
                index % 2 === 1 && 'lg:bg-[#F3F9F6]',
              )}
              style={
                {
                  '--rev-start': `${12 + index * 4}%`,
                  '--rev-end': `${64 + index * 4}%`,
                  '--rev-delay': `${0.1 + index * 0.08}s`,
                } as React.CSSProperties
              }
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                sizes={`${partner.width}px`}
                className="object-contain"
                // Explicit inline auto/auto, not Tailwind's h-auto/w-auto: for
                // at least one logo's aspect ratio, Next's dev-mode check
                // still flagged only one axis as "auto" at runtime with the
                // class-based version. Inline style leaves no ambiguity —
                // this is Next's own documented fix for the warning.
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
