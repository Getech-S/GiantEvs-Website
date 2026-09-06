'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

import { springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';

type NavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  /** Shared id so the indicator slides between links instead of cross-fading. */
  layoutGroup: string;
};

/**
 * Weight is reserved for state, not interaction: only the current page is bold
 * and green. Hovering an inactive link darkens it and sweeps an underline in —
 * it never changes weight, so nothing shifts and nothing looks "selected"
 * that isn't.
 */
export function NavLink({ href, label, active, layoutGroup }: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative inline-flex flex-col items-center py-1.5 whitespace-nowrap',
        // 16-R from the spec: Grift, 18px / 25px line height, 0 letter spacing.
        'text-[1rem] leading-[25px] tracking-normal transition-colors duration-300 ease-[var(--ease-brand)] xl:text-[1.125rem]',
        active ? 'text-brand-500 font-bold' : 'text-sage-500 hover:text-sage-700 font-normal',
      )}
    >
      <span className="block">{label}</span>

      {active ? (
        <motion.span
          layoutId={layoutGroup}
          aria-hidden
          className="bg-brand-500 absolute -bottom-0.5 h-[2px] w-full rounded-full"
          transition={springSnappy}
        />
      ) : (
        <span
          aria-hidden
          className="bg-sage-500/40 absolute -bottom-0.5 h-[2px] w-full origin-left scale-x-0 rounded-full transition-transform duration-400 ease-[var(--ease-brand)] group-hover:scale-x-100"
        />
      )}
    </Link>
  );
}
