import type { MetadataRoute } from 'next';

import { listNews } from '@/lib/news/store';
import { navigation, site } from '@/lib/site';
import { listStations } from '@/lib/stations/store';

// Rebuilt at most hourly. Without this the sitemap is generated once at
// deploy time and an article published from /admin afterwards never reaches
// it — Google would only learn about new news from links, not the sitemap.
export const revalidate = 3600;

const latest = (dates: string[]): Date | undefined =>
  dates.length > 0 ? new Date(dates.reduce((a, b) => (a > b ? a : b))) : undefined;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stations, articles] = await Promise.all([listStations(), listNews()]);

  // Real last-modified dates where the page's content actually comes from
  // the database; none (rather than a made-up "now") for the static pages —
  // a lastmod that changes on every crawl teaches Google to ignore it.
  const stationsUpdated = latest(stations.map((station) => station.updatedAt));
  const newsUpdated = latest(articles.map((article) => article.updatedAt));
  const homeUpdated = latest([stationsUpdated, newsUpdated].flatMap((date) => (date ? [date.toISOString()] : [])));
  const lastModifiedFor: Record<string, Date | undefined> = {
    '/': homeUpdated,
    '/stations': stationsUpdated,
    '/news': newsUpdated,
  };

  const pages: MetadataRoute.Sitemap = navigation.map((entry) => ({
    url: new URL(entry.href, site.url).toString(),
    lastModified: lastModifiedFor[entry.href],
    priority: entry.href === '/' ? 1 : entry.href === '/stations' ? 0.9 : 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: new URL(`/news/${article.slug}`, site.url).toString(),
    lastModified: new Date(article.updatedAt),
    priority: 0.6,
  }));

  return [...pages, ...articlePages];
}
