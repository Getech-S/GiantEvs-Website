'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { Loader2, MapPin, Search } from 'lucide-react';

import { MAP_TILE_ATTRIBUTION, MAP_TILE_MAX_ZOOM, MAP_TILE_SUBDOMAINS, MAP_TILE_URL } from '@/lib/map-tiles';

const markerIcon = L.divIcon({
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `<span style="display:block;width:22px;height:22px;border-radius:999px;background:#00A550;border:3px solid #ffffff;box-shadow:0 1px 6px rgba(0,0,0,0.45)"></span>`,
});

function ClickToPlace({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/** Keeps the map centred on the marker when lat/lng change from outside (the
 *  admin typing coordinates directly, or picking a location search result),
 *  without fighting the user's own pan. */
function ExternalRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return null;
}

type GeocodeResult = { id: number; label: string; lat: number; lng: number };

/**
 * "Search for an address" box floating over the map, Google-Maps-style —
 * proxies to Nominatim through our own /api/admin/geocode (see that route
 * for why it isn't called straight from the browser) so an admin can drop
 * the pin on a real address in a couple of keystrokes instead of hunting for
 * coordinates by hand.
 *
 * Deliberately a plain sibling of <MapContainer>, not a child of it — it only
 * needs to call `onChange`, which already flows back into this component's
 * own `lat`/`lng` props and triggers ExternalRecenter above, so there's no
 * need to reach for the Leaflet map instance directly here.
 */
function LocationSearch({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();

    // Every state update below happens inside this timeout callback rather
    // than directly in the effect body (see react-hooks/set-state-in-effect)
    // — which is exactly the shape a debounce wants anyway: nothing, not
    // even "start loading", should happen until the pause in typing is over.
    const timer = setTimeout(() => {
      if (trimmed.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      fetch(`/api/admin/geocode?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data: { results?: GeocodeResult[] }) => setResults(data.results ?? []))
        .catch((error) => {
          if (!(error instanceof DOMException && error.name === 'AbortError')) setResults([]);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className="absolute top-3 left-3 z-[1000] w-[min(22rem,calc(100%-1.5rem))]"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A6E5A]/60"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for an address or place…"
          aria-label="Search for a location"
          className="focus:border-brand-500 w-full rounded-md border border-black/15 bg-white py-2.5 pr-9 pl-9 text-sm text-[#0A0A0A] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] outline-none placeholder:text-[#5A6E5A]/50"
        />
        {loading ? (
          <Loader2
            className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-[#5A6E5A]/60"
            aria-hidden
          />
        ) : null}
      </div>

      {open && results.length > 0 ? (
        <ul className="mt-1.5 max-h-64 overflow-y-auto rounded-md border border-black/10 bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result.lat, result.lng);
                  setQuery(result.label);
                  setResults([]);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm text-[#0A0A0A] hover:bg-black/5"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6E5A]/60" strokeWidth={2} aria-hidden />
                <span className="line-clamp-2">{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type CoordinatePickerMapProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export function CoordinatePickerMap({ lat, lng, onChange }: CoordinatePickerMapProps) {
  return (
    <div className="relative h-full w-full">
      <MapContainer center={[lat, lng]} zoom={14} zoomControl={false} className="h-full w-full">
        <TileLayer
          url={MAP_TILE_URL}
          subdomains={MAP_TILE_SUBDOMAINS}
          maxZoom={MAP_TILE_MAX_ZOOM}
          attribution={MAP_TILE_ATTRIBUTION}
        />
        <ZoomControl position="topright" />
        <ClickToPlace onChange={onChange} />
        <ExternalRecenter lat={lat} lng={lng} />
        <Marker
          position={[lat, lng]}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const position = marker.getLatLng();
              onChange(position.lat, position.lng);
            },
          }}
        />
      </MapContainer>

      <LocationSearch onSelect={onChange} />
    </div>
  );
}
