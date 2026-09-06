'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, type MotionStyle } from 'motion/react';

import { useShouldAnimate } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** How far the element may drift toward the pointer, in pixels. */
  strength?: number;
  style?: MotionStyle;
};

/**
 * Wraps a control so it leans toward the cursor while hovered and springs
 * back when the pointer leaves. Motion values are written directly, so this
 * never triggers a React re-render on mousemove.
 */
export function Magnetic({ children, className, strength = 14, style }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const animate = useShouldAnimate();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    // Coarse pointers (touch) have no hover state to speak of.
    if (!animate || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set((offsetX / (rect.width / 2)) * strength);
    y.set((offsetY / (rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={{ x: springX, y: springY, ...style }}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.div>
  );
}
