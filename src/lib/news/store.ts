import { randomUUID } from 'node:crypto';

import { sql } from '@/lib/db';

import { slugify, type NewsBlock, type NewsInput, type NewsRecord } from './types';

/**
 * Postgres-backed store for news articles — same reasoning and same shape of
 * change as src/lib/stations/store.ts (see the note there on why this
 * stopped being a JSON file once the app moved to Vercel).
 *
 * NEVER import this module from a Client Component — it talks to the
 * database and must only run on the server (Route Handlers, Server
 * Components).
 */

export class NewsValidationError extends Error {}

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  cover_image: NewsRecord['coverImage'];
  body: NewsBlock[];
  created_at: Date | string;
  updated_at: Date | string;
};

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function rowToNews(row: NewsRow): NewsRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    coverImage: row.cover_image,
    body: row.body,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

/** Postgres' SQLSTATE for a unique-constraint violation. */
const UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;
}

function validateBlock(block: NewsBlock, index: number, problems: string[]): void {
  const at = `Block ${index + 1}`;
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      if (!block.text.trim()) problems.push(`${at}: text is required.`);
      break;
    case 'list':
      if (block.items.length === 0 || block.items.every((item) => !item.trim())) {
        problems.push(`${at}: add at least one list item.`);
      }
      break;
    case 'image':
      if (!block.src.trim()) problems.push(`${at}: image is required.`);
      if (!block.alt.trim()) problems.push(`${at}: image alt text is required.`);
      break;
  }
}

function validate(input: NewsInput): void {
  const problems: string[] = [];

  if (!input.title.trim()) problems.push('Title is required.');
  if (!input.category.trim()) problems.push('Category is required.');
  if (!input.coverImage.src.trim()) problems.push('Cover image is required.');
  if (!input.coverImage.alt.trim()) problems.push('Cover image alt text is required.');
  if (!input.slug.trim()) problems.push('Slug is required.');
  if (input.slug !== slugify(input.slug)) {
    problems.push('Slug must be lowercase letters, numbers and hyphens only.');
  }
  if (input.body.length === 0) problems.push('Add at least one content block.');
  input.body.forEach((block, index) => validateBlock(block, index, problems));

  if (problems.length > 0) throw new NewsValidationError(problems.join(' '));
}

export async function listNews(): Promise<NewsRecord[]> {
  // Newest first, same as stations — an article an admin just added or
  // edited is the one they want to see.
  const rows = await sql`SELECT * FROM news_articles ORDER BY updated_at DESC`;
  return (rows as NewsRow[]).map(rowToNews);
}

export async function getNews(id: string): Promise<NewsRecord | undefined> {
  const rows = await sql`SELECT * FROM news_articles WHERE id = ${id}`;
  return rows.length > 0 ? rowToNews(rows[0] as NewsRow) : undefined;
}

export async function getNewsBySlug(slug: string): Promise<NewsRecord | undefined> {
  const rows = await sql`SELECT * FROM news_articles WHERE slug = ${slug}`;
  return rows.length > 0 ? rowToNews(rows[0] as NewsRow) : undefined;
}

/** Slug must be unique; append -2, -3, … until it is. `ignoreId` excludes the article being edited from the check. */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const taken = new Set(
    (
      await sql`
        SELECT slug FROM news_articles
        WHERE slug = ${base} OR slug LIKE ${`${base}-%`}
      `
    ).map((row) => (row as { slug: string }).slug),
  );

  // The article being edited is allowed to keep its own current slug.
  if (ignoreId) {
    const own = await sql`SELECT slug FROM news_articles WHERE id = ${ignoreId}`;
    if (own.length > 0) taken.delete((own[0] as { slug: string }).slug);
  }

  let candidate = base || 'article';
  let suffix = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createNews(input: NewsInput): Promise<NewsRecord> {
  const slug = await uniqueSlug(slugify(input.slug || input.title));
  const resolved: NewsInput = { ...input, slug };
  validate(resolved);

  const id = randomUUID();
  try {
    const rows = await sql`
      INSERT INTO news_articles (id, slug, title, category, cover_image, body)
      VALUES (${id}, ${resolved.slug}, ${resolved.title}, ${resolved.category},
              ${JSON.stringify(resolved.coverImage)}::jsonb, ${JSON.stringify(resolved.body)}::jsonb)
      RETURNING *
    `;
    return rowToNews(rows[0] as NewsRow);
  } catch (error) {
    // Two admins (or two tabs) publishing the same title at the same instant
    // could both compute the same "free" slug before either has inserted —
    // the unique constraint is the real guard; this just retries once past it.
    if (isUniqueViolation(error)) return createNews(input);
    throw error;
  }
}

export async function updateNews(id: string, input: NewsInput): Promise<NewsRecord> {
  const slug = await uniqueSlug(slugify(input.slug || input.title), id);
  const resolved: NewsInput = { ...input, slug };
  validate(resolved);

  try {
    const rows = await sql`
      UPDATE news_articles
      SET slug = ${resolved.slug}, title = ${resolved.title}, category = ${resolved.category},
          cover_image = ${JSON.stringify(resolved.coverImage)}::jsonb,
          body = ${JSON.stringify(resolved.body)}::jsonb, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) throw new NewsValidationError('Article not found.');
    return rowToNews(rows[0] as NewsRow);
  } catch (error) {
    if (isUniqueViolation(error)) return updateNews(id, input);
    throw error;
  }
}

export async function deleteNews(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM news_articles WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
