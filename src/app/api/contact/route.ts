import { NextResponse, type NextRequest } from 'next/server';

import { clientKeyFromRequest, contactFormLimiter } from '@/lib/auth/rate-limit';
import { EmailNotConfiguredError, sendContactMessage } from '@/lib/email/send-contact-message';

/** Loose but sufficient — catches typos without rejecting real addresses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;

type ContactPayload = { name?: unknown; email?: unknown; subject?: unknown; message?: unknown };

/**
 * Public: the /contact form. Rate-limited per IP (see rate-limit.ts) since
 * it has no auth gate — this is the one deliberately public POST outside
 * /api/admin and /api/stations's admin-only mutations.
 */
export async function POST(request: NextRequest) {
  const key = clientKeyFromRequest(request);
  if (contactFormLimiter.isLimited(key)) {
    return NextResponse.json(
      { error: 'Too many messages sent from this connection. Please try again in a few minutes.' },
      { status: 429 },
    );
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const problems: string[] = [];
  if (!name) problems.push('Full name is required.');
  if (!email || !EMAIL_PATTERN.test(email)) problems.push('A valid email address is required.');
  if (!subject) problems.push('Please choose a subject.');
  if (!message) problems.push('A message is required.');
  if (message.length > MAX_MESSAGE_LENGTH) problems.push('Message is too long.');
  if (problems.length > 0) {
    return NextResponse.json({ error: problems.join(' ') }, { status: 400 });
  }

  // Count it against the limit only once the request is a real, valid
  // submission — malformed noise shouldn't burn a real visitor's attempts.
  contactFormLimiter.recordAttempt(key);

  try {
    await sendContactMessage({ name, email, subject, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json(
        {
          error:
            "Sorry, the contact form isn't fully set up yet — please call or email us directly for now.",
        },
        { status: 503 },
      );
    }
    console.error('Failed to send contact message:', error);
    return NextResponse.json(
      { error: 'Could not send your message right now. Please try again shortly.' },
      { status: 502 },
    );
  }
}
