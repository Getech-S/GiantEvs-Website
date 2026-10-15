import type { Metadata } from 'next';

import type { NewsRecord } from '@/lib/news/types';
import { footer, seo, site } from '@/lib/site';
import { connectorLabel, type StationRecord } from '@/lib/stations/types';

/**
 * Search-engine plumbing shared by every public page: per-page <head>
 * metadata (title, description, canonical URL, share cards) and the
 * schema.org structured data Google reads to understand who Giant Evs is and
 * where its stations are.
 *
 * Every page sets its own canonical through pageMetadata(). Don't put a
 * canonical on a layout — it's inherited by every page below it, which is
 * exactly the bug this replaced: all six public pages declared the homepage
 * as their canonical, telling Google they were duplicates of it.
 */

export const shareImage = {
  url: '/og/giant-evs-remera-hd.jpg',
  width: 1200,
  height: 630,
  alt: 'Giant Evs — EV charging stations in Kigali, Rwanda',
} as const;

type PageMetadataInput = {
  /** Path of this page, e.g. '/stations' — becomes its canonical URL. */
  path: string;
  title: string;
  description: string;
  /** Use `title` exactly, without the layout's " | Giant Evs" suffix. */
  absoluteTitle?: boolean;
  /** Overrides for the share card (e.g. an article's own cover image). */
  openGraph?: Metadata['openGraph'];
};

export function pageMetadata({ path, title, description, absoluteTitle, openGraph }: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: site.locale,
      siteName: site.name,
      url: path,
      title: fullTitle,
      description,
      images: [shareImage],
      ...openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [openGraph?.images ?? shareImage].flat(),
    },
  };
}

/** Absolute URL for an image that may be stored as a site path or as a full Blob URL. */
export function absoluteUrl(src: string): string {
  return /^https?:\/\//.test(src) ? src : new URL(src, site.url).toString();
}

/** First paragraph of an article, cut at a word boundary to fit a search snippet. */
export function articleExcerpt(article: NewsRecord, max = 155): string {
  const first = article.body.find((block) => block.type === 'paragraph');
  const text = first && first.type === 'paragraph' ? first.text.replace(/\s+/g, ' ').trim() : article.title;
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(' ', max - 1))}…`;
}

// --- structured data (schema.org JSON-LD) -------------------------------

const organizationId = `${site.url}/#organization`;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: site.address.street,
  addressLocality: site.address.city,
  addressCountry: site.address.country,
} as const;

/** Who Giant Evs is — rendered once, site-wide, from the marketing layout. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: site.name,
        slogan: site.tagline,
        url: site.url,
        description: seo.home.description,
        logo: { '@type': 'ImageObject', url: `${site.url}/icons/icon-512.png`, width: 512, height: 512 },
        image: absoluteUrl(shareImage.url),
        email: site.email,
        telephone: site.phone.href.replace('tel:', ''),
        address: postalAddress,
        areaServed: { '@type': 'Country', name: site.address.countryName },
        knowsAbout: ['Electric vehicle charging', 'DC fast charging', 'EV charger installation'],
        // Ties the brand's real social profiles to this site in Google's eyes.
        sameAs: footer.socials.filter((social) => social.profile).map((social) => social.href),
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: site.phone.href.replace('tel:', ''),
            email: site.email,
            contactType: 'customer service',
            areaServed: site.address.country,
            availableLanguage: ['English', 'French', 'Kinyarwanda'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        alternateName: ['GiantEvs', 'Giant EVs'],
        inLanguage: 'en',
        publisher: { '@id': organizationId },
      },
    ],
  };
}

/** Every live station as a real, geolocated place — straight from the database, nothing invented. */
export function stationsJsonLd(stations: StationRecord[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${site.name} EV charging stations`,
    numberOfItems: stations.length,
    itemListElement: stations.map((station, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Place',
        name: `${station.name} — ${site.name} EV charging station`,
        description: `Electric vehicle charging station (${station.connectors.map((tag) => connectorLabel(tag, station)).join(', ')}) at ${station.address}, ${station.city}.`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: station.address,
          addressLocality: station.city,
          addressCountry: site.address.country,
        },
        geo: { '@type': 'GeoCoordinates', latitude: station.lat, longitude: station.lng },
        amenityFeature: station.connectors.map((connector) => ({
          '@type': 'LocationFeatureSpecification',
          name: `${connectorLabel(connector, station)} charger`,
          value: true,
        })),
      },
    })),
  };
}

export function articleJsonLd(article: NewsRecord) {
  const url = `${site.url}/news/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title.slice(0, 110),
    description: articleExcerpt(article),
    image: [absoluteUrl(article.coverImage.src)],
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    articleSection: article.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: { '@id': organizationId },
  };
}
