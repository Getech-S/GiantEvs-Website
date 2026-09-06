import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { Story } from '@/lib/site';

type StoryCardProps = {
  story: Story;
  /** Position in the row, used to stagger the reveal. */
  index: number;
};

export function StoryCard({ story, index }: StoryCardProps) {
  return (
    <article
      className="reveal-up group flex h-full flex-col rounded-lg border border-black/8 bg-white p-4 pb-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-brand)] hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(0,0,0,0.45)]"
      style={
        {
          '--rev-start': `${10 + index * 4}%`,
          '--rev-end': `${62 + index * 4}%`,
          '--rev-delay': `${index * 0.1}s`,
        } as React.CSSProperties
      }
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-md">
        <Image
          src={story.image.src}
          alt={story.image.alt}
          fill
          sizes="(min-width: 1024px) 397px, (min-width: 768px) 45vw, 92vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
        />
      </div>

      <p className="mt-6 text-[0.875rem] leading-4 font-medium tracking-normal text-[#1D9A3E]">
        {story.category}
      </p>

      <hr className="mt-2.5 border-black/10" />

      <h3 className="font-display mt-7 text-[1.125rem] leading-[22.5px] font-bold tracking-normal text-[#0A0A0A]">
        {story.title}
      </h3>

      <Link
        href={story.href}
        className="mt-6 inline-flex items-center gap-2 self-start text-[0.875rem] leading-4 font-bold tracking-normal text-[#1D9A3E]"
      >
        Read More
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-brand)] group-hover:translate-x-1"
          strokeWidth={2.4}
          aria-hidden
        />
        <span className="sr-only">: {story.title}</span>
      </Link>
    </article>
  );
}
