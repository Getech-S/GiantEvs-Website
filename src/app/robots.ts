import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin pages already carry noindex; disallowing them (and the JSON API)
    // here also stops crawlers spending their visits on pages that can never
    // rank, instead of the public ones that should.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
