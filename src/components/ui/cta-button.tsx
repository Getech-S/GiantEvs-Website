'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

import { Magnetic } from '@/components/ui/magnetic';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'outline-brand';

const variantStyles: Record<Variant, string> = {
  // Flat brand green, no glow or tint — the spec shows a solid fill only.
  primary: 'bg-brand-500 text-white hover:bg-brand-400',
  // Fully transparent with a white hairline; the video reads straight through.
  outline: 'bg-transparent text-white ring-1 ring-inset ring-white hover:bg-white/12',
  // Green hairline and green label, for use on light sections.
  'outline-brand':
    'bg-transparent text-brand-500 ring-1 ring-inset ring-brand-500 hover:bg-brand-500 hover:text-white',
};

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /**
   * Stretch to the container width below `sm`. Use it where buttons stack
   * (the hero's pair); a lone button reads better at its natural width.
   */
  block?: boolean;
};

/**
 * The hero call-to-action: magnetic on hover, with a light sheen sweeping
 * across the surface and the arrow handing off to a second arrow so the
 * icon appears to travel out of and back into the button.
 */
export function CtaButton({
  href,
  children,
  variant = 'primary',
  className,
  block = false,
}: CtaButtonProps) {
  return (
    <Magnetic strength={10} className={block ? 'w-full sm:w-auto' : undefined}>
      <motion.div
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        initial="rest"
        animate="rest"
        className={block ? 'w-full sm:w-auto' : undefined}
      >
        <Link
          href={href}
          className={cn(
            'group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-md',
            block && 'flex w-full sm:inline-flex sm:w-auto sm:justify-start',
            'px-5 py-3 text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-bold tracking-normal sm:px-6',
            'transition-colors duration-300 ease-[var(--ease-brand)]',
            variantStyles[variant],
            className,
          )}
        >
          {/* Sheen sweep. Purely decorative, so it stays out of the a11y tree. */}
          <motion.span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 -left-1/3 -z-10 w-1/3 skew-x-[-20deg] blur-[6px]',
              variant === 'outline-brand' ? 'bg-brand-500/15' : 'bg-white/25',
            )}
            variants={{
              rest: { x: '-140%', opacity: 0 },
              hover: { x: '520%', opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          />

          <span className="relative">{children}</span>

          <span aria-hidden className="relative grid h-[1.125rem] w-[1.125rem] place-items-center overflow-hidden">
            <motion.span
              className="col-start-1 row-start-1"
              variants={{
                rest: { x: 0, opacity: 1 },
                hover: { x: 18, opacity: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <ArrowRight className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
            </motion.span>
            <motion.span
              className="col-start-1 row-start-1"
              variants={{
                rest: { x: -18, opacity: 0 },
                hover: {
                  x: 0,
                  opacity: 1,
                  transition: { duration: 0.32, delay: 0.06, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <ArrowRight className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
            </motion.span>
          </span>
        </Link>
      </motion.div>
    </Magnetic>
  );
}
