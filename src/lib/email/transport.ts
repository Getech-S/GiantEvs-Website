import nodemailer from 'nodemailer';

/**
 * Shared SMTP transport builder for every outbound mail sender (the contact
 * form, the partner enquiry form, and any future one). One mailbox's worth
 * of credentials in `.env.local` — SMTP_HOST, SMTP_PORT, SMTP_USER,
 * SMTP_PASSWORD (and optionally CONTACT_FROM_EMAIL, if the sending address
 * should differ from SMTP_USER). Until those are set this throws
 * EmailNotConfiguredError rather than pretending to have sent anything —
 * see each route handler for how that surfaces to the visitor.
 */

export class EmailNotConfiguredError extends Error {}

export function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    throw new EmailNotConfiguredError(
      'Email sending is not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD in .env.local.',
    );
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // 465 = implicit TLS; 587/25 upgrade via STARTTLS.
    auth: { user, pass: password },
  });
}

export function fromAddress(): string {
  return process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER!;
}
