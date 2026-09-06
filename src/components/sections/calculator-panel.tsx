'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import {
  batterySizes,
  chargeMinutes,
  chargerTypes,
  cost,
  deliveredEnergy,
  formatDuration,
  formatKwh,
  formatRwf,
} from '@/lib/charging';
import { cn } from '@/lib/utils';

const labelClass = 'text-[0.875rem] leading-4 font-bold tracking-normal text-[#0A0A0A]';

export function CalculatorPanel() {
  const [capacity, setCapacity] = useState(batterySizes[1]!.kwh); // Mid (60 kWh)
  const [start, setStart] = useState(20);
  const [target, setTarget] = useState(80);

  const startId = useId();
  const targetId = useId();

  // DC Fast is the only speed the calculator shows now (see the fieldset
  // below) — the model in lib/charging.ts still carries the other speeds in
  // case a picker comes back, this just fixes the selection to one of them.
  const charger = chargerTypes.find((type) => type.id === 'dc-fast') ?? chargerTypes[2]!;

  const result = useMemo(
    () => ({
      energy: deliveredEnergy(capacity, start, target, charger),
      total: cost(capacity, start, target, charger),
      minutes: chargeMinutes(capacity, start, target, charger),
    }),
    [capacity, start, target, charger],
  );

  // One range, two handles: moving either one pushes the other rather than
  // letting the target fall below the start.
  const onStart = (value: number) => {
    setStart(value);
    if (value > target) setTarget(value);
  };
  const onTarget = (value: number) => {
    setTarget(value);
    if (value < start) setStart(value);
  };

  return (
    <div className="reveal-up grid grid-cols-[1.3fr_1fr] overflow-hidden sm:grid-cols-[1.6fr_1fr] lg:min-h-[571.5px] lg:grid-cols-[1.97fr_1fr]">
      {/* ---------------------------------------------------------- inputs */}
      {/* min-w-0: without it, a grid item defaults to a minimum width of its
          content's min-content size — which, once the battery-capacity row
          below can scroll horizontally, has no natural min-content width of
          its own, letting this column balloon past its 1.3fr/1.6fr/1.97fr
          share and squeeze the summary column instead of actually scrolling. */}
      <div className="flex min-w-0 flex-col gap-6 bg-white p-4 sm:gap-10 sm:p-8 lg:justify-between lg:gap-0 lg:p-14">
        <fieldset>
          <legend className="sr-only">Charger type</legend>
          {/* Only DC Fast is offered — the design dropped the AC Standard /
              AC Fast / DC Ultra tabs entirely rather than defaulting to one
              among several, so there is nothing left here to switch between. */}
          <div className="pb-3">
            <span className="font-display block text-[0.9375rem] leading-tight font-bold tracking-normal text-black sm:text-[1.125rem] sm:leading-[22.5px]">
              {charger.name}
            </span>
            <span className="text-brand-500 mt-1 block text-[0.75rem] leading-4 font-medium sm:text-[0.8125rem]">
              {charger.power} kW
            </span>
          </div>
          <div className="bg-brand-500 h-[2px] w-full rounded-full" />
        </fieldset>

        {/* min-w-0: <fieldset> carries a browser default of min-width:
            min-content, which would otherwise force this column wider than
            its flex share to fit the row below at full, unscrolled width. */}
        <fieldset className="min-w-0">
          <legend className={cn(labelClass, 'mb-3 text-[0.8125rem] sm:text-[0.875rem]')}>Battery Capacity</legend>
          {/* Mobile: one scrollable row — the old 2x2 grid read as stuffed at
              this width. From sm up there's room for the real 4-column grid,
              so the scroll container steps aside for it. */}
          <div className="[&::-webkit-scrollbar]:hidden -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0">
            {batterySizes.map((size) => {
              const active = size.kwh === capacity;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setCapacity(size.kwh)}
                  aria-pressed={active}
                  className={cn(
                    'shrink-0 snap-start rounded-md border px-4 py-2 text-left text-[0.75rem] leading-4 font-medium whitespace-nowrap sm:w-auto sm:shrink sm:whitespace-normal sm:px-3 sm:py-3 sm:text-[0.875rem]',
                    'transition-colors duration-300 ease-[var(--ease-brand)]',
                    active
                      ? 'border-brand-500 bg-brand-500/8 text-brand-500'
                      : 'text-sage-500 hover:border-sage-500/40 border-black/10 bg-white',
                  )}
                >
                  {size.label} ({size.kwh} kWh)
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <div className="flex items-baseline justify-between">
            <span className={cn(labelClass, 'text-[0.8125rem] sm:text-[0.875rem]')}>Charge Range</span>
            <span className="text-[0.75rem] leading-4 sm:text-[0.875rem]">
              <span className="text-sage-500">{start}% &rarr; </span>
              <span className="text-brand-500 font-bold">{target}%</span>
            </span>
          </div>

          {/* Span of the session, drawn across the full 0-100% track. */}
          <div className="relative mt-3 h-8 overflow-hidden rounded-md bg-[#EAF4EE]">
            <div
              className="bg-brand-500/25 absolute inset-y-0 transition-[left,width] duration-300 ease-[var(--ease-brand)]"
              style={{ left: `${start}%`, width: `${Math.max(0, target - start)}%` }}
            />
            <span className="text-sage-500 relative grid h-full place-items-center px-2 text-center text-[0.75rem] leading-4 font-medium sm:text-[0.8125rem]">
              {formatKwh(result.energy)} needed
            </span>
          </div>

          <div className="mt-5 sm:mt-7">
            <div className="flex items-baseline justify-between">
              <label htmlFor={startId} className={cn(labelClass, 'text-[0.8125rem] sm:text-[0.875rem]')}>
                Starting charge
              </label>
              <span className="text-sage-500 text-[0.8125rem] leading-4 font-medium sm:text-[0.875rem]">{start}%</span>
            </div>
            <input
              id={startId}
              type="range"
              min={0}
              max={100}
              step={1}
              value={start}
              onChange={(event) => onStart(Number(event.target.value))}
              className="range-slider mt-3"
              style={{ '--fill': `${start}%` } as React.CSSProperties}
            />
          </div>

          <div className="mt-5 sm:mt-7">
            <div className="flex items-baseline justify-between">
              <label htmlFor={targetId} className={cn(labelClass, 'text-[0.8125rem] sm:text-[0.875rem]')}>
                Target charge
              </label>
              <span className="text-sage-500 text-[0.8125rem] leading-4 font-medium sm:text-[0.875rem]">{target}%</span>
            </div>
            <input
              id={targetId}
              type="range"
              min={0}
              max={100}
              step={1}
              value={target}
              onChange={(event) => onTarget(Number(event.target.value))}
              className="range-slider mt-3"
              style={{ '--fill': `${target}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- summary */}
      <div className="flex flex-col bg-black p-4 sm:p-8 lg:p-14">
        <p className="text-[0.75rem] leading-4 font-medium text-white/70 sm:text-[0.875rem]">Estimated Cost</p>

        <p
          className="font-display text-brand-500 mt-3 text-[1.5rem] leading-none font-bold tabular-nums sm:mt-4 sm:text-[2rem] lg:text-[2.5rem]"
          aria-live="polite"
        >
          {formatRwf(result.total)}
        </p>
        <p className="mt-2 text-[0.6875rem] leading-4 font-medium text-white/70 sm:mt-3 sm:text-[0.875rem]">
          Rwandan Francs
        </p>

        <dl className="mt-5 space-y-3 text-[0.75rem] leading-5 sm:mt-8 sm:space-y-4 sm:text-[0.875rem]">
          <SummaryRow label="Charger" value={`${charger.name} (${charger.power} kW)`} />
          <SummaryRow label="Energy needed" value={formatKwh(result.energy)} />
          <SummaryRow label="Rate" value={`${formatRwf(charger.rate)} RWF/kWh`} />
          <SummaryRow label="Est. time" value={`~${formatDuration(result.minutes)}`} />
        </dl>

        <hr className="mt-5 border-white/15 sm:mt-8" />

        <p className="mt-4 text-[0.6875rem] leading-[1.4] text-white/45 sm:mt-6 sm:text-[0.75rem]">
          Estimates based on standard efficiency. Actual cost may vary by vehicle and conditions.
        </p>

        <Link
          href="/stations"
          className="bg-brand-500 hover:bg-brand-400 mt-6 flex h-11 items-center justify-center gap-2 rounded-[4px] text-[0.8125rem] leading-5 font-bold text-white transition-colors duration-300 ease-[var(--ease-brand)] sm:mt-auto sm:h-12 sm:text-[0.9375rem]"
        >
          See Pricing
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-white/70">{label}</dt>
      <dd className="font-medium text-white tabular-nums sm:text-right">{value}</dd>
    </div>
  );
}
