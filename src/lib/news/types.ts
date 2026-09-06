/**
 * Canonical news-article record — the one shape used by the public news
 * list/detail pages and the admin CRUD forms. Nothing else in the app should
 * invent its own article shape.
 */

/**
 * The body is a short, ordered list of content blocks rather than one HTML
 * blob — simple enough to edit with plain form fields (no rich-text editor
 * dependency), but expressive enough for the article layout the design
 * calls for: paragraphs, sub-headings, an inline image, and a bullet list.
 */
export type NewsBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string };

export type NewsRecord = {
  id: string;
  /** URL slug, e.g. "how-the-fuel-retail-industry-can-benefit". Unique. */
  slug: string;
  title: string;
  /** Short tag shown on the card and the article, e.g. "Retail & Hospitality". */
  category: string;
  coverImage: { src: string; alt: string };
  body: NewsBlock[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Input shape for create/update — everything the store derives (id,
 * timestamps) is omitted; the admin form never sets these. `slug` is also
 * derived (from the title, on create) unless the admin overrides it.
 */
export type NewsInput = Omit<NewsRecord, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Grid classes for a row of news cards, adjusted for how many there are —
 * the 3-across desktop grid is designed for a full row; with only one or two
 * real articles (as when the admin has just started publishing) it should
 * sit centred at its natural width instead of stretching across an
 * otherwise-empty row. Shared by the news list and "more related news".
 */
export function newsGridClass(count: number): string {
  if (count <= 1) return 'mx-auto grid max-w-[26.5rem] grid-cols-1 gap-6';
  if (count === 2) return 'mx-auto grid max-w-[42rem] grid-cols-1 gap-6 sm:grid-cols-2';
  return 'mx-auto grid max-w-[26.5rem] grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3';
}

/** "How the Fuel Retail Industry..." -> "how-the-fuel-retail-industry" */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
