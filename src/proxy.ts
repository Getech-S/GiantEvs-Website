import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';
import { MAP_TILE_CSP_HOST } from '@/lib/map-tiles';

/**
 * Emits a per-request, nonce-based Content-Security-Policy.
 *
 * `strict-dynamic` means the nonce on Next's bootstrap script transitively
 * authorises the chunks it loads, so we never need to allowlist hostnames or
 * fall back to 'unsafe-inline' for scripts.
 *
 * Note: `style-src` keeps 'unsafe-inline' because React inlines styles for
 * streaming/suspense and Next injects a critical-CSS <style> tag. Inline styles
 * are not a script-execution vector, so this is the standard trade-off.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // Ignored by CSP3 browsers thanks to strict-dynamic; keeps CSP2 ones working.
      'https:',
      // Turbopack's dev runtime uses eval for hot module replacement.
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    // OSM's basemap tiles for the stations map (see src/lib/map-tiles.ts);
    // everything else on the site is same-origin.
    'img-src': ["'self'", 'data:', 'blob:', MAP_TILE_CSP_HOST],
    'media-src': ["'self'", 'blob:'],
    'font-src': ["'self'", 'data:'],
    // Dev needs the HMR websocket; production talks to nothing but its own origin.
    'connect-src': ["'self'", ...(isDev ? ['ws:', 'wss:'] : [])],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');

  // upgrade-insecure-requests would break http://localhost during development.
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

// --- admin auth guard --------------------------------------------------
// Defends /admin pages and the admin/mutation API routes. This is one layer;
// every protected Server Component and Route Handler re-checks the session
// itself (see getAdminUsername / the individual routes), so a request that
// slips past the proxy (e.g. Next's background prefetch, which this proxy
// intentionally skips CSP-nonce work for) still can't render or mutate data.

const PUBLIC_ADMIN_PAGE = '/admin/login';
const PUBLIC_ADMIN_API = '/api/admin/login';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function sessionUsername(request: NextRequest): Promise<string | null> {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

async function guardAdminApi(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== PUBLIC_ADMIN_API;
  // The view-tracking ping (POST /api/stations/:id/view) is the one
  // deliberately public write under /api/stations — every visitor's browser
  // calls it, not just admins. It has its own rate limit instead (see
  // src/lib/auth/rate-limit.ts's stationViewLimiter).
  const isViewTracking = pathname.startsWith('/api/stations/') && pathname.endsWith('/view');
  const isStationMutation =
    pathname.startsWith('/api/stations') && MUTATING_METHODS.has(request.method) && !isViewTracking;
  const isNewsMutation = pathname.startsWith('/api/news') && MUTATING_METHODS.has(request.method);
  if (!isAdminApi && !isStationMutation && !isNewsMutation) return null;

  const username = await sessionUsername(request);
  if (username) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function guardAdminPage(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === PUBLIC_ADMIN_PAGE) return null;

  const username = await sessionUsername(request);
  if (username) return null;

  const loginUrl = new URL(PUBLIC_ADMIN_PAGE, request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes never get a CSP (they don't return HTML) — just the auth gate.
  if (pathname.startsWith('/api/')) {
    const blocked = await guardAdminApi(request);
    return blocked ?? NextResponse.next();
  }

  const redirectToLogin = await guardAdminPage(request);
  if (redirectToLogin) return redirectToLogin;

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce, process.env.NODE_ENV !== 'production');

  // Pass the nonce forward so the server components can stamp it onto <script>.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Documents and API routes both need to reach proxy() now (API routes for
     * the admin auth gate above); only static chunks, images, video and
     * metadata files are skipped, since neither a CSP nor an auth check
     * applies to those.
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff|woff2)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
