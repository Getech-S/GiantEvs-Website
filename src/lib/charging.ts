/**
 * Charging cost / time model for the home-page calculator.
 *
 * Kept separate from the UI so the arithmetic can be read and checked on its
 * own. Every number a visitor sees comes from these functions.
 */

export type ChargerType = {
  id: string;
  /** Shown in the tab and in the summary. */
  name: string;
  /** Peak power delivered at the outlet, in kW. */
  power: number;
  /**
   * Tariff in RWF per kWh *delivered by the charger* — public chargers meter at
   * the outlet, not at the battery.
   *
   * PLACEHOLDER RATES: confirm against the real Giant Evs tariff before launch.
   * They live here so a single edit updates the whole calculator.
   */
  rate: number;
  /**
   * DC chargers hold peak power to roughly 80% state of charge and then taper
   * steeply to protect the cells. AC charging is limited by the car's onboard
   * charger and stays flat, so no taper.
   */
  tapers: boolean;
  /**
   * Share of delivered energy that actually reaches the battery. The rest is
   * lost in the cable, the onboard charger/rectifier and thermal management.
   * AC is worse because the car's own AC/DC conversion is in the path.
   */
  efficiency: number;
};

export const chargerTypes: readonly ChargerType[] = [
  { id: 'ac-standard', name: 'AC Standard', power: 7, rate: 250, tapers: false, efficiency: 0.86 },
  { id: 'ac-fast', name: 'AC Fast', power: 22, rate: 300, tapers: false, efficiency: 0.88 },
  { id: 'dc-fast', name: 'DC Fast', power: 50, rate: 380, tapers: true, efficiency: 0.92 },
  { id: 'dc-ultra', name: 'DC Ultra', power: 120, rate: 450, tapers: true, efficiency: 0.93 },
];

export type BatterySize = {
  id: string;
  label: string;
  kwh: number;
};

export const batterySizes: readonly BatterySize[] = [
  { id: 'small', label: 'Small', kwh: 40 },
  { id: 'mid', label: 'Mid', kwh: 60 },
  { id: 'large', label: 'Large', kwh: 75 },
  { id: 'xl', label: 'XL', kwh: 100 },
];

/** SoC above which DC power starts falling away. */
const TAPER_START = 80;
/** Fraction of peak power still available at 100% SoC on a tapering charger. */
const TAPER_FLOOR = 0.2;

/**
 * Fraction of peak power available at a given state of charge.
 * Flat to `TAPER_START`, then falling linearly to `TAPER_FLOOR` at 100%.
 */
export function powerFactor(soc: number, tapers: boolean): number {
  if (!tapers || soc <= TAPER_START) return 1;
  const through = (Math.min(soc, 100) - TAPER_START) / (100 - TAPER_START);
  return 1 - through * (1 - TAPER_FLOOR);
}

/** Energy that has to land *in the battery*, in kWh. */
export function batteryEnergy(capacityKwh: number, startPct: number, targetPct: number): number {
  return Math.max(0, (capacityKwh * (targetPct - startPct)) / 100);
}

/**
 * Energy the charger has to deliver, in kWh — this is what gets metered and
 * billed, and it is larger than what reaches the battery.
 */
export function deliveredEnergy(
  capacityKwh: number,
  startPct: number,
  targetPct: number,
  charger: ChargerType,
): number {
  return batteryEnergy(capacityKwh, startPct, targetPct) / charger.efficiency;
}

export function cost(
  capacityKwh: number,
  startPct: number,
  targetPct: number,
  charger: ChargerType,
): number {
  return deliveredEnergy(capacityKwh, startPct, targetPct, charger) * charger.rate;
}

/**
 * Minutes to move from `startPct` to `targetPct`.
 *
 * Integrated across the state-of-charge range rather than dividing total energy
 * by peak power: on a tapering DC charger the last 20% can take as long as the
 * first 60%, so a flat division badly under-estimates any session that ends
 * near full.
 */
export function chargeMinutes(
  capacityKwh: number,
  startPct: number,
  targetPct: number,
  charger: ChargerType,
): number {
  if (targetPct <= startPct || capacityKwh <= 0) return 0;

  const STEP = 0.25; // % SoC per slice
  const deliveredPerStep = (capacityKwh * STEP) / 100 / charger.efficiency;

  let hours = 0;
  for (let soc = startPct; soc < targetPct; soc += STEP) {
    const slice = Math.min(STEP, targetPct - soc) / STEP;
    hours += (deliveredPerStep * slice) / (charger.power * powerFactor(soc, charger.tapers));
  }

  return hours * 60;
}

/** "1 h 24 min" / "45 min", rounded to the nearest minute. */
export function formatDuration(minutes: number): string {
  const total = Math.round(minutes);
  if (total <= 0) return '0 min';
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

const rwf = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

export function formatRwf(amount: number): string {
  return rwf.format(Math.round(amount));
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}
