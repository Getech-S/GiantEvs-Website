'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';

/**
 * Fast day-to-day control for the stations table: bump free bays up or down
 * by one without opening the full edit form. This is the "manage occupied vs
 * available quickly" path — a real operator updates this dozens of times a
 * day as cars plug in and leave, and shouldn't need five form fields for it.
 */
export function QuickBayAdjuster({
  id,
  freeBays,
  totalBays,
}: {
  id: string;
  freeBays: number;
  totalBays: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(freeBays);
  const [pending, setPending] = useState(false);

  async function adjust(delta: number) {
    const next = Math.min(totalBays, Math.max(0, value + delta));
    if (next === value) return;

    setValue(next); // optimistic
    setPending(true);
    const response = await fetch(`/api/stations/${id}/bays`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freeBays: next }),
    });
    setPending(false);

    if (!response.ok) {
      setValue(freeBays); // roll back on failure
      return;
    }
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => adjust(-1)}
        disabled={pending || value <= 0}
        aria-label="One fewer free bay"
        className="grid h-6 w-6 place-items-center rounded border border-black/15 text-[#5A6E5A] transition-colors hover:bg-black/5 disabled:opacity-30"
      >
        <Minus className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      </button>
      <span className="w-10 text-center tabular-nums text-[#0A0A0A]">
        {value}/{totalBays}
      </span>
      <button
        type="button"
        onClick={() => adjust(1)}
        disabled={pending || value >= totalBays}
        aria-label="One more free bay"
        className="grid h-6 w-6 place-items-center rounded border border-black/15 text-[#5A6E5A] transition-colors hover:bg-black/5 disabled:opacity-30"
      >
        <Plus className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
