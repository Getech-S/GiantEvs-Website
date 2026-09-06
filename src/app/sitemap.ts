import type { MetadataRoute } from 'next';

import { listNews } from '@/lib/news/store';
import { navigation, site } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = navigation.map((entry) => ({
    url: new URL(entry.href, site.url).toString(),
    lastModified,
    changeFrequency: entry.href === '/' ? 'weekly' : 'monthly',
    priority: entry.href === '/' ? 1 : 0.7,
  }));

  const articles = await listNews();
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: new URL(`/news/${article.slug}`, site.url).toString(),
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...pages, ...articlePages];
}
