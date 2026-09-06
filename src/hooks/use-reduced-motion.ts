'use client';

import { useReducedMotion } from 'motion/react';

/**
 * Thin wrapper so components can express intent ("should I animate?")
 * and never have to remember that `useReducedMotion` returns `null`
 * on the server pass.
 */
export function useShouldAnimate(): boolean {
  return !useReducedMotion();
}
