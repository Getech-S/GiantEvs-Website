'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { ArrowRight, Crown, Mail, Phone, X } from 'lucide-react';

import { site, vipReserve } from '@/lib/site';

const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  site.email,
)}&su=${encodeURIComponent('VIP Reservation Enquiry')}`;

/**
 * Floating "Reserve VIP Spot" button. Hidden over the hero; fades and slides
 * in once the visitor scrolls past it, and hides again if they scroll back
 * up — a WhatsApp-widget-style presence, not a permanent fixture over the
 * landing shot. Clicking it opens a small panel with the two fastest ways to
 * reach a human (WhatsApp, email) plus a way back to the self-serve finder.
 */
export function VipReserveFab() {
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (value) => {
    const threshold = typeof window === 'undefined' ? 500 : window.innerHeight * 0.7;
    const next = value > threshold;
    setPastHero(next);
    // Close (rather than leave it pre-opened) once the button itself
    // scrolls back out of view — done here, in the scroll subscription
    // itself, rather than a separate effect watching `pastHero`.
    if (!next) setOpen(false);
  });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {pastHero ? (
        <motion.div
          key="vip-fab-root"
          ref={rootRef}
          initial={{ opacity: 0, y: 28, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6"
        >
          <AnimatePresence>
            {open ? (
              <motion.div
                key="vip-panel"
                role="dialog"
                aria-modal="false"
                aria-label={vipReserve.title}
                initial={{ opacity: 0, y: 14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 bottom-[calc(100%+1rem)] w-[min(22rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]"
              >
                <div className="bg-brand-500 flex items-center justify-between gap-3 px-5 py-4">
                  <p className="flex items-center gap-2 text-[1rem] font-bold text-white">
                    <Crown className="h-5 w-5" strokeWidth={2} aria-hidden />
                    {vipReserve.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15"
                  >
                    <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  <p className="text-sage-500 text-[0.9375rem] leading-[1.45]">{vipReserve.body}</p>

                  {/* WhatsApp, not a plain tel: link — this is the team's preferred fast channel. */}
                  <a
                    href={site.phone.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-m-1 flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-black/[0.03]"
                  >
                    <span className="bg-brand-500 grid h-9 w-9 shrink-0 place-items-center rounded-md">
                      <Phone className="h-4 w-4 text-white" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="text-[1rem] font-medium text-black">{site.phone.display}</span>
                  </a>

                  {/* Opens Gmail's own compose window directly, as asked — a plain
                      mailto: would be more universal across mail clients, but
                      this guarantees something opens even with none configured. */}
                  <a
                    href={GMAIL_COMPOSE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-m-1 flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-black/[0.03]"
                  >
                    <span className="bg-brand-500 grid h-9 w-9 shrink-0 place-items-center rounded-md">
                      <Mail className="h-4 w-4 text-white" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="truncate text-[1rem] font-medium text-black">{site.email}</span>
                  </a>

                  {/* Wrapped in its own top-padded div rather than relying on
                      space-y-4 alone: space-y-4 doesn't even reach this last
                      child (Tailwind's :not(:last-child) selector skips it),
                      and the email row above it has its own -m-1/p-1
                      hit-area trick that leaves a *negative* margin on its
                      trailing edge — the two together closed this gap
                      completely. Padding doesn't collapse like margins do,
                      so pt-4 here guarantees the same ~12px rhythm as the
                      gaps above it. */}
                  <div className="pt-4">
                    <Link
                      href={vipReserve.cta.href}
                      onClick={() => setOpen(false)}
                      className="bg-brand-500 hover:bg-brand-400 flex h-12 items-center justify-center gap-2 rounded-md text-[0.9375rem] font-bold text-white transition-colors duration-300 ease-[var(--ease-brand)]"
                    >
                      {vipReserve.cta.label}
                      <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={open ? 'Close VIP reservation panel' : 'Open VIP reservation panel'}
            className="bg-brand-500 hover:bg-brand-400 grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_16px_32px_-10px_rgba(0,165,80,0.55)] transition-colors duration-300"
            // A gentle, occasional "notice me" buzz — small amplitude, long
            // rest between bursts, so it reads as a nudge rather than a
            // constant distraction. Off entirely once the panel is open, or
            // for anyone with prefers-reduced-motion set.
            animate={
              !open && !prefersReduced
                ? { rotate: [0, -8, 7, -6, 4, -2, 0], scale: [1, 1.05, 1.05, 1.03, 1.02, 1.01, 1] }
                : { rotate: 0, scale: 1 }
            }
            transition={
              !open && !prefersReduced
                ? { duration: 0.85, repeat: Infinity, repeatDelay: 3.4, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          >
            <Crown className="h-6 w-6" strokeWidth={2} aria-hidden />
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
