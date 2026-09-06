import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AnimatedHeadline } from '@/components/sections/animated-headline';
import { NewsArticleBody } from '@/components/sections/news-article-body';
import { RelatedNews } from '@/components/sections/related-news';
import { getNewsBySlug, listNews } from '@/lib/news/store';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return { title: article.title };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const others = (await listNews()).filter((entry) => entry.id !== article.id).slice(0, 3);

  return (
    <div>
      <article className="bg-white py-14 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-[40rem]">
            {/* Above the fold on this page too, so a load-triggered fade
                rather than a scroll-linked reveal — same reasoning as the
                homepage hero and PageHeroBand. */}
            <p className="animate-rise-in text-[0.875rem] leading-4 font-medium tracking-normal text-[#00A550]">
              {article.category}
            </p>
            <AnimatedHeadline
              reveal="load"
              delay={0.15}
              lines={[article.title]}
              className="font-display mt-3 text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.2] font-bold tracking-normal text-black"
            />
            <div className="mt-8">
              <NewsArticleBody blocks={article.body} />
            </div>
          </div>
        </div>
      </article>

      {/* Only ever real other articles — never the current one repeated,
          never a fabricated row when nothing else has been published yet. */}
      {others.length > 0 ? <RelatedNews articles={others} /> : null}
    </div>
  );
}
