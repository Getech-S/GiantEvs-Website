import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/admin/logout-button';
import { Logo } from '@/components/ui/logo';
import { getAdminUsername } from '@/lib/auth/require-admin';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * `src/proxy.ts` already redirects unauthenticated requests away from
 * everything under /admin (except /admin/login). This check is the second,
 * independent layer: it also covers requests the proxy's `missing:` prefetch
 * exclusion lets through, so a signed-out visitor can never get a rendered
 * admin page even for a moment.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const username = await getAdminUsername();
  if (!username) redirect('/admin/login');

  return (
    <div className="min-h-[70svh] bg-[#F4F8F5]">
      <header className="border-b border-black/8 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo height={26} />
            <nav className="flex items-center gap-5 text-sm font-medium text-[#5A6E5A]">
              <Link href="/admin" className="hover:text-[#0A0A0A]">
                Dashboard
              </Link>
              <Link href="/admin/stations" className="hover:text-[#0A0A0A]">
                Stations
              </Link>
              <Link href="/admin/news" className="hover:text-[#0A0A0A]">
                News
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#5A6E5A]">{username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container-page py-10">{children}</main>
    </div>
  );
}
