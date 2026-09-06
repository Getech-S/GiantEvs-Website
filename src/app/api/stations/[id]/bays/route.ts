import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';
import { setFreeBays, StationValidationError } from '@/lib/stations/store';

/**
 * Admin-only fast path for the table's +/- controls — adjusts just
 * `freeBays` without resending the whole station record. Gated the same way
 * as every other mutating /api/stations* route (see src/proxy.ts), checked
 * again here as defense in depth.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: { freeBays?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.freeBays !== 'number') {
    return NextResponse.json({ error: 'freeBays must be a number.' }, { status: 400 });
  }

  try {
    const station = await setFreeBays(id, body.freeBays);
    return NextResponse.json({ station });
  } catch (error) {
    if (error instanceof StationValidationError) {
      const status = error.message === 'Station not found.' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }
}
