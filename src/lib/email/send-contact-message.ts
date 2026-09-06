import { site } from '@/lib/site';

import { buildTransport, EmailNotConfiguredError, fromAddress } from './transport';

/** Sends a contact-form submission to `site.email` over SMTP. See transport.ts for setup. */

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export { EmailNotConfiguredError };

export async function sendContactMessage(input: ContactMessage): Promise<void> {
  const transport = buildTransport();

  await transport.sendMail({
    from: `"${site.name} website" <${fromAddress()}>`,
    to: site.email,
    // So hitting "Reply" in the mailbox goes straight back to the visitor.
    replyTo: `"${input.name}" <${input.email}>`,
    subject: `[Website enquiry] ${input.subject} — ${input.name}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Subject: ${input.subject}`,
      '',
      input.message,
    ].join('\n'),
  });
}
