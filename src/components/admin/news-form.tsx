'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Loader2, Trash2 } from 'lucide-react';

import { slugify, type NewsBlock, type NewsInput, type NewsRecord } from '@/lib/news/types';
import { cn } from '@/lib/utils';

const inputClass =
  'focus:border-brand-500 w-full rounded-md border border-black/15 px-3 py-2.5 text-sm outline-none';
const labelClass = 'mb-1.5 block text-sm font-medium text-[#0A0A0A]';

type NewsFormProps = { mode: 'create' } | { mode: 'edit'; article: NewsRecord };

/** Uploads one image via the admin upload endpoint; returns its public path. */
async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const data: { path?: string; error?: string } = await response.json();
  if (!response.ok || !data.path) throw new Error(data.error ?? 'Upload failed.');
  return data.path;
}

function emptyBlock(type: NewsBlock['type']): NewsBlock {
  switch (type) {
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'heading':
      return { type: 'heading', text: '' };
    case 'list':
      return { type: 'list', items: [''] };
    case 'image':
      return { type: 'image', src: '', alt: '' };
  }
}

/** One inline "uploading…" image picker, reused for the cover image and image blocks. */
function ImagePicker({
  src,
  alt,
  onSrcChange,
  onAltChange,
  altLabel,
}: {
  src: string;
  alt: string;
  onSrcChange: (src: string) => void;
  onAltChange: (alt: string) => void;
  altLabel: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onSrcChange(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-black/10 bg-[#F4F8F5]">
        {src ? (
          <Image src={src} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-xs text-[#5A6E5A]">No image</span>
        )}
        {uploading ? (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="h-5 w-5 animate-spin text-[#5A6E5A]" aria-hidden />
          </span>
        ) : null}
      </div>
      <div className="flex-1 space-y-2">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium text-[#0A0A0A] hover:bg-black/5"
        >
          {src ? 'Replace image' : 'Upload image'}
        </button>
        <input
          value={alt}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder={altLabel}
          className={inputClass}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
}: {
  block: NewsBlock;
  onChange: (block: NewsBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const LABELS: Record<NewsBlock['type'], string> = {
    paragraph: 'Paragraph',
    heading: 'Sub-heading',
    list: 'Bullet list',
    image: 'Image',
  };

  return (
    <div className="rounded-lg border border-black/10 bg-[#FAFBFA] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[#5A6E5A] uppercase">
          {LABELS[block.type]}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Move block up"
            className="grid h-7 w-7 place-items-center rounded text-[#5A6E5A] hover:bg-black/5 disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Move block down"
            className="grid h-7 w-7 place-items-center rounded text-[#5A6E5A] hover:bg-black/5 disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove block"
            className="grid h-7 w-7 place-items-center rounded text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3">
        {block.type === 'paragraph' ? (
          <textarea
            value={block.text}
            onChange={(event) => onChange({ type: 'paragraph', text: event.target.value })}
            rows={4}
            placeholder="Paragraph text…"
            className={inputClass}
          />
        ) : null}

        {block.type === 'heading' ? (
          <input
            value={block.text}
            onChange={(event) => onChange({ type: 'heading', text: event.target.value })}
            placeholder="Sub-heading text…"
            className={inputClass}
          />
        ) : null}

        {block.type === 'list' ? (
          <textarea
            value={block.items.join('\n')}
            onChange={(event) => onChange({ type: 'list', items: event.target.value.split('\n') })}
            rows={4}
            placeholder={'One item per line…'}
            className={inputClass}
          />
        ) : null}

        {block.type === 'image' ? (
          <ImagePicker
            src={block.src}
            alt={block.alt}
            onSrcChange={(src) => onChange({ ...block, src })}
            onAltChange={(alt) => onChange({ ...block, alt })}
            altLabel="Describe this image for screen readers"
          />
        ) : null}
      </div>
    </div>
  );
}

export function NewsForm(props: NewsFormProps) {
  const router = useRouter();
  const initial = props.mode === 'edit' ? props.article : null;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(props.mode === 'edit');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [coverSrc, setCoverSrc] = useState(initial?.coverImage.src ?? '');
  const [coverAlt, setCoverAlt] = useState(initial?.coverImage.alt ?? '');
  const [body, setBody] = useState<NewsBlock[]>(initial?.body ?? [emptyBlock('paragraph')]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateBlock(index: number, block: NewsBlock) {
    setBody((current) => current.map((entry, i) => (i === index ? block : entry)));
  }
  function moveBlock(index: number, delta: number) {
    setBody((current) => {
      const next = [...current];
      const target = index + delta;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }
  function removeBlock(index: number) {
    setBody((current) => current.filter((_, i) => i !== index));
  }
  function addBlock(type: NewsBlock['type']) {
    setBody((current) => [...current, emptyBlock(type)]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: NewsInput = {
      title,
      slug: slug || slugify(title),
      category,
      coverImage: { src: coverSrc, alt: coverAlt },
      body: body.map((block) => (block.type === 'list' ? { ...block, items: block.items.filter((item) => item.trim()) } : block)),
    };
    const url = props.mode === 'edit' ? `/api/news/${props.article.id}` : '/api/news';
    const method = props.mode === 'edit' ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: { error?: string } = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      router.push('/admin/news');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          URL slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5A6E5A]">/news/</span>
          <input
            id="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <input
          id="category"
          required
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Retail & Hospitality"
          className={inputClass}
        />
      </div>

      <div>
        <span className={labelClass}>Cover image</span>
        <p className="-mt-1 mb-2 text-xs text-[#5A6E5A]">
          Shown on the news card and at the top of the article.
        </p>
        <ImagePicker
          src={coverSrc}
          alt={coverAlt}
          onSrcChange={setCoverSrc}
          onAltChange={setCoverAlt}
          altLabel="Describe the cover image for screen readers"
        />
      </div>

      <div>
        <span className={labelClass}>Article content</span>
        <div className="space-y-3">
          {body.map((block, index) => (
            <BlockEditor
              key={index}
              block={block}
              onChange={(next) => updateBlock(index, next)}
              onMoveUp={() => moveBlock(index, -1)}
              onMoveDown={() => moveBlock(index, 1)}
              onRemove={() => removeBlock(index)}
              canMoveUp={index > 0}
              canMoveDown={index < body.length - 1}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['paragraph', 'heading', 'image', 'list'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className={cn(
                'rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium text-[#0A0A0A]',
                'hover:bg-black/5',
              )}
            >
              + {type === 'paragraph' ? 'Paragraph' : type === 'heading' ? 'Sub-heading' : type === 'image' ? 'Image' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-500 hover:bg-brand-400 flex h-11 items-center rounded-md px-5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        >
          {submitting ? 'Saving…' : props.mode === 'edit' ? 'Save changes' : 'Publish article'}
        </button>
      </div>
    </form>
  );
}
