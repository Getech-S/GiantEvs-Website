'use client';

import { useEffect } from 'react';

/**
 * JS fallback for the CSS `animation-timeline: view()` scroll reveals (see
 * the reveal-* utilities and the matching `@supports not (...)` block in
 * globals.css). Chromium has native support; Safari and older Firefox
 * don't, and without this, every reveal-* element on those browsers just
 * plays its entrance animation once at page load instead of on scroll into
 * view — invisible, since anything below the fold hasn't been scrolled to
 * yet. That reads as "nothing animates except the hero," because the hero's
 * own animations never depended on scroll-timeline to begin with.
 *
 * This renders nothing — it just watches every reveal-* element and adds
 * `.is-in-view` once each scrolls close to where its `--rev-start` would
 * have fired natively. Where the browser already supports view-timeline,
 * this is a deliberate no-op (checked once, up front) so the two mechanisms
 * never fight over the same element.
 */
export function RevealObserver() {
  useEffect(() => {
    const nativelySupported =
      typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline: view()');
    if (nativelySupported) return;

    const elements = document.querySelectorAll('[class*="reveal-"]');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      },
      // Fires a little before the element is fully on screen, roughly
      // matching where the native `entry 10%` range start would have.
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
