import type { Transition, Variants } from 'motion/react';

/**
 * Shared motion primitives, so every JS-driven animation on the site has the
 * same "expo-out" personality instead of each component inventing its own.
 *
 * Entrance animations are deliberately NOT here — those are CSS keyframes in
 * globals.css so that content still renders when JavaScript doesn't run. See
 * the Motion section of the README.
 */

/** Matches --ease-brand in globals.css. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Indicators and other small elements that should arrive without overshoot. */
export const springSnappy: Transition = { type: 'spring', stiffness: 380, damping: 32 };

/** Scroll-linked values, where a little lag reads as smoothing. */
export const springScroll: Transition = { stiffness: 180, damping: 30, restDelta: 0.001 };

/** Dropdown / popover entrance, anchored to its trigger. */
export const popover: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14, ease: 'easeIn' } },
};
