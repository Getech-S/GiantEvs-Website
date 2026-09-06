'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, PhoneCall, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { navigation, site } from '@/lib/site';
import { cn } from '@/lib/utils';

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

const panel = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 34 } },
  exit: { x: '100%', transition: { duration: 0.28, ease: [0.7, 0, 0.84, 0] as const } },
};

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
  exit: {},
};

const item = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.15 } },
};

export function MobileNav({ open, onClose, pathname }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(open);

  // Close on Escape, and move focus into the panel so keyboard users are not
  // left behind the overlay.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    }, 220);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-nav"
          className="fixed inset-0 z-[60] lg:hidden"
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            variants={panel}
            className="bg-ink-900 absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto px-6 pt-6 pb-10 text-white"
          >
            {/* Brand-green glow bleeding in from the top corner. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(0,165,80,0.55),transparent_65%)] blur-2xl"
            />

            <div className="relative flex items-center justify-between">
              <span className="text-xs font-semibold tracking-[0.22em] text-white/45 uppercase">
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/15 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>

            <motion.nav variants={list} className="relative mt-10 flex flex-col">
              {navigation.map((entry) => {
                const active = pathname === entry.href;
                return (
                  <motion.div key={entry.href} variants={item}>
                    <Link
                      href={entry.href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center justify-between border-b border-white/8 py-4 text-2xl tracking-tight',
                        'transition-colors duration-300',
                        // Same rule as the desktop navbar: weight marks the
                        // current page, nothing else.
                        active
                          ? 'text-brand-400 font-bold'
                          : 'hover:text-brand-400 font-normal text-white/85',
                      )}
                    >
                      {entry.label}
                      <ArrowUpRight
                        className="h-5 w-5 -translate-x-1 opacity-0 transition-all duration-300 ease-[var(--ease-brand)] group-hover:translate-x-0 group-hover:opacity-100"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <motion.div variants={item} className="relative mt-auto space-y-4 pt-10">
              <LanguageSwitcher tone="dark" className="w-full [&>button]:w-full [&>button]:justify-between" />
              <a
                href={site.phone.href}
                className="bg-brand-500 hover:bg-brand-400 flex w-full items-center justify-center gap-2.5 rounded-lg py-3.5 text-[1rem] font-bold text-white transition-colors"
              >
                <PhoneCall className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                {site.phone.display}
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
