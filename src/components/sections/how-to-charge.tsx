import { howToCharge } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Three-step explainer. Server component — every animation here is CSS, so it
 * paints with the document and needs no hydration.
 */
export function HowToCharge() {
  const lastIndex = howToCharge.steps.length - 1;

  return (
    <section
      aria-labelledby="how-to-charge-heading"
      className="bg-[#F4F8F5] py-20 sm:py-25"
    >
      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          {howToCharge.eyebrow}
        </p>

        <h2
          id="how-to-charge-heading"
          className="font-display reveal-up mt-3 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={
            { '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties
          }
        >
          {howToCharge.headline}
        </h2>

        <div className="relative mt-14 lg:mt-16">
          {/*
            Connector, sitting behind the markers and aligned to their centre
            (34px = half the 68px marker). Fades out at both ends, per the spec's
            0% -> 16% -> 0% gradient.
          */}
          <div
            aria-hidden
            className="reveal-draw absolute top-[34px] left-1/2 hidden h-px w-full max-w-[1003px] -translate-x-1/2 origin-center bg-[linear-gradient(90deg,rgba(0,165,80,0)_0%,rgba(0,165,80,0.16)_50%,rgba(0,165,80,0)_100%)] md:block"
            style={{ '--rev-start': '12%', '--rev-end': '64%' } as React.CSSProperties}
          />

          {/* Straight from one column to three: a two-column stage would orphan
              step 3 on a row of its own. */}
          <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6 lg:gap-0">
            {howToCharge.steps.map((step, index) => {
              const isLast = index === lastIndex;
              return (
                <li key={step.title} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      'reveal-pop grid h-17 w-17 shrink-0 place-items-center rounded-full',
                      'font-display text-[1.25rem] leading-none font-bold',
                      isLast
                        ? 'bg-[linear-gradient(135deg,#006330_0%,#00A550_50%,#24C974_100%)] text-white'
                        : 'text-brand-500 bg-[#F4F8F5] ring-1 ring-black/10',
                    )}
                    style={{ '--rev-delay': `${0.18 + index * 0.12}s` } as React.CSSProperties}
                  >
                    <span className="sr-only">Step </span>
                    {index + 1}
                  </span>

                  <h3
                    className="font-display reveal-up mt-7 text-[1.5rem] leading-[1.1] font-bold tracking-normal text-black"
                    style={
                      {
                        '--rev-start': `${20 + index * 4}%`,
                        '--rev-end': `${72 + index * 4}%`,
                        '--rev-delay': `${0.3 + index * 0.12}s`,
                      } as React.CSSProperties
                    }
                  >
                    {step.title}
                  </h3>

                  <p
                    className="reveal-up text-sage-500 mt-4 max-w-[22.5625rem] text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-normal"
                    style={
                      {
                        '--rev-start': `${24 + index * 4}%`,
                        '--rev-end': `${76 + index * 4}%`,
                        '--rev-delay': `${0.4 + index * 0.12}s`,
                      } as React.CSSProperties
                    }
                  >
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
