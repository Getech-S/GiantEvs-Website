import { randomUUID } from 'node:crypto';

import { sql } from '@/lib/db';

import { CHARGER_TAGS, type ChargerTag, type StationInput, type StationRecord } from './types';

/**
 * Postgres-backed store for stations — see scripts/db/schema.sql for the
 * table. This used to be a JSON file (see git history); that stopped
 * working once the app moved to Vercel, whose serverless functions have no
 * persistent, shared disk to write to. Everything above this module still
 * goes through the functions below, so nothing else had to change.
 *
 * NEVER import this module from a Client Component — it talks to the
 * database and must only run on the server (Route Handlers, Server
 * Components).
 */

export class StationValidationError extends Error {}

type StationRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  connectors: string[];
  free_bays: number;
  total_bays: number;
  view_count: number;
  last_viewed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

/** The driver returns TIMESTAMPTZ columns as Date objects; the rest of the app works with ISO strings. */
function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function rowToStation(row: StationRow): StationRecord {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    lat: Number(row.lat),
    lng: Number(row.lng),
    connectors: row.connectors as ChargerTag[],
    freeBays: row.free_bays,
    totalBays: row.total_bays,
    viewCount: row.view_count,
    lastViewedAt: row.last_viewed_at ? toIso(row.last_viewed_at) : null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function validate(input: StationInput): void {
  const problems: string[] = [];

  if (!input.name.trim()) problems.push('Name is required.');
  if (!input.address.trim()) problems.push('Address is required.');
  if (!input.city.trim()) problems.push('City is required.');
  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    problems.push('Latitude must be between -90 and 90.');
  }
  if (!Number.isFinite(input.lng) || input.lng < -180 || input.lng > 180) {
    problems.push('Longitude must be between -180 and 180.');
  }
  if (!Number.isInteger(input.totalBays) || input.totalBays < 1) {
    problems.push('Total bays must be a whole number of at least 1.');
  }
  if (!Number.isInteger(input.freeBays) || input.freeBays < 0) {
    problems.push('Free bays must be zero or a positive whole number.');
  }
  if (Number.isInteger(input.totalBays) && input.freeBays > input.totalBays) {
    problems.push('Free bays cannot exceed total bays.');
  }
  if (input.connectors.length === 0) {
    problems.push('Select at least one connector type.');
  }
  if (input.connectors.some((tag) => !CHARGER_TAGS.includes(tag))) {
    problems.push('Unrecognised connector type.');
  }

  if (problems.length > 0) throw new StationValidationError(problems.join(' '));
}

export async function listStations(): Promise<StationRecord[]> {
  // Newest first, so a station an admin just added is easy to find.
  const rows = await sql`SELECT * FROM stations ORDER BY created_at DESC`;
  return (rows as StationRow[]).map(rowToStation);
}

export async function getStation(id: string): Promise<StationRecord | undefined> {
  const rows = await sql`SELECT * FROM stations WHERE id = ${id}`;
  return rows.length > 0 ? rowToStation(rows[0] as StationRow) : undefined;
}

export async function createStation(input: StationInput): Promise<StationRecord> {
  validate(input);
  const id = randomUUID();
  const rows = await sql`
    INSERT INTO stations (id, name, address, city, lat, lng, connectors, free_bays, total_bays)
    VALUES (${id}, ${input.name}, ${input.address}, ${input.city}, ${input.lat}, ${input.lng},
            ${input.connectors}, ${input.freeBays}, ${input.totalBays})
    RETURNING *
  `;
  return rowToStation(rows[0] as StationRow);
}

export async function updateStation(id: string, input: StationInput): Promise<StationRecord> {
  validate(input);
  const rows = await sql`
    UPDATE stations
    SET name = ${input.name}, address = ${input.address}, city = ${input.city},
        lat = ${input.lat}, lng = ${input.lng}, connectors = ${input.connectors},
        free_bays = ${input.freeBays}, total_bays = ${input.totalBays}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) throw new StationValidationError('Station not found.');
  return rowToStation(rows[0] as StationRow);
}

export async function deleteStation(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM stations WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

/**
 * Bumps a station's engagement counter. Called from the PUBLIC view-tracking
 * endpoint (no admin session), so it deliberately does none of the full
 * `validate()` work — it only ever touches view_count/last_viewed_at, and
 * does it as a single atomic UPDATE rather than a read-then-write, so there
 * is no race with a concurrent view of the same station.
 */
export async function recordStationView(id: string): Promise<boolean> {
  const rows = await sql`
    UPDATE stations SET view_count = view_count + 1, last_viewed_at = now()
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}

/**
 * Adjusts free-bay count directly, for the admin table's quick +/- controls —
 * a fast day-to-day path that doesn't require opening the full edit form for
 * a one-number change. Still enforces the same bounds check as the full form
 * (0 <= freeBays <= totalBays).
 */
export async function setFreeBays(id: string, freeBays: number): Promise<StationRecord> {
  if (!Number.isInteger(freeBays) || freeBays < 0) {
    throw new StationValidationError('Free bays must be zero or a positive whole number.');
  }

  const existing = await sql`SELECT total_bays FROM stations WHERE id = ${id}`;
  if (existing.length === 0) throw new StationValidationError('Station not found.');
  if (freeBays > (existing[0] as { total_bays: number }).total_bays) {
    throw new StationValidationError('Free bays cannot exceed total bays.');
  }

  const rows = await sql`
    UPDATE stations SET free_bays = ${freeBays}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rowToStation(rows[0] as StationRow);
}
