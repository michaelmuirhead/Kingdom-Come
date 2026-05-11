import { describe, it, expect } from 'vitest';
import { PROVINCES, PROVINCES_BY_ID } from '@/data/provinces';
import { ProvinceSchema } from '@/data/schemas/province';
import { parsePath } from '@/lib/geometry';

const ALLOWED_CONTROLLERS = new Set([
  'FRA', 'ENG', 'HRE', 'CAS', 'ARA', 'POR',
  'PAP', 'VEN', 'GEN', 'SIC', 'ALM',
]);

describe('provinces data', () => {
  it('contains at least 40 provinces', () => {
    expect(PROVINCES.length).toBeGreaterThanOrEqual(40);
  });

  it('every province validates against the Zod schema', () => {
    for (const p of PROVINCES) {
      const r = ProvinceSchema.safeParse(p);
      if (!r.success) {
        // Surface readable detail in the failure message.
        throw new Error(`${p.id}: ${JSON.stringify(r.error.issues, null, 2)}`);
      }
    }
  });

  it('all province ids are unique', () => {
    const ids = PROVINCES.map((p) => p.id);
    const set = new Set(ids);
    expect(set.size).toBe(ids.length);
  });

  it('adjacencies are bidirectional', () => {
    for (const p of PROVINCES) {
      for (const neighbourId of p.adjacencies) {
        const neighbour = PROVINCES_BY_ID[neighbourId];
        expect(
          neighbour,
          `${p.id} lists ${neighbourId} but ${neighbourId} does not exist`,
        ).toBeDefined();
        expect(
          neighbour!.adjacencies,
          `${neighbourId} should list ${p.id} back`,
        ).toContain(p.id);
      }
    }
  });

  it('naval adjacencies are bidirectional and connect coastal provinces', () => {
    for (const p of PROVINCES) {
      for (const neighbourId of p.navalAdjacencies) {
        const neighbour = PROVINCES_BY_ID[neighbourId];
        expect(neighbour, `${neighbourId} missing`).toBeDefined();
        expect(neighbour!.navalAdjacencies).toContain(p.id);
        expect(p.isCoastal, `${p.id} has naval routes but is not coastal`).toBe(true);
        expect(
          neighbour!.isCoastal,
          `${neighbour!.id} has naval routes but is not coastal`,
        ).toBe(true);
      }
    }
  });

  it('every controller is one of the recognized v0.1 nation tags', () => {
    for (const p of PROVINCES) {
      expect(
        ALLOWED_CONTROLLERS,
        `${p.id} has unknown controller ${p.controllerId}`,
      ).toContain(p.controllerId);
    }
  });

  it('coastal provinces have navalCapacity > 0; inland have 0', () => {
    for (const p of PROVINCES) {
      if (p.isCoastal) {
        expect(p.navalCapacity, `${p.id} coastal`).toBeGreaterThan(0);
      } else {
        expect(p.navalCapacity, `${p.id} inland`).toBe(0);
      }
    }
  });

  it('every pathData parses to a valid polygon inside the viewBox', () => {
    for (const p of PROVINCES) {
      const verts = parsePath(p.pathData);
      expect(verts.length, `${p.id} parsable`).toBeGreaterThanOrEqual(3);
      for (const v of verts) {
        expect(v.x).toBeGreaterThanOrEqual(0);
        expect(v.x).toBeLessThanOrEqual(1000);
        expect(v.y).toBeGreaterThanOrEqual(0);
        expect(v.y).toBeLessThanOrEqual(800);
      }
    }
  });

  it('exactly one capital province exists per controlling nation that has a capital', () => {
    const capitalsByNation = new Map<string, string[]>();
    for (const p of PROVINCES) {
      if (p.isCapital) {
        const list = capitalsByNation.get(p.controllerId) ?? [];
        list.push(p.id);
        capitalsByNation.set(p.controllerId, list);
      }
    }
    for (const [nation, capitals] of capitalsByNation) {
      expect(
        capitals.length,
        `${nation} has ${capitals.length} capitals: ${capitals.join(', ')}`,
      ).toBe(1);
    }
  });

  it('every adjacency reference resolves to a known province', () => {
    for (const p of PROVINCES) {
      for (const n of p.adjacencies) {
        expect(PROVINCES_BY_ID[n], `${p.id} -> ${n}`).toBeDefined();
      }
    }
  });
});
