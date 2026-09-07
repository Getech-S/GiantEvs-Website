import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Shared Postgres (Neon) client for every store module — stations, news.
 *
 * Replaces the old JSON-file stores (see the git history of
 * stations/store.ts and news/store.ts) now that the app runs on Vercel:
 * serverless functions have no persistent, shared disk, so a real database
 * is required rather than optional here.
 *
 * `neon()` is Neon's own HTTP-based driver — no long-lived TCP connection or
 * pool to manage, which is exactly what a serverless function (a fresh,
 * short-lived process per invocation) needs.
 *
 * Created lazily, on first query, rather than at module load: this file is
 * imported by nearly every page (stations/news content lives behind it), so
 * throwing eagerly here would break `next build`'s module-collection step
 * for anyone who checks this repo out fresh before wiring up DATABASE_URL.
 * A missing/unset variable now only breaks the specific request that needed
 * data, with a clear message, instead of the whole build.
 */
// Pinned to the plain (non-array-mode, non-full-results) shape — the
// default `neon(url)` returns, and the only one this app uses — rather than
// leaving it to widen to the full ArrayMode/FullResults union.
let client: NeonQueryFunction<false, false> | undefined;

export function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Add it to .env.local — run `vercel env pull .env.local` ' +
          'once a Postgres database is connected in the Vercel dashboard\'s Storage tab.',
      );
    }
    client = neon(url);
  }
  return client(strings, ...values);
}
