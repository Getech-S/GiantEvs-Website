import type { Metadata, Viewport } from 'next';

import { site } from '@/lib/site';

import { fontVariables } from '../fonts';
import '../globals.css';
// The coordinate-picker map on the station form uses Leaflet too.
import 'leaflet/dist/leaflet.css';

/**
 * Root layout for the whole /admin subtree (both /admin/login and the
 * authenticated pages under admin/(protected)) — deliberately separate from
 * (marketing)/layout.tsx so the admin panel never renders the public site's
 * header/footer. Mixing the two isn't just visual clutter: it put customer-
 * facing nav on top of an internal tool and made it easy to wander off it by
 * accident while managing station data.
 *
 * This is Next's documented "multiple root layouts" pattern — each top-level
 * route group defines its own <html>/<body> instead of sharing one.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Admin', template: `%s | ${site.name} Admin` },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white antialiased">{children}</body>
    </html>
  );
}
