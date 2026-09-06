'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { TeamCard } from '@/components/ui/team-card';
import type { TeamMember } from '@/lib/site';

/**
 * Mobile-only "Our People" carousel — one card at a time with the next one
 * peeking in from the right edge, swipe or tap the arrow to advance. Sits
 * alongside (not instead of) the desktop grid in team.tsx: this component is
 * `sm:hidden`, the grid is `hidden sm:grid`, so exactly one renders per
 * breakpoint and there's no client/server layout to reconcile at hydration.
 *
 * Scroll-snap does the actual sliding; the arrow is a convenience that scrolls
 * forward by one card and hides itself once there's nothing left to scroll to.
 */
export function TeamCarousel({ team }: { team: readonly TeamMember[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollNext, setCanScrollNext] = useState(team.length > 1);

  function updateCanScrollNext() {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }

  // Re-check once the track has its real width (e.g. after fonts/images
  // finish laying out) rather than trusting the initial guess above.
  useEffect(() => {
    updateCanScrollNext();
  }, [team.length]);

  function scrollToNext() {
    trackRef.current?.scrollBy({ left: trackRef.current.clientWidth * 0.86, behavior: 'smooth' });
  }

  if (team.length === 0) return null;

  return (
    <div className="relative mt-14 sm:hidden">
      <ul
        ref={trackRef}
        onScroll={updateCanScrollNext}
        className="[&::-webkit-scrollbar]:hidden -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {team.map((member, index) => (
          <li key={member.name} className="w-[82%] shrink-0 snap-center">
            <TeamCard member={member} index={index} />
          </li>
        ))}
      </ul>

      {team.length > 1 && canScrollNext ? (
        <button
          type="button"
          onClick={scrollToNext}
          aria-label="Next team member"
          className="absolute top-1/2 left-[78%] z-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] transition-opacity active:opacity-70"
        >
          <ChevronRight className="h-10 w-10" strokeWidth={2.5} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
