/**
 * Generates the environment variables needed to log into /admin.
 *
 *   node scripts/create-admin-password.mjs <username> <password>
 *
 * There is no signup flow and no way to set the admin password through the
 * UI — that is deliberate, so the real credential never passes through a
 * network request this app has to defend. Run this once, paste the printed
 * lines into .env.local (which is already gitignored), then restart the dev
 * server / redeploy.
 *
 * Requires: bcryptjs (already a project dependency).
 */
import { randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('usage: node scripts/create-admin-password.mjs <username> <password>');
  process.exit(1);
}
if (password.length < 10) {
  console.error('Choose a password of at least 10 characters.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
// base64, not the raw hash: a bcrypt hash is full of literal `$name$`-shaped
// segments, and Next's .env loader expands `$NAME` as a variable reference —
// every segment would silently resolve to an empty string with no error,
// truncating the hash to garbage. Base64 has no `$`, so this can't happen.
const encodedHash = Buffer.from(hash, 'utf8').toString('base64');
const sessionSecret = randomBytes(32).toString('base64url');

console.log('\nAdd these to .env.local:\n');
console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_PASSWORD_HASH_B64=${encodedHash}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('\nRestart the server after saving. The plaintext password above is not stored anywhere.');
console.log(
  '\nADMIN_PASSWORD_HASH_B64 is the bcrypt hash, base64-encoded — copy it exactly as printed.',
);
