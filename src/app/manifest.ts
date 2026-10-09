import type { MetadataRoute } from 'next';

import { seo, site } from '@/lib/site';

/** Home-screen name and icons on phones, and a fallback site icon source for search engines. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — EV Charging in Rwanda`,
    short_name: site.name,
    description: seo.home.description,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#00A652',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
