import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { NewsRecord } from '@/lib/news/types';

type NewsCardProps = {
  article: NewsRecord;
  /** Position in the grid, used to stagger the reveal. */
  index?: number;
};

/**
 * News card — same card shell as StoryCard (components/ui/story-card.tsx)
 * but its own exact type spec (tag, title and button colours/sizes all
 * differ slightly from Stories'), per the Figma inspector for this page.
 *
 * The whole card is one click target ("stretched link" pattern): a single
 * `<Link>` sits absolutely positioned over the entire card, so the image and
 * title are just as clickable as "Read More" — not just the button text.
 * "Read More" itself is a plain span, not a nested `<a>` (two nested links
 * would be invalid HTML and confuse screen readers about which one to use).
 */
export function NewsCard({ article, index = 0 }: NewsCardProps) {
  return (
    <article
      className="reveal-up group relative flex h-full flex-col rounded-lg border border-black/8 bg-white p-4 pb-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-brand)] hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(0,0,0,0.45)]"
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
          src={article.coverImage.src}
          alt={article.coverImage.alt}
          fill
          sizes="(min-width: 1024px) 397px, (min-width: 768px) 45vw, 92vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
        />
      </div>

      <p className="mt-4 text-[0.875rem] leading-4 font-medium tracking-normal text-[#00A550]">
        {article.category}
      </p>

      <h3 className="mt-3 text-[1.1875rem] leading-6 font-bold tracking-normal text-[#0B3D2E]">
        {article.title}
      </h3>

      <span className="mt-5 inline-flex items-center gap-2 self-start text-[0.875rem] leading-4 font-bold tracking-normal text-[#1D9A3E]">
        Read More
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-brand)] group-hover:translate-x-1"
          strokeWidth={2.4}
          aria-hidden
        />
      </span>

      <Link href={`/news/${article.slug}`} className="absolute inset-0 rounded-lg">
        <span className="sr-only">Read more: {article.title}</span>
      </Link>
    </article>
  );
}
