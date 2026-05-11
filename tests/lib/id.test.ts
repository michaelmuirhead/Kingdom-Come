import { describe, it, expect } from 'vitest';
import { generateId } from '@/lib/id';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('produces 10 000 unique IDs', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      seen.add(generateId());
    }
    expect(seen.size).toBe(10_000);
  });

  it('prefixes correctly when a prefix is provided', () => {
    const id = generateId('char');
    expect(id.startsWith('char_')).toBe(true);
    expect(id.length).toBeGreaterThan('char_'.length);
  });

  it('returns distinct values for prefixed and unprefixed calls', () => {
    const a = generateId('army');
    const b = generateId('army');
    expect(a).not.toBe(b);
  });
});
