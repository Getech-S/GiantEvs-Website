'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { languages } from '@/lib/site';
import { popover } from '@/lib/motion';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  className?: string;
  /** Inverts the styling for use on dark surfaces (e.g. the mobile drawer). */
  tone?: 'light' | 'dark';
  /**
   * Applied to the current-language label. Pass a responsive `hidden`
   * utility to collapse the control down to its globe icon where the header
   * runs out of room — the menu itself still works, so the languages never
   * become unreachable.
   */
  labelClassName?: string;
};

export function LanguageSwitcher({
  className,
  tone = 'light',
  labelClassName,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(languages[0]!.code);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on outside click and on Escape — expected behaviour for a menu button.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const active = languages.find((language) => language.code === current) ?? languages[0]!;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Language: ${active.label}`}
        className={cn(
          'inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2.5',
          // 14-M from the spec: Grift Medium, 14px / 16px line height.
          'text-[0.875rem] leading-4 font-medium tracking-normal',
          'ring-1 ring-inset transition-colors duration-300 ease-[var(--ease-brand)]',
          tone === 'light'
            ? 'text-sage-500 hover:text-sage-700 ring-black/12 hover:ring-black/25'
            : 'text-white/85 ring-white/20 hover:text-white hover:ring-white/40',
        )}
      >
        <Globe className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className={labelClassName}>{active.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} aria-hidden>
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="menu"
            variants={popover}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute top-[calc(100%+0.5rem)] right-0 z-50 min-w-[11rem] origin-top-right overflow-hidden rounded-lg bg-white p-1.5 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/8"
          >
            {languages.map((language) => (
              <li key={language.code} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={language.code === current}
                  onClick={() => {
                    setCurrent(language.code);
                    setOpen(false);
                  }}
                  className="text-ink-700 hover:bg-brand-50 hover:text-brand-700 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-[0.875rem] font-medium transition-colors"
                >
                  {language.label}
                  {language.code === current ? (
                    <Check className="text-brand-500 h-4 w-4" strokeWidth={2.4} aria-hidden />
                  ) : null}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
