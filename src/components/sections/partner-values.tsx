import { CheckCircle2, Leaf, Users } from 'lucide-react';

import { partnerValues, partnerValueSection, type PartnerValueIcon } from '@/lib/site';

const icons: Record<PartnerValueIcon, typeof Users> = {
  customers: Users,
  hassle: CheckCircle2,
  brand: Leaf,
};

/**
 * Three simple value-prop cards — icon, title, body, no CTA or dark
 * variant. Deliberately its own (simpler) card rather than reusing
 * ServiceCard, which carries an eyebrow, a "Read More" link and a featured
 * dark variant this section's design doesn't call for.
 */
export function PartnerValues() {
  return (
    <section aria-labelledby="partner-values-heading" className="bg-white py-20 sm:py-25">
      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          {partnerValueSection.eyebrow}
        </p>

        <h2
          id="partner-values-heading"
          className="font-display reveal-up mt-4 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={{ '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties}
        >
          {partnerValueSection.headline}
        </h2>

        <ul className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {partnerValues.map((value, index) => {
            const Icon = icons[value.icon];
            return (
              <li
                key={value.id}
                className="reveal-up rounded-lg border border-black/8 bg-white p-8"
                style={
                  {
                    '--rev-start': `${10 + index * 4}%`,
                    '--rev-end': `${62 + index * 4}%`,
                    '--rev-delay': `${index * 0.1}s`,
                  } as React.CSSProperties
                }
              >
                <span className="bg-brand-500 grid h-14 w-14 place-items-center rounded-lg">
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </span>

                <h3 className="font-display mt-6 text-[1.375rem] leading-tight font-bold text-black">
                  {value.title}
                </h3>

                <p className="text-sage-500 mt-3 text-[1rem] leading-[1.39] font-normal">{value.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
