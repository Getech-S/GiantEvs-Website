'use client';

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet';

import { MAP_TILE_ATTRIBUTION, MAP_TILE_MAX_ZOOM, MAP_TILE_SUBDOMAINS, MAP_TILE_URL } from '@/lib/map-tiles';
import { stationStatus, type StationRecord } from '@/lib/stations/types';

/** Real Kigali city-centre coordinates — used only as the default view when
 *  there are no stations yet (or none match the current filter/search). */
const KIGALI_CENTER: [number, number] = [-1.9441, 30.0619];
const DEFAULT_ZOOM = 12;

const STATUS_COLOR: Record<'available' | 'occupied', string> = {
  available: '#00A550',
  occupied: '#B45309',
};

function markerIcon(status: 'available' | 'occupied', selected: boolean): L.DivIcon {
  const color = STATUS_COLOR[status];
  const size = selected ? 22 : 16;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:999px;
      background:${color};border:2px solid #ffffff;
      box-shadow:0 1px 4px rgba(0,0,0,0.35)${selected ? ',0 0 0 4px ' + color + '33' : ''};
    "></span>`,
  });
}

/** Recentres the map when the selected station (or the visible set) changes. */
function MapController({ stations, selectedId }: { stations: StationRecord[]; selectedId: string | null }) {
  const map = useMap();
  const hasFitOnce = useRef(false);

  useEffect(() => {
    const selected = stations.find((station) => station.id === selectedId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
      return;
    }

    if (stations.length === 0) {
      map.flyTo(KIGALI_CENTER, DEFAULT_ZOOM, { duration: 0.4 });
      hasFitOnce.current = false;
      return;
    }

    // Fit all visible stations once per filter/search change, not on every
    // render, so the user's own zoom/pan isn't fought while they explore.
    const bounds = L.latLngBounds(stations.map((station) => [station.lat, station.lng]));
    map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 15, duration: 0.5 });
    hasFitOnce.current = true;
  }, [map, stations, selectedId]);

  return null;
}

type StationsMapProps = {
  stations: StationRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function StationsMap({ stations, selectedId, onSelect }: StationsMapProps) {
  const markers = useMemo(
    () => stations.map((station) => ({ station, status: stationStatus(station) })),
    [stations],
  );

  return (
    <MapContainer
      center={KIGALI_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      // Real, publicly-licensed cartography — no API key, no placeholder tiles.
      attributionControl
    >
      <TileLayer
        url={MAP_TILE_URL}
        subdomains={MAP_TILE_SUBDOMAINS}
        maxZoom={MAP_TILE_MAX_ZOOM}
        attribution={MAP_TILE_ATTRIBUTION}
      />
      <ZoomControl position="topright" />
      <MapController stations={stations} selectedId={selectedId} />

      {markers.map(({ station, status }) => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={markerIcon(status, station.id === selectedId)}
          eventHandlers={{ click: () => onSelect(station.id) }}
        >
          <Popup>
            <p className="font-semibold text-[#0A0A0A]">{station.name}</p>
            <p className="text-[#5A6E5A]">{station.address}</p>
            <p className={status === 'available' ? 'text-[#00A550]' : 'text-[#B45309]'}>
              {status === 'available' ? `${station.freeBays}/${station.totalBays} available` : 'Occupied'}
            </p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
