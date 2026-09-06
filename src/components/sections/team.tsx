import { TeamCarousel } from '@/components/sections/team-carousel';
import { TeamCard } from '@/components/ui/team-card';
import { team, teamSection } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Grid classes for the team row, adjusted for how many real members there
 * are — same reasoning as newsGridClass in lib/news/types.ts. The 4-across
 * desktop grid is designed for a full row (max-width 1300px, ~315px per
 * card); with fewer real people than that it should sit centred at its
 * natural card width instead of stretching across (1-2) or leaving a
 * lopsided gap (3) in an otherwise-empty row.
 *
 * `hidden sm:grid`, not a plain `grid`: below `sm` this is TeamCarousel's
 * job instead (a swipeable, one-card-at-a-time strip) — see team-carousel.tsx.
 */
function teamGridClass(count: number): string {
  if (count <= 1) return 'mx-auto hidden max-w-[19.6875rem] sm:grid sm:grid-cols-1 gap-6';
  if (count === 2) return 'mx-auto hidden max-w-[40.875rem] gap-6 sm:grid sm:grid-cols-2';
  if (count === 3) return 'mx-auto hidden max-w-[40.875rem] gap-6 sm:grid sm:grid-cols-2 lg:max-w-[62.0625rem] lg:grid-cols-3';
  return 'mx-auto hidden max-w-[40.875rem] gap-6 sm:grid sm:max-w-none sm:grid-cols-2 lg:max-w-[81.25rem] lg:grid-cols-4';
}

/**
 * Same dark fill as the other dark sections on the site (black, green-to-black
 * wash, lattice texture) — see page-hero-band.tsx / stations.tsx for the same
 * formula. The grid holds whatever is in `team` (see the note there on why
 * it's real entries only, not a placeholder-filled four).
 */
export function Team() {
  return (
    <section aria-labelledby="team-heading" className="relative isolate overflow-hidden bg-black py-20 sm:py-25">
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
          {teamSection.eyebrow}
        </p>

        <h2
          id="team-heading"
          className="font-display reveal-up mt-3 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-white"
          style={
            { '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties
          }
        >
          {teamSection.headline}
        </h2>

        <TeamCarousel team={team} />

        <ul className={cn('mt-14', teamGridClass(team.length))}>
          {team.map((member, index) => (
            <li key={member.name}>
              <TeamCard member={member} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
