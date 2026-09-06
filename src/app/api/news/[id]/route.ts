import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';
import { deleteNews, getNews, NewsValidationError, updateNews } from '@/lib/news/store';
import type { NewsInput } from '@/lib/news/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const article = await getNews(id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: NewsInput;
  try {
    body = (await request.json()) as NewsInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const article = await updateNews(id, body);
    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof NewsValidationError) {
      const status = error.message === 'Article not found.' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteNews(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
