'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { CHARGER_TAGS, type ChargerTag, type StationInput, type StationRecord } from '@/lib/stations/types';
import { cn } from '@/lib/utils';

const CoordinatePickerMap = dynamic(
  () => import('@/components/admin/coordinate-picker-map').then((mod) => mod.CoordinatePickerMap),
  { ssr: false, loading: () => <div className="grid h-full place-items-center text-sm text-[#5A6E5A]">Loading map…</div> },
);

// Real Kigali city-centre coordinates — a sane starting pin for a new station,
// not a placeholder for a fabricated location. The admin drags/clicks it to
// the real address before saving.
const KIGALI_DEFAULT = { lat: -1.9441, lng: 30.0619 };

const inputClass =
  'focus:border-brand-500 w-full rounded-md border border-black/15 px-3 py-2.5 text-sm outline-none';
const labelClass = 'mb-1.5 block text-sm font-medium text-[#0A0A0A]';

type StationFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; station: StationRecord };

export function StationForm(props: StationFormProps) {
  const router = useRouter();
  const initial = props.mode === 'edit' ? props.station : null;

  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [lat, setLat] = useState(initial?.lat ?? KIGALI_DEFAULT.lat);
  const [lng, setLng] = useState(initial?.lng ?? KIGALI_DEFAULT.lng);
  const [connectors, setConnectors] = useState<ChargerTag[]>(initial?.connectors ?? []);
  const [totalBays, setTotalBays] = useState(initial?.totalBays ?? 4);
  const [freeBays, setFreeBays] = useState(initial?.freeBays ?? 4);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleConnector(tag: ChargerTag) {
    setConnectors((current) =>
      current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag],
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: StationInput = { name, address, city, lat, lng, connectors, totalBays, freeBays };
    const url = props.mode === 'edit' ? `/api/stations/${props.station.id}` : '/api/stations';
    const method = props.mode === 'edit' ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: { error?: string } = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      router.push('/admin/stations');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Station name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>
            Address
          </label>
          <input
            id="address"
            required
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="KG 7 Ave, Gishushu"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            required
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Kigali"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className={labelClass}>
              Latitude
            </label>
            <input
              id="lat"
              type="number"
              step="any"
              required
              value={lat}
              onChange={(event) => setLat(Number(event.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lng" className={labelClass}>
              Longitude
            </label>
            <input
              id="lng"
              type="number"
              step="any"
              required
              value={lng}
              onChange={(event) => setLng(Number(event.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-[#5A6E5A]">
          Click or drag the pin on the map to set the exact location.
        </p>

        <fieldset>
          <legend className={labelClass}>Connectors</legend>
          <div className="flex flex-wrap gap-2">
            {CHARGER_TAGS.map((tag) => {
              const active = connectors.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleConnector(tag)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand-500 bg-brand-500/8 text-brand-500'
                      : 'border-black/15 text-[#5A6E5A]',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalBays" className={labelClass}>
              Total bays
            </label>
            <input
              id="totalBays"
              type="number"
              min={1}
              step={1}
              required
              value={totalBays}
              onChange={(event) => setTotalBays(Number(event.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="freeBays" className={labelClass}>
              Free bays
            </label>
            <input
              id="freeBays"
              type="number"
              min={0}
              step={1}
              required
              value={freeBays}
              onChange={(event) => setFreeBays(Number(event.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-500 hover:bg-brand-400 flex h-11 items-center rounded-md px-5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {submitting ? 'Saving…' : props.mode === 'edit' ? 'Save changes' : 'Add station'}
          </button>
        </div>
      </div>

      <div className="h-[24rem] overflow-hidden rounded-lg border border-black/10 lg:h-full lg:min-h-[28rem]">
        <CoordinatePickerMap lat={lat} lng={lng} onChange={(nextLat, nextLng) => { setLat(nextLat); setLng(nextLng); }} />
      </div>
    </form>
  );
}
