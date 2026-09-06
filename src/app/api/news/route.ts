import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';
import { createNews, listNews, NewsValidationError } from '@/lib/news/store';
import type { NewsInput } from '@/lib/news/types';

/** Public: anyone can read the article list — it's what the News page shows. */
export async function GET() {
  const news = await listNews();
  return NextResponse.json({ news });
}

/**
 * Admin-only: create an article. `src/proxy.ts` already blocks this route
 * for unauthenticated requests; the check here is defense in depth.
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: NewsInput;
  try {
    body = (await request.json()) as NewsInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const article = await createNews(body);
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof NewsValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
