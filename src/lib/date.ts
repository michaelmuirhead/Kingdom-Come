/**
 * In-game calendar math.
 *
 * The game runs on a simplified calendar: 12 months/year, fixed 30-day
 * months at most (`day` exists for finer-grained events like siege rolls
 * but isn't tracked deeply in v0.1). `advanceMonth` and `addMonths`
 * preserve the day; rollover follows standard month/year carry rules.
 */

import type { GameDate } from '@/types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Total month index since year 0, used internally for normalization. */
function toMonthIndex(date: GameDate): number {
  return date.year * 12 + (date.month - 1);
}

function fromMonthIndex(idx: number, day: number): GameDate {
  // Math.floor handles negative correctly (so subtracting months below
  // year 0 still rolls correctly).
  const year = Math.floor(idx / 12);
  const month = idx - year * 12 + 1;
  return { year, month, day };
}

export function advanceMonth(date: GameDate): GameDate {
  return addMonths(date, 1);
}

export function addMonths(date: GameDate, months: number): GameDate {
  return fromMonthIndex(toMonthIndex(date) + months, date.day);
}

/**
 * Months between two dates, signed: positive when `b` is after `a`.
 * Day-of-month is ignored — we only care about the month grain.
 */
export function monthsBetween(a: GameDate, b: GameDate): number {
  return toMonthIndex(b) - toMonthIndex(a);
}

export function compareDates(a: GameDate, b: GameDate): -1 | 0 | 1 {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

export function formatDate(date: GameDate): string {
  const idx = date.month - 1;
  const name =
    idx >= 0 && idx < MONTH_NAMES.length ? MONTH_NAMES[idx] : 'Unknown';
  return `${name} ${date.year}`;
}
