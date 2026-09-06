import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-ink-900 flex min-h-[80svh] flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <p className="text-brand-400 text-sm font-semibold tracking-[0.28em] uppercase">404</p>
      <h1 className="font-display max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        This charger is off the grid.
      </h1>
      <p className="max-w-md text-white/70">
        The page you were looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-brand-500 hover:bg-brand-400 mt-2 rounded-md px-5 py-3 text-[0.9375rem] font-semibold transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
