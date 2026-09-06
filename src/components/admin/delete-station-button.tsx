'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Inline confirm instead of `window.confirm()` — a native dialog can't be
 * styled, blocks the whole tab, and (as it turned out during testing) isn't
 * reliably drivable by browser automation either. This keeps the same
 * two-step "are you sure" safety without leaving the page's own DOM.
 */
export function DeleteStationButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/stations/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const data: { error?: string } = await response.json().catch(() => ({}));
      setError(data.error ?? 'Could not delete this station.');
      setLoading(false);
      setConfirming(false);
      return;
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="text-[#5A6E5A]">Delete &ldquo;{name}&rdquo;?</span>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="font-medium text-[#5A6E5A] hover:text-[#0A0A0A] disabled:opacity-60"
          >
            Cancel
          </button>
        </span>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
    >
      Delete
    </button>
  );
}
