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
  /**
   * Peak output of the station's fastest charger, in kW (e.g. 240), or null
   * when not set. Shown next to that charger's connector type.
   */
  powerKw: number | null;
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

/**
 * Connector label with the station's peak power attached to its fastest
 * connector only — "240 kW DC Fast" — since that's the one the peak figure
 * belongs to; slower connectors at the same site keep their plain label.
 * CHARGER_TAGS runs slowest to fastest, so the fastest is the highest index.
 */
export function connectorLabel(tag: ChargerTag, station: Pick<StationRecord, 'connectors' | 'powerKw'>): string {
  if (!station.powerKw) return tag;
  const fastest = station.connectors.reduce((a, b) => (CHARGER_TAGS.indexOf(b) > CHARGER_TAGS.indexOf(a) ? b : a));
  return tag === fastest ? `${station.powerKw} kW ${tag}` : tag;
}
