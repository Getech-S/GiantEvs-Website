import { Rokkitt, Urbanist } from 'next/font/google';

/**
 * Shared between both root layouts (see (marketing)/layout.tsx and
 * admin/layout.tsx — the site has two, so the admin panel never ships the
 * public header/footer; see the note in admin/layout.tsx). Defined once here
 * so both stay on the exact same fonts.
 *
 * Free stand-ins for the two licensed faces (see globals.css).
 *
 * Urbanist for Grift: same geometric-humanist construction (circular bowls,
 * open apertures, angled ascender cuts) and it sets "Stations" at 64.2px
 * against the spec's 64px, so line breaks and nav widths hold. Archivo, the
 * previous fallback, ran ~3.6% wide and read far more grotesque.
 *
 * Rokkitt for Rockwell: a slab serif drawn after it.
 *
 * Both are self-hosted by next/font, so no external requests.
 */
export const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
  weight: ['400', '500', '600', '700', '800'],
});

export const rokkitt = Rokkitt({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rokkitt',
  weight: ['400', '700'],
});

export const fontVariables = `${urbanist.variable} ${rokkitt.variable}`;
