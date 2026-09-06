import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Temporary stand-in for routes that exist in the navigation but haven't been
 * designed yet. Replace each of these pages as its section is built.
 */
export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <section className="bg-ink-900 relative isolate flex min-h-[100svh] items-center overflow-hidden text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-20%] left-[-10%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(0,165,80,0.32),transparent_62%)] blur-3xl"
      />
      <div className="container-page relative pt-[var(--spacing-header)]">
        <p className="text-brand-400 text-xs font-semibold tracking-[0.28em] uppercase">
          In development
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.02] font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-white/70">{blurb}</p>
        <Link
          href="/"
          className="group mt-9 inline-flex items-center gap-2 rounded-md bg-white/10 px-5 py-3 text-[0.9375rem] font-semibold ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/15"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
            strokeWidth={2.2}
            aria-hidden
          />
          Back home
        </Link>
      </div>
    </section>
  );
}
