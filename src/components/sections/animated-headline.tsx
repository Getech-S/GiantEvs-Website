import { cn } from '@/lib/utils';

type AnimatedHeadlineProps = {
  lines: readonly string[];
  className?: string;
  id?: string;
  /** Renders as `h1` by default; sections further down the page use `h2`. */
  as?: 'h1' | 'h2';
  /**
   * `load` plays on first paint (the hero, which is above the fold).
   * `scroll` rides a view() timeline so the lines arrive as the section
   * scrolls in. Both end visible even if the animation never runs.
   */
  reveal?: 'load' | 'scroll';
  /** Seconds before the first line starts; each line follows 0.12s later. */
  delay?: number;
  /**
   * Below `sm`, render the lines as one flowing block instead of honouring the
   * comp's line breaks. Those breaks are chosen for the desktop measure and
   * wrap badly on a phone; from `sm` up there is room to honour them.
   */
  joinOnMobile?: boolean;
};

/**
 * Each line slides up out of its own overflow mask. The visible copies are
 * aria-hidden and a single flat string is exposed to assistive tech, otherwise
 * screen readers announce the headline one fragment at a time.
 *
 * This is a server component — the reveal is pure CSS, so the headline paints
 * with the document instead of waiting on hydration.
 */
export function AnimatedHeadline({
  lines,
  className,
  id,
  as: Tag = 'h1',
  reveal = 'load',
  delay = 0.5,
  joinOnMobile = false,
}: AnimatedHeadlineProps) {
  const revealClass = reveal === 'scroll' ? 'reveal-line' : 'animate-line-in';
  // Lines may carry leading spacing to match a comp's indent; that must not
  // leak into the flat string or the joined mobile rendering.
  const flat = lines.map((line) => line.trim()).join(' ');
  const lineStyle = (index: number): React.CSSProperties =>
    reveal === 'scroll'
      ? ({
          '--rev-start': `${14 + index * 8}%`,
          '--rev-end': `${62 + index * 8}%`,
          '--rev-delay': `${index * 0.12}s`,
        } as React.CSSProperties)
      : { animationDelay: `${delay + index * 0.12}s` };

  return (
    <Tag id={id} className={cn('text-white', className)}>
      <span className="sr-only">{flat}</span>

      <span aria-hidden>
        {joinOnMobile ? (
          <span className="line-mask sm:hidden">
            <span
              className={cn('block origin-center will-change-transform', revealClass)}
              style={lineStyle(0)}
            >
              {flat}
            </span>
          </span>
        ) : null}

        <span className={joinOnMobile ? 'hidden sm:block' : undefined}>
          {lines.map((line, index) => (
            <span key={line} className="line-mask">
              <span
                className={cn('block origin-center will-change-transform', revealClass)}
                style={lineStyle(index)}
              >
                {line}
              </span>
            </span>
          ))}
        </span>
      </span>
    </Tag>
  );
}
