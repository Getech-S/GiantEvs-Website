import { site } from '@/lib/site';

import { buildTransport, EmailNotConfiguredError, fromAddress } from './transport';

/** Sends a /partner enquiry-form submission to `site.email` over SMTP. See transport.ts for setup. */

export type PartnerEnquiry = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  subject: string;
  parkingSpaces: string;
  message: string;
};

export { EmailNotConfiguredError };

export async function sendPartnerEnquiry(input: PartnerEnquiry): Promise<void> {
  const transport = buildTransport();

  await transport.sendMail({
    from: `"${site.name} website" <${fromAddress()}>`,
    to: site.email,
    // So hitting "Reply" in the mailbox goes straight back to the enquirer.
    replyTo: `"${input.contactName}" <${input.email}>`,
    subject: `[Partner enquiry] ${input.subject} — ${input.businessName}`,
    text: [
      `Business / Organisation: ${input.businessName}`,
      `Contact name: ${input.contactName}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Subject: ${input.subject}`,
      `Parking spaces: ${input.parkingSpaces || 'Not specified'}`,
      '',
      input.message || '(No additional information provided.)',
    ].join('\n'),
  });
}
