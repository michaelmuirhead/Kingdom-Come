import { describe, it, expect } from 'vitest';
import {
  CHARACTERS,
  CHARACTERS_BY_ID,
  DYNASTIES,
  DYNASTIES_BY_ID,
} from '@/data/characters';
import { NATIONS, NATIONS_BY_ID } from '@/data/nations';
import { PROVINCES_BY_ID } from '@/data/provinces';
import {
  CharacterSchema,
  DynastySchema,
} from '@/data/schemas/character';

describe('characters data', () => {
  it('includes at least 18 characters per roadmap target', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(18);
  });

  it('every character validates against the Zod schema', () => {
    for (const c of CHARACTERS) {
      const r = CharacterSchema.safeParse(c);
      if (!r.success) {
        throw new Error(`${c.id}: ${JSON.stringify(r.error.issues, null, 2)}`);
      }
    }
  });

  it('every dynasty validates against the Zod schema', () => {
    for (const d of DYNASTIES) {
      const r = DynastySchema.safeParse(d);
      if (!r.success) {
        throw new Error(`${d.id}: ${JSON.stringify(r.error.issues, null, 2)}`);
      }
    }
  });

  it('every character id and dynasty id is unique', () => {
    const cIds = CHARACTERS.map((c) => c.id);
    expect(new Set(cIds).size).toBe(cIds.length);
    const dIds = DYNASTIES.map((d) => d.id);
    expect(new Set(dIds).size).toBe(dIds.length);
  });

  it('every character dynastyId resolves to a real dynasty', () => {
    for (const c of CHARACTERS) {
      expect(
        DYNASTIES_BY_ID[c.dynastyId],
        `${c.id} → ${c.dynastyId}`,
      ).toBeDefined();
    }
  });

  it('every family reference resolves to a real character', () => {
    for (const c of CHARACTERS) {
      const all = [
        c.family.fatherId,
        c.family.motherId,
        c.family.spouseId,
        ...c.family.exSpouseIds,
        ...c.family.childIds,
        ...c.family.legitimateChildIds,
        ...c.family.bastardIds,
        ...c.family.siblingIds,
      ].filter((id): id is string => id !== null);
      for (const refId of all) {
        expect(
          CHARACTERS_BY_ID[refId],
          `${c.id} family ref ${refId} unknown`,
        ).toBeDefined();
      }
    }
  });

  it('spouseIds are symmetric (A.spouse=B → B.spouse=A)', () => {
    for (const c of CHARACTERS) {
      if (!c.family.spouseId) continue;
      const partner = CHARACTERS_BY_ID[c.family.spouseId];
      expect(partner, `${c.id} -> ${c.family.spouseId}`).toBeDefined();
      expect(partner!.family.spouseId, `${partner!.id}.spouse`).toBe(c.id);
    }
  });

  it('every locationProvinceId resolves to a real province', () => {
    for (const c of CHARACTERS) {
      expect(
        PROVINCES_BY_ID[c.position.locationProvinceId],
        `${c.id} -> ${c.position.locationProvinceId}`,
      ).toBeDefined();
    }
  });

  it('every character nationId is null or a real nation', () => {
    for (const c of CHARACTERS) {
      if (c.position.nationId === null) continue;
      expect(
        NATIONS_BY_ID[c.position.nationId],
        `${c.id} -> ${c.position.nationId}`,
      ).toBeDefined();
    }
  });

  it('every nation rulerId resolves to a real character', () => {
    for (const n of NATIONS) {
      expect(
        CHARACTERS_BY_ID[n.rulerId],
        `${n.id} ruler ${n.rulerId} unknown`,
      ).toBeDefined();
    }
  });

  it('every nation dynastyId resolves to a real dynasty', () => {
    for (const n of NATIONS) {
      expect(
        DYNASTIES_BY_ID[n.dynastyId],
        `${n.id} dynasty ${n.dynastyId} unknown`,
      ).toBeDefined();
    }
  });

  it('plot-armoured rulers have an expiry strictly after 1200', () => {
    for (const c of CHARACTERS) {
      if (!c.health.plotArmor) continue;
      expect(c.health.plotArmorExpires, `${c.id}`).toBeDefined();
      const exp = c.health.plotArmorExpires!;
      expect(exp.year, `${c.id}`).toBeGreaterThanOrEqual(1200);
    }
  });

  it('stats are in [0, 25]', () => {
    for (const c of CHARACTERS) {
      for (const [k, v] of Object.entries(c.stats)) {
        expect(v, `${c.id}.${k}`).toBeGreaterThanOrEqual(0);
        expect(v, `${c.id}.${k}`).toBeLessThanOrEqual(25);
      }
    }
  });

  it('birthDate is at or before 1200/1/1', () => {
    for (const c of CHARACTERS) {
      expect(c.birthDate.year, c.id).toBeLessThanOrEqual(1200);
    }
  });

  it('parent/child references are reciprocal (sampling parents)', () => {
    for (const c of CHARACTERS) {
      const father = c.family.fatherId
        ? CHARACTERS_BY_ID[c.family.fatherId]
        : undefined;
      if (father) {
        expect(
          father.family.childIds.includes(c.id) ||
            father.family.legitimateChildIds.includes(c.id),
          `${c.id} father ${father.id} should list ${c.id} as a child`,
        ).toBe(true);
      }
      const mother = c.family.motherId
        ? CHARACTERS_BY_ID[c.family.motherId]
        : undefined;
      if (mother) {
        expect(
          mother.family.childIds.includes(c.id) ||
            mother.family.legitimateChildIds.includes(c.id),
          `${c.id} mother ${mother.id} should list ${c.id} as a child`,
        ).toBe(true);
      }
    }
  });

  it('every claimed province / nation reference is a known entity', () => {
    for (const c of CHARACTERS) {
      for (const pid of c.heldClaimProvinceIds) {
        expect(PROVINCES_BY_ID[pid], `${c.id} claim ${pid}`).toBeDefined();
      }
      for (const nid of [
        ...c.heldClaimNationIds,
        ...c.inheritanceClaimNationIds,
      ]) {
        expect(NATIONS_BY_ID[nid], `${c.id} claim ${nid}`).toBeDefined();
      }
    }
  });
});
