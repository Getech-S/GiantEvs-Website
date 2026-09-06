import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';

/**
 * Admin-only image upload for the news editor. `src/proxy.ts` already blocks
 * every `/api/admin/*` route for unauthenticated requests; the check here is
 * defense in depth, not the primary gate.
 *
 * Saves straight to `public/media/news-uploads/`, which `next start` serves
 * directly from disk with no rebuild needed — the same JSON-file-store
 * assumption as src/lib/news/store.ts applies here too: this only works on a
 * single, persistent Node process, not serverless/multi-instance hosting.
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const UPLOAD_DIR = join(process.cwd(), 'public', 'media', 'news-uploads');

export async function POST(request: NextRequest) {
  const admin = await getAdminUsername();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'The file is empty.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Images must be 8MB or smaller.' }, { status: 400 });
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG or WebP images are allowed.' },
      { status: 400 },
    );
  }

  // Own generated filename — never the client-supplied name — so there's no
  // path-traversal surface and no risk of one upload overwriting another.
  const filename = `${randomUUID()}.${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ path: `/media/news-uploads/${filename}` }, { status: 201 });
}
