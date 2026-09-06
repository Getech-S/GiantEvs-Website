import Image from 'next/image';

import type { NewsBlock } from '@/lib/news/types';

/**
 * Renders one article's content blocks (see NewsBlock in lib/news/types.ts)
 * in the article's reading column. Each block type gets the same treatment
 * used for the same kind of text elsewhere on the site — body copy in
 * `text-sage-500`, sub-headings in the bold display face — plus the same
 * staggered scroll-reveal every other list-mapped section on the site uses,
 * so a long article reads as a sequence of arrivals rather than one static
 * block of text.
 */
export function NewsArticleBody({ blocks }: { blocks: NewsBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const revealStyle = {
          '--rev-start': `${10 + index * 4}%`,
          '--rev-end': `${58 + index * 4}%`,
          '--rev-delay': `${index * 0.08}s`,
        } as React.CSSProperties;

        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={index}
                className="reveal-up text-sage-500 text-[1rem] leading-[1.55] font-normal whitespace-pre-line"
                style={revealStyle}
              >
                {block.text}
              </p>
            );
          case 'heading':
            return (
              <h2
                key={index}
                className="reveal-up font-display pt-2 text-[1.375rem] leading-tight font-bold text-black"
                style={revealStyle}
              >
                {block.text}
              </h2>
            );
          case 'list':
            return (
              <ul
                key={index}
                className="reveal-up text-sage-500 space-y-2 text-[1rem] leading-[1.55] font-normal"
                style={revealStyle}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );
          case 'image':
            return (
              <div
                key={index}
                className="reveal-media relative aspect-[16/10] overflow-hidden rounded-lg"
                style={revealStyle}
              >
                <Image src={block.src} alt={block.alt} fill sizes="(min-width: 1024px) 640px, 92vw" className="object-cover" />
              </div>
            );
        }
      })}
    </div>
  );
}
