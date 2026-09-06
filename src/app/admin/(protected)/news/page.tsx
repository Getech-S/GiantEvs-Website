import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { DeleteNewsButton } from '@/components/admin/delete-news-button';
import { formatRelativeTime } from '@/lib/format';
import { listNews } from '@/lib/news/store';

export const metadata: Metadata = { title: 'Admin — News', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const articles = await listNews();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0A0A0A]">News</h1>
          <p className="mt-1 text-sm text-[#5A6E5A]">
            {articles.length} article{articles.length === 1 ? '' : 's'} published on the public news page.
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="bg-brand-500 hover:bg-brand-400 flex h-10 items-center rounded-md px-4 text-sm font-semibold text-white transition-colors"
        >
          Add article
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-black/8 bg-white">
        {articles.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#5A6E5A]">
            No articles yet. Add the first one to put it on the public news page.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/8 text-[#5A6E5A]">
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-black/6 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-black/10 bg-[#F4F8F5]">
                        {article.coverImage.src ? (
                          <Image src={article.coverImage.src} alt="" fill sizes="56px" className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-[#0A0A0A]">{article.title}</p>
                        <p className="text-xs text-[#5A6E5A]">/news/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#5A6E5A]">{article.category}</td>
                  <td className="px-4 py-3 text-[#5A6E5A]">{formatRelativeTime(article.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/news/${article.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-[#5A6E5A] hover:text-[#0A0A0A]"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/news/${article.id}/edit`}
                        className="text-brand-500 text-sm font-medium hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteNewsButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
