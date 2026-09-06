import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';
import { clientKeyFromRequest, geocodeLimiter } from '@/lib/auth/rate-limit';
import { site } from '@/lib/site';

/**
 * Server-side proxy for Nominatim (OpenStreetMap's free geocoder), backing
 * the location search box on the admin "Add station" map — typing an address
 * and dropping the pin straight on it, instead of hunting for coordinates by
 * hand.
 *
 * Proxied rather than called straight from the browser for two reasons.
 * Nominatim's usage policy
 * (https://operations.osmfoundation.org/policies/nominatim/) requires every
 * request to identify the calling application via its User-Agent header —
 * browser `fetch()` cannot set that (it's a forbidden header), only a server
 * can. The same policy caps usage at one request/second, which the tiny
 * queue below enforces regardless of how fast an admin types.
 *
 * `src/proxy.ts` already blocks every unauthenticated `/api/admin/*` request;
 * the check here is defense in depth, the same pattern as the upload route.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const MIN_INTERVAL_MS = 1100; // a hair over Nominatim's 1 req/sec ceiling

let queue: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();
    return fn();
  });
  queue = run.catch(() => undefined);
  return run;
}

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export async function GET(request: NextRequest) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = clientKeyFromRequest(request);
  if (geocodeLimiter.isLimited(key)) {
    return NextResponse.json({ error: 'Too many searches. Wait a moment and try again.' }, { status: 429 });
  }
  geocodeLimiter.recordAttempt(key);

  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < 3) return NextResponse.json({ results: [] });

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('countrycodes', 'rw'); // Giant Evs only operates in Rwanda
  url.searchParams.set('limit', '5');

  try {
    const response = await throttled(() =>
      fetch(url, {
        headers: {
          // Required by Nominatim's usage policy — identifies the app and
          // gives them a contact address if they ever need to reach us.
          'User-Agent': `GiantEvs-AdminPanel/1.0 (${site.email})`,
          Accept: 'application/json',
        },
      }),
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 502 });
    }

    const data = (await response.json()) as NominatimResult[];
    const results = data.map((entry) => ({
      id: entry.place_id,
      label: entry.display_name,
      lat: Number(entry.lat),
      lng: Number(entry.lon),
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Could not reach the search service.' }, { status: 502 });
  }
}
