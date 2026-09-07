import { put } from '@vercel/blob';
import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUsername } from '@/lib/auth/require-admin';

/**
 * Admin-only image upload for the news editor. `src/proxy.ts` already blocks
 * every `/api/admin/*` route for unauthenticated requests; the check here is
 * defense in depth, not the primary gate.
 *
 * Uploads to Vercel Blob rather than the local filesystem — Vercel's
 * serverless functions have no persistent, shared disk to write to (a file
 * saved during one request wouldn't exist for the next one, or on another
 * instance). Blob storage is the direct replacement: same "give the admin a
 * URL back" contract, just backed by real, durable storage.
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

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

  // Own generated pathname — never the client-supplied name — so there's no
  // path-traversal surface and no risk of one upload overwriting another.
  // `addRandomSuffix` is a second guard against collisions on top of that.
  const blob = await put(`news-uploads/${crypto.randomUUID()}.${extension}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({ path: blob.url }, { status: 201 });
}
