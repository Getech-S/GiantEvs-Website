import { NextResponse, type NextRequest } from 'next/server';

import { clientKeyFromRequest, partnerEnquiryLimiter } from '@/lib/auth/rate-limit';
import { EmailNotConfiguredError, sendPartnerEnquiry } from '@/lib/email/send-partner-enquiry';

/** Loose but sufficient — catches typos without rejecting real addresses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;

type PartnerEnquiryPayload = {
  businessName?: unknown;
  contactName?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  parkingSpaces?: unknown;
  message?: unknown;
};

/**
 * Public: the /partner "host a charger" enquiry form. Rate-limited per IP
 * (see rate-limit.ts) since it has no auth gate, same as /api/contact.
 */
export async function POST(request: NextRequest) {
  const key = clientKeyFromRequest(request);
  if (partnerEnquiryLimiter.isLimited(key)) {
    return NextResponse.json(
      { error: 'Too many messages sent from this connection. Please try again in a few minutes.' },
      { status: 429 },
    );
  }

  let body: PartnerEnquiryPayload;
  try {
    body = (await request.json()) as PartnerEnquiryPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
  const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const parkingSpaces = typeof body.parkingSpaces === 'string' ? body.parkingSpaces.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const problems: string[] = [];
  if (!businessName) problems.push('Business or organisation name is required.');
  if (!contactName) problems.push('Your name is required.');
  if (!email || !EMAIL_PATTERN.test(email)) problems.push('A valid email address is required.');
  if (!phone) problems.push('A phone number is required.');
  if (!subject) problems.push('Please choose a subject.');
  if (message.length > MAX_MESSAGE_LENGTH) problems.push('Additional information is too long.');
  if (problems.length > 0) {
    return NextResponse.json({ error: problems.join(' ') }, { status: 400 });
  }

  // Count it against the limit only once the request is a real, valid
  // submission — malformed noise shouldn't burn a real visitor's attempts.
  partnerEnquiryLimiter.recordAttempt(key);

  try {
    await sendPartnerEnquiry({ businessName, contactName, email, phone, subject, parkingSpaces, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json(
        {
          error:
            "Sorry, the enquiry form isn't fully set up yet — please call or email us directly for now.",
        },
        { status: 503 },
      );
    }
    console.error('Failed to send partner enquiry:', error);
    return NextResponse.json(
      { error: 'Could not send your enquiry right now. Please try again shortly.' },
      { status: 502 },
    );
  }
}
