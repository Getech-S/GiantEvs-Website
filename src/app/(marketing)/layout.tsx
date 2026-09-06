import type { Metadata, Viewport } from 'next';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { RevealObserver } from '@/components/motion/reveal-observer';
import { site } from '@/lib/site';

import { fontVariables } from '../fonts';
import '../globals.css';
// Leaflet's own stylesheet, needed by the /stations map. Imported once here
// (Next's documented pattern for third-party CSS) rather than per-component.
import 'leaflet/dist/leaflet.css';

/**
 * Root layout for the public marketing site — everything except /admin,
 * which has its own root layout (see src/app/admin/layout.tsx) with no
 * public header/footer. This is Next's documented "multiple root layouts"
 * pattern: two top-level route groups, each rendering its own <html>/<body>,
 * instead of one shared layout every route is stuck with.
 */

// Next can only stamp its per-request CSP nonce (see src/proxy.ts) onto
// <script> tags it renders at request time — a statically prerendered page's
// HTML is fixed at build time, before any nonce exists, so its scripts would
// ship with no nonce at all and get silently blocked by the CSP in
// production (no hydration, no interactivity). Forcing the whole group
// dynamic here means every marketing page — present and future — always
// gets a correctly nonced page, without relying on each page happening to
// call headers()/cookies() (which is what accidentally made "/" and
// "/stations" work) or every page author remembering this footgun.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'EV charging Rwanda',
    'electric vehicle charging Kigali',
    'Giant Evs',
    'charging stations Rwanda',
    'host a charger',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  // Never leak referrers to third parties, and don't auto-link phone numbers.
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function MarketingRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white antialiased">
        {/* Safety net for the one gap RevealObserver's JS can't cover: no JS
            at all, on a browser that also lacks native `animation-timeline:
            view()` support. Without this, reveal-* content would stay
            paused on its hidden first frame forever — see the `@supports
            not (...)` block in globals.css. Inline <style> is allowed by the
            CSP's style-src without a nonce (see proxy.ts), so this needs
            none either. */}
        <noscript>
          <style>{`.reveal-up,.reveal-line,.reveal-media,.reveal-bar,.reveal-draw,.reveal-pop{animation-play-state:running!important}`}</style>
        </noscript>

        <Header />
        <main id="main" className="pt-[var(--spacing-header)]">
          {children}
        </main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
