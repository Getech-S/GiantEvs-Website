'use client';

/**
 * Fires a real engagement ping the first time a visitor selects a given
 * station in this browser tab session — clicking it in the list, or clicking
 * its marker on the map. Deliberately not on hover or on merely appearing in
 * a filtered list: that would count "was one of fifty results" rather than
 * "someone showed interest in this specific station."
 *
 * De-duplicated via sessionStorage so re-clicking the same station in one
 * visit doesn't inflate its count, while a genuinely new visit later does.
 * Fire-and-forget: a dropped ping should never block or error out the UI.
 */
export function trackStationView(id: string): void {
  const key = `giantevs:viewed:${id}`;

  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // Private-browsing contexts can throw on storage access — fall through
    // and send the ping anyway rather than lose it entirely.
  }

  fetch(`/api/stations/${id}/view`, { method: 'POST', keepalive: true }).catch(() => {
    // Best-effort analytics; a failed ping is not worth surfacing.
  });
}
