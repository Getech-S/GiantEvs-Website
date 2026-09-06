import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NewsForm } from '@/components/admin/news-form';
import { getNews } from '@/lib/news/store';

export const metadata: Metadata = { title: 'Admin — Edit article', robots: { index: false, follow: false } };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getNews(id);
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">Edit article</h1>
      <div className="mt-6">
        <NewsForm mode="edit" article={article} />
      </div>
    </div>
  );
}
