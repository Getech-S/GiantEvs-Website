'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';

import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NavLink } from '@/components/layout/nav-link';
import { PhoneButton } from '@/components/layout/phone-button';
import { Logo } from '@/components/ui/logo';
import { useScrolled } from '@/hooks/use-scroll-state';
import { springScroll } from '@/lib/motion';
import { navigation } from '@/lib/site';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(12);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hairline reading-progress bar pinned to the bottom edge of the header.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, springScroll);

  return (
    <>
      <a
        href="#main"
        className="focus:bg-brand-500 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header
        // Solid white at every scroll position: no drop shadow, and no
        // translucency that would let the dark hero bleed through.
        className="animate-header-in fixed inset-x-0 top-0 z-50 bg-white"
      >
        <div
          className={cn(
            'container-page flex items-center justify-between gap-4 transition-[height] duration-500 ease-[var(--ease-brand)]',
            scrolled ? 'h-15' : 'h-[4.125rem]',
          )}
        >
          <Logo priority height={scrolled ? 32 : 38} className="transition-all duration-500" />

          <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex xl:gap-8">
            {navigation.map((entry) => (
              <NavLink
                key={entry.href}
                href={entry.href}
                label={entry.label}
                active={pathname === entry.href}
                layoutGroup="primary-nav-indicator"
              />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden md:block" labelClassName="lg:max-xl:hidden" />
            <PhoneButton className="hidden sm:inline-flex" />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="text-ink-900 grid h-11 w-11 place-items-center rounded-md ring-1 ring-black/10 transition-colors hover:bg-black/5 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>

        <motion.div
          aria-hidden
          // `initial` is what gets serialised into the SSR markup, so the bar
          // is empty on first paint instead of flashing full-width.
          initial={{ scaleX: 0 }}
          style={{ scaleX: progress }}
          className="via-brand-400 to-brand-500 from-brand-600 h-[2px] origin-left bg-gradient-to-r"
        />
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </>
  );
}
