import { headers } from 'next/headers';

/**
 * schema.org structured data for search engines. Carries the per-request CSP
 * nonce (see src/proxy.ts), same as the homepage always did, and escapes `<`
 * so an admin-entered article title containing "</script>" can't break out
 * of the tag.
 */
export async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
