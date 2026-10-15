import L from 'leaflet';

/**
 * Map pin with an EV-charger glyph, shared by the public stations map and the
 * admin location picker. The glyph is lucide's `ev-charger` (the same icon
 * set used everywhere else on the site), drawn white on the status colour.
 *
 * The pin's tip — not its centre — sits on the coordinate, so the exact spot
 * a station is pinned to is the point of the marker.
 *
 * Client-only: imports Leaflet, which touches `window` at load.
 */

// lucide-react `ev-charger`, 24x24, stroke-based (ISC licence).
const GLYPH = [
  'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5',
  'M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16',
  'M2 21h13',
  'M3 7h11',
  'm9 11-2 3h3l-2 3',
]
  .map((d) => `<path d="${d}"/>`)
  .join('');

// Pin artwork is 36x46 units: a 15-unit-radius head centred at (18,18),
// tapering to a tip at (18,44).
const VIEW_W = 36;
const VIEW_H = 46;

export function chargerPinIcon(color: string, { selected = false } = {}): L.DivIcon {
  const width = selected ? 40 : 32;
  const height = Math.round((width * VIEW_H) / VIEW_W);
  const shadow = selected ? '0 4px 8px rgba(0,0,0,0.45)' : '0 2px 4px rgba(0,0,0,0.35)';

  return L.divIcon({
    className: '',
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 1],
    popupAnchor: [0, -height + 6],
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" width="${width}" height="${height}" style="display:block;overflow:visible;filter:drop-shadow(${shadow})">
      <path d="M18 44S3 28.5 3 18a15 15 0 0 1 30 0c0 10.5-15 26-15 26Z" fill="${color}" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <g transform="translate(9.5 9.5) scale(0.7083)" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${GLYPH}</g>
    </svg>`,
  });
}
