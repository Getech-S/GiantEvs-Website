import { NextResponse, type NextRequest } from 'next/server';

import { verifyAdminCredentials } from '@/lib/auth/credentials';
import { clientKeyFromRequest, loginLimiter } from '@/lib/auth/rate-limit';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session';

/** Rejects a login POST whose Origin doesn't match our own — closes the one
 *  CSRF gap SameSite=Lax cookies don't already cover for this endpoint. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // browsers omit it for some same-origin requests
  return origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const key = clientKeyFromRequest(request);
  if (loginLimiter.isLimited(key)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { username, password } = body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    loginLimiter.recordAttempt(key);
    // Deliberately generic — never confirm which of the two was wrong.
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  loginLimiter.clear(key);
  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
