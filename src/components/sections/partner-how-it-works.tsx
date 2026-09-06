import Image from 'next/image';

import { partnerHowItWorks } from '@/lib/site';

/**
 * Image + step list, two columns — a different layout from the homepage's
 * How To Charge (numbered circles in a horizontal row), so its own
 * component rather than a reuse. Same light mint background (#F4F8F5) as
 * the rest of the site's light sections.
 */
export function PartnerHowItWorks() {
  return (
    <section aria-labelledby="partner-how-heading" className="bg-[#F4F8F5] py-20 sm:py-25">
      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          {partnerHowItWorks.eyebrow}
        </p>

        <h2
          id="partner-how-heading"
          className="font-display reveal-up mt-3 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={{ '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties}
        >
          {partnerHowItWorks.headline}
        </h2>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            className="reveal-media relative aspect-[4/3] overflow-hidden rounded-2xl"
            style={{ '--rev-start': '10%', '--rev-end': '55%' } as React.CSSProperties}
          >
            <Image
              src={partnerHowItWorks.image.src}
              alt={partnerHowItWorks.image.alt}
              fill
              sizes="(min-width: 1024px) 41.25rem, 92vw"
              className="object-cover"
            />
          </div>

          <ol className="reveal-up space-y-8 rounded-2xl border border-black/10 bg-white p-6 sm:p-8" style={{ '--rev-start': '14%', '--rev-end': '55%' } as React.CSSProperties}>
            {partnerHowItWorks.steps.map((step) => (
              <li key={step.title}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-[1.25rem] leading-tight font-bold text-black">
                    {step.title}
                  </h3>
                  <span aria-hidden className="text-black/30">
                    &mdash;
                  </span>
                </div>
                <div aria-hidden className="mt-3 border-b border-black/10" />
                <p className="text-sage-500 mt-4 text-[1rem] leading-[1.39] font-normal">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
