import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/admin/login-form';
import { getAdminUsername } from '@/lib/auth/require-admin';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

type SearchParams = { next?: string };

function safeNext(next: string | undefined): string {
  // Only ever redirect within the admin area, never to an attacker-supplied
  // external URL passed through the ?next= param.
  if (next && next.startsWith('/admin') && !next.startsWith('//')) return next;
  return '/admin';
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const alreadySignedIn = await getAdminUsername();
  const { next } = await searchParams;
  const target = safeNext(next);

  if (alreadySignedIn) redirect(target);

  return (
    <div className="grid min-h-[70svh] place-items-center bg-[#F4F8F5] px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-black/8 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
        <Logo priority height={30} />
        <h1 className="font-display mt-6 text-xl font-bold text-[#0A0A0A]">Admin sign in</h1>
        <p className="mt-1 text-sm text-[#5A6E5A]">Manage charging stations and site content.</p>

        <div className="mt-6">
          <LoginForm next={target} />
        </div>
      </div>
    </div>
  );
}
