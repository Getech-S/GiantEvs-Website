/**
 * One-time import of the existing data/stations.json and data/news.json
 * content into the database (see scripts/init-db.mjs for the tables).
 * Safe to re-run — every row is upserted by id.
 *
 *   node --env-file=.env.local scripts/migrate-json-to-db.mjs
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/migrate-json-to-db.mjs');
  process.exit(1);
}

const sql = neon(url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

async function readJson(filename) {
  try {
    const raw = await readFile(join(dataDir, filename), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

const stations = await readJson('stations.json');
for (const station of stations) {
  await sql`
    INSERT INTO stations (id, name, address, city, lat, lng, connectors, free_bays, total_bays,
                           view_count, last_viewed_at, created_at, updated_at)
    VALUES (${station.id}, ${station.name}, ${station.address}, ${station.city}, ${station.lat}, ${station.lng},
            ${station.connectors}, ${station.freeBays}, ${station.totalBays},
            ${station.viewCount ?? 0}, ${station.lastViewedAt ?? null}, ${station.createdAt}, ${station.updatedAt})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city,
      lat = EXCLUDED.lat, lng = EXCLUDED.lng, connectors = EXCLUDED.connectors,
      free_bays = EXCLUDED.free_bays, total_bays = EXCLUDED.total_bays,
      view_count = EXCLUDED.view_count, last_viewed_at = EXCLUDED.last_viewed_at,
      created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at
  `;
  console.log(`Station: ${station.name}`);
}

const articles = await readJson('news.json');
for (const article of articles) {
  await sql`
    INSERT INTO news_articles (id, slug, title, category, cover_image, body, created_at, updated_at)
    VALUES (${article.id}, ${article.slug}, ${article.title}, ${article.category},
            ${JSON.stringify(article.coverImage)}::jsonb, ${JSON.stringify(article.body)}::jsonb,
            ${article.createdAt}, ${article.updatedAt})
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug, title = EXCLUDED.title, category = EXCLUDED.category,
      cover_image = EXCLUDED.cover_image, body = EXCLUDED.body,
      created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at
  `;
  console.log(`Article: ${article.title}`);
}

console.log(`\nDone — ${stations.length} station(s), ${articles.length} article(s).`);
