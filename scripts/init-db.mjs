/**
 * Creates the stations/news_articles tables if they don't already exist.
 * Safe to re-run — every statement is CREATE TABLE IF NOT EXISTS.
 *
 *   node --env-file=.env.local scripts/init-db.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/init-db.mjs');
  process.exit(1);
}

const sql = neon(url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, 'db', 'schema.sql'), 'utf8');

// Strip full-line comments, then split into individual statements — the
// schema file has no semicolons inside string literals, so a plain split is
// safe here.
const statements = schema
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  console.log(`Running: ${statement.slice(0, 70).replace(/\s+/g, ' ')}...`);
  await sql.query(statement);
}

console.log(`\nDone — ${statements.length} statement(s) applied.`);
