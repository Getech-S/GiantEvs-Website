/**
 * Shared basemap config for every Leaflet map in the app (the public stations
 * map and the admin coordinate picker), so both always point at the same
 * tile source.
 *
 * Uses OpenStreetMap's own tile server — real, live, zoomable cartography,
 * no API key or account required.
 *
 * This briefly pointed at CARTO's "Voyager" style instead, for a cleaner,
 * more Google-Maps-like look — but CARTO's anonymous free tier turns out to
 * already require an API key: every tile came back stamped "API KEY
 * REQUIRED" over the real map underneath (confirmed by fetching a tile
 * directly, not just visually). Reverted rather than sign up for a key on
 * the user's behalf.
 *
 * OSM's own usage policy (https://operations.osmfoundation.org/policies/tiles/)
 * is meant for light/moderate traffic, not a high-volume production site. If
 * this site gets real traffic, move to a proper paid tile provider —
 * MapTiler, Mapbox, Stadia Maps, Google Maps Platform, etc. (or CARTO, with
 * a real key this time) — which is a one-line change here (swap the URL +
 * attribution, and the API key domain in src/proxy.ts's CSP `img-src`),
 * since every map component imports this file rather than hard-coding a
 * tile URL of its own.
 */
export const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_TILE_SUBDOMAINS = 'abc';
export const MAP_TILE_MAX_ZOOM = 19;
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Host allowlisted in src/proxy.ts's CSP img-src — keep this in sync with the URL above. */
export const MAP_TILE_CSP_HOST = 'https://*.tile.openstreetmap.org';
