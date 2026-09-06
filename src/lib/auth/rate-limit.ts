/**
 * Minimal in-memory rate limiter factory.
 *
 * Per-process and in-memory on purpose: this app runs as a single Node
 * instance (see the note in stations/store.ts), so there is no multi-instance
 * state to coordinate. It resets on deploy/restart, which is an acceptable
 * trade-off for blunting casual abuse — it is not a substitute for a real WAF
 * if that ever becomes a requirement.
 */

type Limiter = {
  isLimited(key: string): boolean;
  recordAttempt(key: string): void;
  clear(key: string): void;
};

function createRateLimiter(windowMs: number, maxAttempts: number): Limiter {
  const attempts = new Map<string, { count: number; resetAt: number }>();

  return {
    isLimited(key) {
      const entry = attempts.get(key);
      if (!entry || entry.resetAt < Date.now()) return false;
      return entry.count >= maxAttempts;
    },
    recordAttempt(key) {
      const now = Date.now();
      const entry = attempts.get(key);
      if (!entry || entry.resetAt < now) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }
      entry.count += 1;
    },
    clear(key) {
      attempts.delete(key);
    },
  };
}

/** 8 failed logins / 15 minutes / IP — blunts casual brute-forcing of the single admin account. */
export const loginLimiter = createRateLimiter(15 * 60 * 1000, 8);

/**
 * 40 view-tracking pings / 5 minutes / IP. Generous — a real visitor clicking
 * around a station list should never come close — but enough to stop a
 * trivial script from inflating a station's engagement count for free.
 */
export const stationViewLimiter = createRateLimiter(5 * 60 * 1000, 40);

/**
 * 6 contact-form submissions / 10 minutes / IP. A real visitor sends one,
 * maybe two if they mistype something — this is generous headroom while
 * still stopping a script from hammering the mailbox for free.
 */
export const contactFormLimiter = createRateLimiter(10 * 60 * 1000, 6);

/** Same generous allowance as the contact form, for the /partner enquiry form. */
export const partnerEnquiryLimiter = createRateLimiter(10 * 60 * 1000, 6);

/**
 * 30 location searches / minute / IP — plenty for a human typing an address
 * into the admin "Add station" map, enough to stop a runaway loop from
 * hammering the upstream geocoder for free.
 */
export const geocodeLimiter = createRateLimiter(60 * 1000, 30);

/** Best-effort caller IP from the standard proxy header; 'unknown' if absent. */
export function clientKeyFromRequest(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
