import { CalculatorPanel } from '@/components/sections/calculator-panel';
import { calculatorSection } from '@/lib/site';

/**
 * Charging cost calculator.
 *
 * Frame spec: 1440 fixed, hug 900.5px, 100px block / 60px inline padding,
 * background #F3F9F6. The header is static; the panel below it is the only
 * interactive part of the page, so it is the only client component here.
 */
export function Calculator() {
  return (
    <section
      aria-labelledby="calculator-heading"
      className="bg-[#F3F9F6] py-20 sm:py-25"
    >
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div>
            <p
              className="font-tag reveal-up text-brand-500 text-[1rem] leading-4 font-bold tracking-[0.5px]"
              style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
            >
              {calculatorSection.eyebrow}
            </p>

            <h2
              id="calculator-heading"
              className="font-display reveal-up mt-3 text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
              style={
                {
                  '--rev-start': '14%',
                  '--rev-end': '62%',
                  '--rev-delay': '0.12s',
                } as React.CSSProperties
              }
            >
              {calculatorSection.headline}
            </h2>
          </div>

          <p
            className="reveal-up text-sage-500 max-w-[33.1875rem] text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-normal lg:mt-7"
            style={
              {
                '--rev-start': '18%',
                '--rev-end': '68%',
                '--rev-delay': '0.22s',
              } as React.CSSProperties
            }
          >
            {calculatorSection.intro}
          </p>
        </div>

        {/* 48px below the header row, matching the other sections. */}
        <div className="mt-12">
          <CalculatorPanel />
        </div>
      </div>
    </section>
  );
}
