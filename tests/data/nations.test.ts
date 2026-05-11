import { describe, it, expect } from 'vitest';
import { NATIONS, NATIONS_BY_ID } from '@/data/nations';
import { PROVINCES } from '@/data/provinces';
import { NationSchema } from '@/data/schemas/nation';

describe('nations data', () => {
  it('includes at least the 10 roadmap-recommended nations', () => {
    const ids = new Set(NATIONS.map((n) => n.id));
    for (const tag of ['FRA', 'ENG', 'HRE', 'CAS', 'ARA', 'POR', 'PAP', 'VEN', 'GEN', 'SIC']) {
      expect(ids, `missing ${tag}`).toContain(tag);
    }
  });

  it('every nation validates against the Zod schema', () => {
    for (const n of NATIONS) {
      const r = NationSchema.safeParse(n);
      if (!r.success) {
        throw new Error(`${n.id}: ${JSON.stringify(r.error.issues, null, 2)}`);
      }
    }
  });

  it('every nation id is unique', () => {
    const ids = NATIONS.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every tag is unique and matches the id (v0.1 convention)', () => {
    const tags = NATIONS.map((n) => n.tag);
    expect(new Set(tags).size).toBe(tags.length);
    for (const n of NATIONS) {
      expect(n.tag).toBe(n.id);
    }
  });

  it('flag colors are valid 6-digit hex', () => {
    for (const n of NATIONS) {
      expect(n.flagColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('starting treasury sits in [100, 300] gold per acceptance criteria', () => {
    for (const n of NATIONS) {
      expect(n.treasury, `${n.id} treasury ${n.treasury}`).toBeGreaterThanOrEqual(100);
      expect(n.treasury, `${n.id} treasury ${n.treasury}`).toBeLessThanOrEqual(300);
    }
  });

  it('manpower starts at or below the cap', () => {
    for (const n of NATIONS) {
      expect(n.manpower, n.id).toBeLessThanOrEqual(n.maxManpower);
    }
  });

  it('every nation has at least one ambition with a non-zero weight', () => {
    for (const n of NATIONS) {
      expect(n.ambitions.length, n.id).toBeGreaterThanOrEqual(1);
      for (const a of n.ambitions) {
        expect(a.weight, `${n.id} ambition ${a.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('rivals reference real nations and are never self-rivals', () => {
    for (const n of NATIONS) {
      for (const r of n.rivals) {
        expect(NATIONS_BY_ID[r], `${n.id} rival ${r} unknown`).toBeDefined();
        expect(r).not.toBe(n.id);
      }
    }
  });

  it('every province controllerId resolves to a real nation', () => {
    for (const p of PROVINCES) {
      expect(
        NATIONS_BY_ID[p.controllerId],
        `province ${p.id} → unknown controller ${p.controllerId}`,
      ).toBeDefined();
    }
  });

  it('every province claim references a real nation', () => {
    for (const p of PROVINCES) {
      for (const claimId of p.claimNationIds) {
        expect(
          NATIONS_BY_ID[claimId],
          `${p.id} claim ${claimId} unknown`,
        ).toBeDefined();
      }
    }
  });

  it('every ambition province target references a real province', () => {
    const provinceIds = new Set(PROVINCES.map((p) => p.id));
    for (const n of NATIONS) {
      for (const a of n.ambitions) {
        if (!a.targetProvinceIds) continue;
        for (const pid of a.targetProvinceIds) {
          expect(provinceIds, `${n.id}.${a.id} → ${pid}`).toContain(pid);
        }
      }
    }
  });

  it('every nation owns at least one province', () => {
    const owners = new Set(PROVINCES.map((p) => p.controllerId));
    for (const n of NATIONS) {
      expect(owners, `${n.id} owns nothing`).toContain(n.id);
    }
  });

  it('ideology axes stay within [-100, +100]', () => {
    for (const n of NATIONS) {
      for (const [axis, value] of Object.entries(n.ideologyVector)) {
        expect(value, `${n.id}.${axis}`).toBeGreaterThanOrEqual(-100);
        expect(value, `${n.id}.${axis}`).toBeLessThanOrEqual(100);
      }
    }
  });
});
