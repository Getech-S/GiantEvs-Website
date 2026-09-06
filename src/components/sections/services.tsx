import { ServiceCard } from '@/components/ui/service-card';
import { services, servicesSection } from '@/lib/site';

/**
 * Three service cards, middle one inverted. Server component — every animation
 * is CSS, so nothing here needs hydrating.
 *
 * Frame spec: 1440 fixed, hug 738px, 100px block / 60px inline padding, white.
 */
export function Services() {
  return (
    <section aria-labelledby="services-heading" className="bg-white py-20 sm:py-25">
      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          {servicesSection.eyebrow}
        </p>

        <h2
          id="services-heading"
          className="font-display reveal-up mt-4 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={
            { '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties
          }
        >
          {servicesSection.headline}
        </h2>

        {/*
          48px below the heading; 24px between the 424px columns. Three across
          only from `lg` — at tablet widths the columns fall to ~236px and the
          copy shreds, and a two-column stage would orphan the third card.
        */}
        <ul className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id} className="h-full">
              <ServiceCard service={service} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
