import { NextResponse, type NextRequest } from 'next/server';

import { clientKeyFromRequest, stationViewLimiter } from '@/lib/auth/rate-limit';
import { recordStationView } from '@/lib/stations/store';

/**
 * Deliberately public — no admin session required. Any visitor's browser
 * calls this once when they select a station on the public map/list, which
 * is what powers the "engagement" numbers in the admin dashboard. Real counts
 * only: nothing in this project seeds a station with a fake view count.
 *
 * `src/proxy.ts` carves this one path out of the otherwise-admin-only
 * `/api/stations*` mutation gate — see the `isViewTracking` check there.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = clientKeyFromRequest(request);
  if (stationViewLimiter.isLimited(key)) {
    // Fail quiet: this is a best-effort analytics ping, not something a
    // visitor should ever see an error for.
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  stationViewLimiter.recordAttempt(key);

  const { id } = await params;
  const recorded = await recordStationView(id);
  return NextResponse.json({ ok: recorded }, { status: recorded ? 200 : 404 });
}
