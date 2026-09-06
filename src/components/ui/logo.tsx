import Image from 'next/image';
import Link from 'next/link';

import logoDark from '../../../public/brand/giant-evs-logo.png';
import logoOffwhite from '../../../public/brand/giant-evs-logo-offwhite.png';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

const variants = {
  default: logoDark,
  /**
   * Fully monochrome white — mark, wordmark and "Simply Powerful" tag all
   * white on transparency. Used on dark surfaces (the footer).
   */
  offwhite: logoOffwhite,
} as const;

type LogoProps = {
  className?: string;
  /**
   * Rendered height in pixels; width follows the artwork's own aspect ratio.
   * Ignored when `box` is set.
   */
  height?: number;
  /**
   * Fixed box size in pixels, cropped to fit — the web equivalent of Figma's
   * "Crop" image-fill mode. Use this when the comp specifies an exact
   * width/height whose ratio doesn't match the source art's own ratio (the
   * footer's offwhite lockup is one: box is 229x60, the file is ~889x335,
   * so it renders slightly cropped at top/bottom rather than squeezed).
   */
  box?: { width: number; height: number };
  priority?: boolean;
  variant?: keyof typeof variants;
};

export function Logo({ className, height = 38, box, priority = false, variant = 'default' }: LogoProps) {
  const logo = variants[variant];

  if (box) {
    return (
      <Link
        href="/"
        aria-label={`${site.name} — ${site.tagline}, home`}
        className={cn('relative inline-block shrink-0', className)}
        style={{ width: box.width, height: box.height }}
      >
        <Image
          src={logo}
          alt=""
          fill
          priority={priority}
          sizes={`${Math.round(box.width)}px`}
          className="object-cover select-none"
        />
      </Link>
    );
  }

  const width = Math.round((logo.width / logo.height) * height);

  return (
    <Link
      href="/"
      aria-label={`${site.name} — ${site.tagline}, home`}
      className={cn('inline-flex shrink-0 items-center', className)}
    >
      <Image
        src={logo}
        alt=""
        height={height}
        width={width}
        priority={priority}
        sizes={`${width}px`}
        className="select-none"
        style={{ height, width: 'auto' }}
      />
    </Link>
  );
}
