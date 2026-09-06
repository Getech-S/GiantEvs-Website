import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';
import { createStation, listStations, StationValidationError } from '@/lib/stations/store';
import type { StationInput } from '@/lib/stations/types';

/** Public: anyone can read the station list — it's what the map/search page shows. */
export async function GET() {
  const stations = await listStations();
  return NextResponse.json({ stations });
}

/**
 * Admin-only: create a station. `src/proxy.ts` already blocks this route for
 * unauthenticated requests; the check here is defense in depth, not the
 * primary gate.
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: StationInput;
  try {
    body = (await request.json()) as StationInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const station = await createStation(body);
    return NextResponse.json({ station }, { status: 201 });
  } catch (error) {
    if (error instanceof StationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
