import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { slugify, type NewsBlock, type NewsInput, type NewsRecord } from './types';

/**
 * Server-only JSON file store for news articles — same design as
 * src/lib/stations/store.ts (see the note there on why a JSON file, and on
 * why this doesn't survive a move to serverless/multi-instance hosting).
 *
 * NEVER import this module from a Client Component — it uses `node:fs` and
 * must only run on the server (Route Handlers, Server Components).
 */

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'news.json');

export class NewsValidationError extends Error {}

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => undefined);
  return result;
}

async function readAll(): Promise<NewsRecord[]> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NewsRecord[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeAll(articles: NewsRecord[]): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(articles, null, 2), 'utf8');
  await rename(tmp, DATA_FILE);
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
  const articles = await readAll();
  // Newest first, same as stations — an article an admin just added or
  // edited is the one they want to see.
  return [...articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getNews(id: string): Promise<NewsRecord | undefined> {
  const articles = await readAll();
  return articles.find((article) => article.id === id);
}

export async function getNewsBySlug(slug: string): Promise<NewsRecord | undefined> {
  const articles = await readAll();
  return articles.find((article) => article.slug === slug);
}

/** Slug must be unique; append -2, -3, … until it is. `ignoreId` excludes the article being edited from the check. */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const articles = await readAll();
  let candidate = base || 'article';
  let suffix = 2;
  while (articles.some((article) => article.slug === candidate && article.id !== ignoreId)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createNews(input: NewsInput): Promise<NewsRecord> {
  const slug = await uniqueSlug(slugify(input.slug || input.title));
  const resolved: NewsInput = { ...input, slug };
  validate(resolved);

  return withLock(async () => {
    const articles = await readAll();
    const now = new Date().toISOString();
    const record: NewsRecord = { ...resolved, id: randomUUID(), createdAt: now, updatedAt: now };
    articles.push(record);
    await writeAll(articles);
    return record;
  });
}

export async function updateNews(id: string, input: NewsInput): Promise<NewsRecord> {
  const slug = await uniqueSlug(slugify(input.slug || input.title), id);
  const resolved: NewsInput = { ...input, slug };
  validate(resolved);

  return withLock(async () => {
    const articles = await readAll();
    const index = articles.findIndex((article) => article.id === id);
    if (index === -1) throw new NewsValidationError('Article not found.');
    const updated: NewsRecord = {
      ...resolved,
      id,
      createdAt: articles[index]!.createdAt,
      updatedAt: new Date().toISOString(),
    };
    articles[index] = updated;
    await writeAll(articles);
    return updated;
  });
}

export function deleteNews(id: string): Promise<boolean> {
  return withLock(async () => {
    const articles = await readAll();
    const next = articles.filter((article) => article.id !== id);
    if (next.length === articles.length) return false;
    await writeAll(next);
    return true;
  });
}
