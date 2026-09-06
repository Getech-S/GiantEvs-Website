import { cn } from '@/lib/utils';

type AvailabilityMeterProps = {
  free: number;
  total: number;
  className?: string;
};

/**
 * Segment meter: one bar per bay, lit for each free bay.
 *
 * Bars grow from the baseline in sequence as the card scrolls in. The count is
 * also written out next to the meter, so the colour is never the only carrier
 * of the information.
 */
export function AvailabilityMeter({ free, total, className }: AvailabilityMeterProps) {
  return (
    <div className={cn('flex items-end gap-[3px]', className)} aria-hidden>
      {Array.from({ length: total }, (_, index) => {
        const lit = index < free;
        return (
          <span
            key={index}
            className={cn(
              'reveal-bar block h-[18px] w-[7px] origin-bottom rounded-[2px]',
              lit ? 'bg-brand-500' : 'bg-white/12',
            )}
            style={
              {
                '--rev-start': `${18 + index * 4}%`,
                '--rev-end': `${58 + index * 4}%`,
                '--rev-delay': `${0.35 + index * 0.05}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
