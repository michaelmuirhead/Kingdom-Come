import { describe, it, expect } from 'vitest';
import { resolveSuccession } from '@/engine/dynasty/succession';
import type { Character, CharacterId } from '@/types';
import { makeCharacter } from '../../stores/fixtures';

function withFamily(c: Character, kids: Character[]): Character {
  return {
    ...c,
    family: {
      ...c.family,
      legitimateChildIds: kids.map((k) => k.id),
      childIds: kids.map((k) => k.id),
    },
  };
}

function byId(...chars: Character[]): Readonly<Record<CharacterId, Character>> {
  const m: Record<CharacterId, Character> = {};
  for (const c of chars) m[c.id] = c;
  return m;
}

describe('resolveSuccession', () => {
  describe('salic primogeniture', () => {
    it('eldest legitimate son inherits even with an older daughter', () => {
      const daughter = makeCharacter({
        id: 'daughter',
        gender: 'female',
        birthDate: { year: 1185, month: 1, day: 1 },
      });
      const son = makeCharacter({
        id: 'son',
        gender: 'male',
        birthDate: { year: 1190, month: 1, day: 1 },
      });
      const ruler = withFamily(makeCharacter({ id: 'ruler' }), [
        daughter,
        son,
      ]);

      const result = resolveSuccession({
        ruler,
        successionLaw: 'salic_primogeniture',
        byId: byId(ruler, daughter, son),
      });
      expect(result.heirId).toBe('son');
      expect(result.crisis).toBe(false);
    });

    it('crisis when ruler has only daughters', () => {
      const d1 = makeCharacter({
        id: 'd1',
        gender: 'female',
        birthDate: { year: 1185, month: 1, day: 1 },
      });
      const ruler = withFamily(makeCharacter({ id: 'ruler' }), [d1]);
      const result = resolveSuccession({
        ruler,
        successionLaw: 'salic_primogeniture',
        byId: byId(ruler, d1),
      });
      expect(result.heirId).toBeNull();
      expect(result.crisis).toBe(true);
    });
  });

  describe('absolute primogeniture', () => {
    it('eldest child inherits regardless of gender', () => {
      const daughter = makeCharacter({
        id: 'daughter',
        gender: 'female',
        birthDate: { year: 1185, month: 1, day: 1 },
      });
      const son = makeCharacter({
        id: 'son',
        gender: 'male',
        birthDate: { year: 1190, month: 1, day: 1 },
      });
      const ruler = withFamily(makeCharacter({ id: 'ruler' }), [
        son,
        daughter,
      ]);

      const result = resolveSuccession({
        ruler,
        successionLaw: 'absolute_primogeniture',
        byId: byId(ruler, daughter, son),
      });
      expect(result.heirId).toBe('daughter');
      expect(result.crisis).toBe(false);
    });

    it('crisis when no legitimate children exist', () => {
      const ruler = withFamily(makeCharacter({ id: 'ruler' }), []);
      const result = resolveSuccession({
        ruler,
        successionLaw: 'absolute_primogeniture',
        byId: byId(ruler),
      });
      expect(result.heirId).toBeNull();
      expect(result.crisis).toBe(true);
    });
  });

  describe('primogeniture (male-preferred)', () => {
    it('prefers son to daughter', () => {
      const daughter = makeCharacter({
        id: 'daughter',
        gender: 'female',
        birthDate: { year: 1185, month: 1, day: 1 },
      });
      const son = makeCharacter({
        id: 'son',
        gender: 'male',
        birthDate: { year: 1192, month: 1, day: 1 },
      });
      const ruler = withFamily(makeCharacter({ id: 'ruler' }), [
        daughter,
        son,
      ]);
      const result = resolveSuccession({
        ruler,
        successionLaw: 'primogeniture',
        byId: byId(ruler, daughter, son),
      });
      expect(result.heirId).toBe('son');
    });

    it('falls through to eldest daughter when no sons exist', () => {
      const d1 = makeCharacter({
        id: 'd1',
        gender: 'female',
        birthDate: { year: 1184, month: 1, day: 1 },
      });
      const d2 = makeCharacter({
        id: 'd2',
        gender: 'female',
        birthDate: { year: 1188, month: 1, day: 1 },
      });
      const ruler = withFamily(makeCharacter({ id: 'ruler' }), [d2, d1]);
      const result = resolveSuccession({
        ruler,
        successionLaw: 'primogeniture',
        byId: byId(ruler, d1, d2),
      });
      expect(result.heirId).toBe('d1');
      expect(result.crisis).toBe(false);
    });
  });

  it('skips dead heirs', () => {
    const deadSon = {
      ...makeCharacter({
        id: 'deadson',
        gender: 'male',
        birthDate: { year: 1188, month: 1, day: 1 },
      }),
      deathDate: { year: 1199, month: 5, day: 1 },
    };
    const youngSon = makeCharacter({
      id: 'youngson',
      gender: 'male',
      birthDate: { year: 1195, month: 1, day: 1 },
    });
    const ruler = withFamily(makeCharacter({ id: 'ruler' }), [
      deadSon,
      youngSon,
    ]);
    const result = resolveSuccession({
      ruler,
      successionLaw: 'salic_primogeniture',
      byId: byId(ruler, deadSon, youngSon),
    });
    expect(result.heirId).toBe('youngson');
  });
});
