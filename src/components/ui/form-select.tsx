import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Styled `<select>` — native appearance removed, a custom chevron drawn in
 * its place, so it doesn't carry each browser/OS's own dropdown arrow
 * fighting the field's padding. Shared by ContactForm and
 * PartnerEnquiryForm so both "Subject" pickers look identical.
 */
export function FormSelect({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          'focus:border-brand-500 w-full appearance-none rounded-[4px] border border-[#8C8C8C]/15 bg-white px-[18px] py-[14px] pr-10 text-[0.9375rem] text-black outline-none transition-colors',
          className,
        )}
      />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-black/40"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}
