/**
 * Canonical station record — the one shape used by the public map/list, the
 * homepage teaser cards, and the admin CRUD forms. Nothing else in the app
 * should invent its own station shape.
 */

export const CHARGER_TAGS = ['AC Standard', 'AC Fast', 'DC Fast', 'DC Ultra'] as const;
export type ChargerTag = (typeof CHARGER_TAGS)[number];

export type StationStatus = 'available' | 'occupied';

export type StationRecord = {
  id: string;
  name: string;
  address: string;
  city: string;
  /** WGS84 decimal degrees. */
  lat: number;
  lng: number;
  connectors: ChargerTag[];
  /** Bays currently free. */
  freeBays: number;
  /** Total bays at the site. */
  totalBays: number;
  createdAt: string;
  updatedAt: string;
  /**
   * Real visitor engagement — incremented once per browser session when a
   * visitor selects this station on the public map/list (see
   * POST /api/stations/[id]/view). Starts at 0 for every station; nothing in
   * this project ever seeds a fake count.
   */
  viewCount: number;
  /** ISO timestamp of the most recent view, or null if it's never been viewed. */
  lastViewedAt: string | null;
};

/**
 * Input shape for create/update — everything the store derives (id,
 * timestamps, engagement) is omitted; the admin form never sets these.
 */
export type StationInput = Omit<
  StationRecord,
  'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'lastViewedAt'
>;

/**
 * Status is derived from the live bay count rather than stored independently,
 * so a station can never show "Available" with 0 free bays or vice versa —
 * one number to edit, not two facts that can drift apart.
 */
export function stationStatus(station: Pick<StationRecord, 'freeBays'>): StationStatus {
  return station.freeBays > 0 ? 'available' : 'occupied';
}
