import Link from 'next/link';
import { ArrowRight, BatteryCharging, Fuel, PlugZap } from 'lucide-react';

import type { Service } from '@/lib/site';
import { cn } from '@/lib/utils';

const icons = {
  'public-charging': PlugZap,
  'mobile-rescue': BatteryCharging,
  'charger-installation': Fuel,
} as const;

type ServiceCardProps = {
  service: Service;
  /** Position in the row, used to stagger the reveal. */
  index: number;
};

export function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = icons[service.id as keyof typeof icons] ?? PlugZap;
  const dark = service.featured === true;

  return (
    <article
      className={cn(
        // Spec: fill 424 x 405, 8px radius, 40px padding, space-between. The
        // fixed height applies only where the comp's three-up grid does.
        'reveal-up group flex h-full flex-col justify-between gap-8 rounded-lg p-10 lg:min-h-[405px] lg:gap-0',
        'transition-[transform,box-shadow] duration-500 ease-[var(--ease-brand)] hover:-translate-y-1',
        dark
          ? 'bg-black hover:shadow-[0_28px_60px_-34px_rgba(0,0,0,0.9)]'
          : 'bg-[#F4F8F5] hover:shadow-[0_28px_60px_-38px_rgba(0,0,0,0.45)]',
      )}
      style={
        {
          '--rev-start': `${10 + index * 4}%`,
          '--rev-end': `${62 + index * 4}%`,
          '--rev-delay': `${index * 0.1}s`,
        } as React.CSSProperties
      }
    >
      {/* Spec: hug 83 x 83, 14px radius, 16.5px padding, #00A550. */}
      <span className="bg-brand-500 grid h-[83px] w-[83px] shrink-0 place-items-center rounded-[14px]">
        <Icon
          className="h-[50px] w-[50px] text-white transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-110"
          strokeWidth={1.5}
          aria-hidden
        />
      </span>

      <div>
        <p className="text-[0.875rem] leading-4 font-medium tracking-normal text-[#1D9A3E]">
          {service.eyebrow}
        </p>

        <h3
          className={cn(
            'font-display mt-1 text-[1.5rem] leading-[1.1] font-bold tracking-normal',
            dark ? 'text-white' : 'text-[#0A0A0A]',
          )}
        >
          {service.title}
        </h3>

        <p
          className={cn(
            'mt-8 text-[clamp(1rem,1.25vw,1.125rem)] leading-[1.39] font-normal',
            dark ? 'text-white' : 'text-sage-500',
          )}
        >
          {service.body}
        </p>
      </div>

      <Link
        href={service.cta.href}
        className="inline-flex items-center gap-2 self-start text-[0.875rem] leading-4 font-bold tracking-normal text-[#1D9A3E]"
      >
        {service.cta.label}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-brand)] group-hover:translate-x-1"
          strokeWidth={2.4}
          aria-hidden
        />
      </Link>
    </article>
  );
}
