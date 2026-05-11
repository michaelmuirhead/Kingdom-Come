import { describe, it, expect } from 'vitest';
import type { GameDate } from '@/types';
import {
  addMonths,
  advanceMonth,
  compareDates,
  formatDate,
  monthsBetween,
} from '@/lib/date';

const d = (year: number, month: number, day = 1): GameDate => ({
  year,
  month,
  day,
});

describe('advanceMonth', () => {
  it('advances by one month in the middle of a year', () => {
    expect(advanceMonth(d(1200, 5))).toEqual(d(1200, 6));
  });

  it('rolls December → January and increments the year', () => {
    expect(advanceMonth(d(1200, 12))).toEqual(d(1201, 1));
  });

  it('preserves the day of month', () => {
    expect(advanceMonth(d(1200, 3, 15))).toEqual(d(1200, 4, 15));
  });
});

describe('addMonths', () => {
  it('adds across multiple year boundaries', () => {
    expect(addMonths(d(1200, 1), 25)).toEqual(d(1202, 2));
  });

  it('subtracts months going backwards', () => {
    expect(addMonths(d(1200, 1), -1)).toEqual(d(1199, 12));
    expect(addMonths(d(1200, 1), -13)).toEqual(d(1198, 12));
  });

  it('returns the same date when adding zero', () => {
    expect(addMonths(d(1234, 6, 7), 0)).toEqual(d(1234, 6, 7));
  });
});

describe('monthsBetween', () => {
  it('returns 0 for identical dates', () => {
    expect(monthsBetween(d(1200, 1), d(1200, 1))).toBe(0);
  });

  it('is positive when b is after a', () => {
    expect(monthsBetween(d(1200, 1), d(1200, 6))).toBe(5);
    expect(monthsBetween(d(1200, 12), d(1201, 1))).toBe(1);
  });

  it('is negative when b is before a', () => {
    expect(monthsBetween(d(1201, 1), d(1200, 12))).toBe(-1);
  });

  it('handles multi-year spans', () => {
    expect(monthsBetween(d(1200, 1), d(1210, 1))).toBe(120);
  });
});

describe('compareDates', () => {
  it('orders by year first, then month, then day', () => {
    expect(compareDates(d(1200, 1), d(1201, 1))).toBe(-1);
    expect(compareDates(d(1200, 1), d(1200, 2))).toBe(-1);
    expect(compareDates(d(1200, 1, 1), d(1200, 1, 2))).toBe(-1);
    expect(compareDates(d(1200, 1, 1), d(1200, 1, 1))).toBe(0);
    expect(compareDates(d(1201, 1), d(1200, 12))).toBe(1);
  });
});

describe('formatDate', () => {
  it('produces "Month Year"', () => {
    expect(formatDate(d(1230, 3))).toBe('March 1230');
    expect(formatDate(d(1200, 1))).toBe('January 1200');
    expect(formatDate(d(1789, 7))).toBe('July 1789');
  });
});
