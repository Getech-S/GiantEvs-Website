'use client';

import { PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';

import { Magnetic } from '@/components/ui/magnetic';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Green "call us" pill: flat brand fill, outlined handset, no glow — the spec
 * shows a solid block of colour. The handset gives a short wiggle on hover,
 * which is motion only and leaves the resting appearance untouched.
 */
export function PhoneButton({ className }: { className?: string }) {
  return (
    <Magnetic strength={8}>
      <motion.div initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: 0.97 }}>
        <a
          href={site.phone.href}
          aria-label={`Call ${site.name} on ${site.phone.display}`}
          className={cn(
            'group bg-brand-500 hover:bg-brand-400 inline-flex items-center gap-2.5 rounded-lg px-4 py-2.5',
            'text-[1rem] leading-5 font-bold tracking-normal text-white',
            'transition-colors duration-300 ease-[var(--ease-brand)]',
            className,
          )}
        >
          <motion.span
            aria-hidden
            className="grid shrink-0 place-items-center"
            variants={{
              rest: { rotate: 0 },
              hover: {
                rotate: [0, -12, 10, -7, 5, 0],
                transition: { duration: 0.7, repeat: Infinity, repeatDelay: 0.4 },
              },
            }}
          >
            <PhoneCall className="h-5 w-5" strokeWidth={2} aria-hidden />
          </motion.span>

          <span className="whitespace-nowrap">{site.phone.display}</span>
        </a>
      </motion.div>
    </Magnetic>
  );
}
