import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'brand' | 'amber';
}) {
  return (
    <div className="rounded-lg border border-black/8 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#5A6E5A]">{label}</p>
        <Icon
          className={cn(
            'h-4 w-4',
            tone === 'brand' && 'text-[#00A550]',
            tone === 'amber' && 'text-[#B45309]',
            tone === 'default' && 'text-[#5A6E5A]',
          )}
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <p className="font-display mt-2 text-2xl font-bold text-[#0A0A0A]">{value}</p>
    </div>
  );
}
