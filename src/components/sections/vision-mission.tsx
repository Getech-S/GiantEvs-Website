import { visionMission } from '@/lib/site';

/**
 * Two-card section — same light background as "How To Charge"
 * (#F4F8F5), white cards, centred headline.
 */
export function VisionMission() {
  return (
    <section aria-labelledby="vision-mission-heading" className="bg-[#F4F8F5] py-20 sm:py-24">
      <div className="container-page">
        <h2
          id="vision-mission-heading"
          className="font-display reveal-up text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={{ '--rev-start': '10%', '--rev-end': '58%' } as React.CSSProperties}
        >
          {visionMission.headline}
        </h2>

        <div className="mx-auto mt-10 grid max-w-[52.5rem] grid-cols-1 gap-6 sm:grid-cols-2">
          {visionMission.cards.map((card, index) => (
            <div
              key={card.title}
              className="reveal-up rounded-lg bg-white p-8"
              style={
                {
                  '--rev-start': `${18 + index * 6}%`,
                  '--rev-end': `${66 + index * 6}%`,
                  '--rev-delay': `${0.15 + index * 0.1}s`,
                } as React.CSSProperties
              }
            >
              <h3 className="font-display text-[1.375rem] leading-tight font-bold text-black">
                {card.title}
              </h3>
              <p className="text-sage-500 mt-3 text-[1rem] leading-[1.39] font-normal">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
