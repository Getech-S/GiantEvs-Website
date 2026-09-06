import { NewsCard } from '@/components/ui/news-card';
import { newsGridClass, type NewsRecord } from '@/lib/news/types';
import { cn } from '@/lib/utils';

/**
 * "More related news" band at the bottom of an article — same light-mint
 * background as Vision & Mission (#F4F8F5), same card as the news list.
 * The caller passes in whichever other articles exist (excluding the one
 * being read); when there aren't any yet, the caller skips rendering this
 * section entirely rather than showing an empty band.
 */
export function RelatedNews({ articles }: { articles: NewsRecord[] }) {
  return (
    <section aria-labelledby="related-news-heading" className="bg-[#F4F8F5] py-20 sm:py-24">
      <div className="container-page">
        <p
          className="font-tag reveal-up text-brand-500 text-center text-[1rem] leading-4 font-bold tracking-[0.5px]"
          style={{ '--rev-start': '8%', '--rev-end': '56%' } as React.CSSProperties}
        >
          News
        </p>

        <h2
          id="related-news-heading"
          className="font-display reveal-up mt-3 text-center text-[clamp(1.75rem,3.9vw,3rem)] leading-[1.104] font-bold tracking-normal text-black"
          style={{ '--rev-start': '14%', '--rev-end': '62%', '--rev-delay': '0.12s' } as React.CSSProperties}
        >
          More related news
        </h2>

        <ul className={cn('mt-10', newsGridClass(articles.length))}>
          {articles.map((article, index) => (
            <li key={article.id} className="h-full">
              <NewsCard article={article} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
