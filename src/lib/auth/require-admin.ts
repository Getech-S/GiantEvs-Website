import { cookies } from 'next/headers';

import { SESSION_COOKIE, verifySessionToken } from './session';

/** Reads and verifies the admin session cookie. For Server Components and Route Handlers. */
export async function getAdminUsername(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
