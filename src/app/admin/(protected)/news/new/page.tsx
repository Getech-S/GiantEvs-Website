import type { Metadata } from 'next';

import { NewsForm } from '@/components/admin/news-form';

export const metadata: Metadata = { title: 'Admin — Add article', robots: { index: false, follow: false } };

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">Add article</h1>
      <div className="mt-6">
        <NewsForm mode="create" />
      </div>
    </div>
  );
}
