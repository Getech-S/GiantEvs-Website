/**
 * Minimal stateless session token: base64url(payload).base64url(HMAC-SHA256).
 *
 * No session store or database table — the cookie itself carries the whole
 * session, signed so a visitor can't forge or extend one, with a short expiry
 * so a stolen cookie doesn't work forever. This is enough for a single-admin
 * internal tool; a multi-user product would want revocable sessions instead.
 *
 * Built on Web Crypto (`crypto.subtle`), not `node:crypto` — this module is
 * imported from `src/proxy.ts`, which runs on Next's Edge runtime and only
 * has Web Crypto, not Node's `crypto` module. Web Crypto is also globally
 * available in the Node runtime (Route Handlers), so one implementation
 * covers both.
 */

export const SESSION_COOKIE = 'giantevs_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

type SessionPayload = { sub: string; exp: number };

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a random 32+ character value in .env.local — ' +
        'see scripts/create-admin-password.mjs.',
    );
  }
  return value;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of array) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(payloadB64: string): Promise<string> {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return toBase64Url(signature);
}

export async function createSessionToken(username: string): Promise<string> {
  const payload: SessionPayload = { sub: username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${payloadB64}.${await sign(payloadB64)}`;
}

/** Returns the signed-in username, or null if the token is missing, forged, or expired. */
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const key = await hmacKey();
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(signature) as BufferSource,
    new TextEncoder().encode(payloadB64),
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
