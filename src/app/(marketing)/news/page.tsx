import type { Metadata } from 'next';

import { PageHeroBand } from '@/components/sections/page-hero-band';
import { NewsCard } from '@/components/ui/news-card';
import { listNews } from '@/lib/news/store';
import { newsGridClass } from '@/lib/news/types';

export const metadata: Metadata = { title: 'News' };

export default async function NewsPage() {
  const articles = await listNews();

  return (
    <div>
      <PageHeroBand title="News" />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          {articles.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#5A6E5A]">
              Nothing published yet — check back soon.
            </p>
          ) : (
            <ul className={newsGridClass(articles.length)}>
              {articles.map((article, index) => (
                <li key={article.id} className="h-full">
                  <NewsCard article={article} index={index} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
