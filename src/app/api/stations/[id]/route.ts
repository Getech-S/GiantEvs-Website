import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';
import { deleteStation, getStation, StationValidationError, updateStation } from '@/lib/stations/store';
import type { StationInput } from '@/lib/stations/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const station = await getStation(id);
  if (!station) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ station });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: StationInput;
  try {
    body = (await request.json()) as StationInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const station = await updateStation(id, body);
    return NextResponse.json({ station });
  } catch (error) {
    if (error instanceof StationValidationError) {
      const status = error.message === 'Station not found.' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteStation(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
