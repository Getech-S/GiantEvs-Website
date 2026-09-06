import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { CHARGER_TAGS, type StationInput, type StationRecord } from './types';

/**
 * Server-only JSON file store for stations.
 *
 * There is no database in this project — the station list is small (a
 * handful to a few hundred sites) and a single admin edits it at a time, so a
 * JSON file guarded by an in-process write queue is simpler to run, back up,
 * and inspect than standing up a database for it. If the app ever moves to a
 * serverless/multi-instance host, this file needs a real database instead:
 * the filesystem there is either read-only or not shared across instances, so
 * writes would silently vanish or diverge. Everything above this module goes
 * through the functions below, so swapping the implementation later only
 * means rewriting this one file.
 *
 * NEVER import this module from a Client Component — it uses `node:fs` and
 * must only run on the server (Route Handlers, Server Components).
 */

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'stations.json');

export class StationValidationError extends Error {}

// --- tiny in-process write queue -------------------------------------------
// Prevents two concurrent admin requests from both reading the old array and
// clobbering each other's write (classic read-modify-write race). Only
// guards against races within this one Node process, which is what a single
// `next start` instance is.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => undefined);
  return result;
}

/** Fills in engagement fields for records written before they existed. */
function normalize(station: StationRecord): StationRecord {
  return {
    ...station,
    viewCount: Number.isInteger(station.viewCount) ? station.viewCount : 0,
    lastViewedAt: station.lastViewedAt ?? null,
  };
}

async function readAll(): Promise<StationRecord[]> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StationRecord[]).map(normalize) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeAll(stations: StationRecord[]): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  // Write to a temp file and rename over the target — rename is atomic on the
  // same filesystem, so a crash mid-write can never leave a half-written,
  // corrupt stations.json behind.
  const tmp = `${DATA_FILE}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(stations, null, 2), 'utf8');
  await rename(tmp, DATA_FILE);
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
  const stations = await readAll();
  // Newest first, so a station an admin just added is easy to find.
  return [...stations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getStation(id: string): Promise<StationRecord | undefined> {
  const stations = await readAll();
  return stations.find((station) => station.id === id);
}

export function createStation(input: StationInput): Promise<StationRecord> {
  validate(input);
  return withLock(async () => {
    const stations = await readAll();
    const now = new Date().toISOString();
    const record: StationRecord = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      lastViewedAt: null,
    };
    stations.push(record);
    await writeAll(stations);
    return record;
  });
}

export function updateStation(id: string, input: StationInput): Promise<StationRecord> {
  validate(input);
  return withLock(async () => {
    const stations = await readAll();
    const index = stations.findIndex((station) => station.id === id);
    if (index === -1) throw new StationValidationError('Station not found.');
    const updated: StationRecord = {
      ...input,
      id,
      createdAt: stations[index]!.createdAt,
      updatedAt: new Date().toISOString(),
      viewCount: stations[index]!.viewCount,
      lastViewedAt: stations[index]!.lastViewedAt,
    };
    stations[index] = updated;
    await writeAll(stations);
    return updated;
  });
}

export function deleteStation(id: string): Promise<boolean> {
  return withLock(async () => {
    const stations = await readAll();
    const next = stations.filter((station) => station.id !== id);
    if (next.length === stations.length) return false;
    await writeAll(next);
    return true;
  });
}

/**
 * Bumps a station's engagement counter. Called from the PUBLIC view-tracking
 * endpoint (no admin session), so it deliberately does none of the full
 * `validate()` work — it only ever touches `viewCount`/`lastViewedAt`.
 */
export function recordStationView(id: string): Promise<boolean> {
  return withLock(async () => {
    const stations = await readAll();
    const index = stations.findIndex((station) => station.id === id);
    if (index === -1) return false;
    stations[index] = {
      ...stations[index]!,
      viewCount: stations[index]!.viewCount + 1,
      lastViewedAt: new Date().toISOString(),
    };
    await writeAll(stations);
    return true;
  });
}

/**
 * Adjusts free-bay count directly, for the admin table's quick +/- controls —
 * a fast day-to-day path that doesn't require opening the full edit form for
 * a one-number change. Still goes through the same bounds check as the full
 * form (0 <= freeBays <= totalBays).
 */
export function setFreeBays(id: string, freeBays: number): Promise<StationRecord> {
  if (!Number.isInteger(freeBays) || freeBays < 0) {
    throw new StationValidationError('Free bays must be zero or a positive whole number.');
  }
  return withLock(async () => {
    const stations = await readAll();
    const index = stations.findIndex((station) => station.id === id);
    if (index === -1) throw new StationValidationError('Station not found.');
    if (freeBays > stations[index]!.totalBays) {
      throw new StationValidationError('Free bays cannot exceed total bays.');
    }
    const updated: StationRecord = {
      ...stations[index]!,
      freeBays,
      updatedAt: new Date().toISOString(),
    };
    stations[index] = updated;
    await writeAll(stations);
    return updated;
  });
}
