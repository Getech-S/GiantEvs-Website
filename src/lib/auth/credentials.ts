import bcrypt from 'bcryptjs';

/**
 * Verifies a login attempt against the single admin account configured via
 * environment variables. There is no signup flow and no user table — the
 * operator sets these once via `scripts/create-admin-password.mjs`.
 *
 * The hash is stored base64-encoded (`ADMIN_PASSWORD_HASH_B64`), not raw.
 * A raw bcrypt hash always contains literal `$`-prefixed segments (`$2b$12$…`),
 * and Next's built-in .env loader expands `$NAME` as a variable reference —
 * every one of those segments silently resolves to an empty string, truncating
 * the hash to garbage with no error at load time. Base64 has no `$`, so it
 * can't collide with that (or any other env-file) syntax.
 *
 * Returns false (rather than throwing) when the env vars are unset, so a
 * fresh checkout without admin configured fails closed instead of crashing.
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const encodedHash = process.env.ADMIN_PASSWORD_HASH_B64;
  if (!expectedUsername || !encodedHash) return false;

  let expectedHash: string;
  try {
    expectedHash = Buffer.from(encodedHash, 'base64').toString('utf8');
  } catch {
    return false;
  }

  // Compare the username too — bcrypt.compare on the password already
  // dominates the timing, but there's no reason to short-circuit on username.
  const usernameOk = username === expectedUsername;
  const passwordOk = await bcrypt.compare(password, expectedHash);
  return usernameOk && passwordOk;
}
