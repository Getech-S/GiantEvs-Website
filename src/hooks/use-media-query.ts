'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks a CSS media query from JS. Starts false on the server pass, so
 * anything gated on this must degrade gracefully when it is false.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);

    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
