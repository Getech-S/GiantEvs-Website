import Image from 'next/image';

import type { TeamMember } from '@/lib/site';

export function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <div
      className="reveal-up group relative aspect-[315/401] overflow-hidden rounded-none"
      style={
        {
          '--rev-start': `${10 + index * 4}%`,
          '--rev-end': `${62 + index * 4}%`,
          '--rev-delay': `${index * 0.1}s`,
        } as React.CSSProperties
      }
    >
      <Image
        src={member.photo.src}
        alt={member.photo.alt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 46vw, 90vw"
        className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
      />

      {/* Legibility scrim for the name/role overlay. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.85)_100%)]"
      />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[0.75rem] leading-4 font-medium tracking-[0.08em] text-white/60 uppercase">
          {member.role}
        </p>
        <p className="font-display mt-1 text-[1.125rem] leading-tight font-bold text-white">
          {member.name}
        </p>
      </div>
    </div>
  );
}
