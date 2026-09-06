import Link from 'next/link';
import { Facebook, Instagram, Linkedin, X } from 'lucide-react';

import { Logo } from '@/components/ui/logo';
import { footer, site } from '@/lib/site';
import { cn } from '@/lib/utils';

const socialIcons = { facebook: Facebook, x: X, linkedin: Linkedin, instagram: Instagram } as const;

/**
 * Shared across every page via the root layout — built once here rather than
 * per-route. All content lives in `footer` / `site` in `src/lib/site.ts`.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black">
      <div className="container-page py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-[23.9375rem]">
            {/* Spec: 229.01 x 60.19, Scale: Crop. */}
            <Logo variant="offwhite" box={{ width: 229, height: 60 }} />

            <p className="mt-6 text-[1rem] leading-[1.39] font-normal text-[rgba(255,255,255,0.7)]">
              {footer.tagline}
            </p>

            <ul className="mt-7 flex items-center gap-3">
              {footer.socials.map((social) => {
                const Icon = socialIcons[social.id as keyof typeof socialIcons];
                return (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className={cn(
                        'bg-brand-900/50 text-brand-400 grid h-9 w-9 place-items-center rounded-md',
                        'ring-1 ring-inset ring-white/8 transition-colors duration-300 ease-[var(--ease-brand)]',
                        'hover:bg-brand-500 hover:text-white',
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-[1rem] leading-[1.1] font-bold tracking-normal text-white">
                {column.title}
              </h2>
              <ul className="mt-6 space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[1rem] leading-[1.31] font-normal text-[rgba(255,255,255,0.65)] transition-colors duration-300 ease-[var(--ease-brand)] hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="mt-14 border-white/10 sm:mt-16" />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.875rem] leading-5 text-[rgba(255,255,255,0.5)]">
            &copy; {year} {site.name}. All rights reserved. {footer.location}
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[0.875rem] leading-5 text-[rgba(255,255,255,0.5)] transition-colors duration-300 ease-[var(--ease-brand)] hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
