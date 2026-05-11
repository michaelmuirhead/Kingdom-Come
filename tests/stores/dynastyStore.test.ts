import { describe, it, expect, beforeEach } from 'vitest';
import { useDynastyStore } from '@/stores/dynastyStore';
import { makeCharacter, makeDynasty } from './fixtures';

describe('dynastyStore', () => {
  beforeEach(() => {
    useDynastyStore.getState().initialize();
  });

  describe('setCharacter / indices', () => {
    it('adds a character and updates indices', () => {
      const c = makeCharacter({ id: 'char_philip_ii' });
      useDynastyStore.getState().setCharacter(c.id, c);

      const s = useDynastyStore.getState();
      expect(s.characters.char_philip_ii?.id).toBe('char_philip_ii');
      expect(s.charactersByNation.FRA).toContain('char_philip_ii');
      expect(s.charactersByDynasty.dyn_default).toContain('char_philip_ii');
      expect(s.livingCharacters).toContain('char_philip_ii');
    });
  });

  describe('killCharacter', () => {
    it('sets deathDate and removes from livingCharacters', () => {
      const c = makeCharacter({ id: 'char_old_king' });
      useDynastyStore.getState().setCharacter(c.id, c);
      const date = { year: 1216, month: 10, day: 18 };
      useDynastyStore.getState().killCharacter('char_old_king', date);

      const s = useDynastyStore.getState();
      expect(s.characters.char_old_king?.deathDate).toEqual(date);
      expect(s.livingCharacters).not.toContain('char_old_king');
    });

    it('is a no-op if already dead', () => {
      const c = makeCharacter({
        id: 'char_dead',
        deathDate: { year: 1180, month: 1, day: 1 },
      });
      useDynastyStore.getState().setCharacter(c.id, c);
      const before = useDynastyStore.getState().characters.char_dead;
      useDynastyStore.getState().killCharacter('char_dead', { year: 1300, month: 1, day: 1 });
      expect(useDynastyStore.getState().characters.char_dead).toBe(before);
    });
  });

  describe('marryCharacters', () => {
    it('updates both characters spouseId fields', () => {
      const a = makeCharacter({ id: 'char_a', gender: 'male' });
      const b = makeCharacter({ id: 'char_b', gender: 'female' });
      useDynastyStore.getState().setCharacter(a.id, a);
      useDynastyStore.getState().setCharacter(b.id, b);

      useDynastyStore.getState().marryCharacters('char_a', 'char_b');

      const s = useDynastyStore.getState();
      expect(s.characters.char_a?.family.spouseId).toBe('char_b');
      expect(s.characters.char_b?.family.spouseId).toBe('char_a');
    });

    it('does nothing when either id is unknown', () => {
      const a = makeCharacter({ id: 'char_only' });
      useDynastyStore.getState().setCharacter(a.id, a);
      useDynastyStore.getState().marryCharacters('char_only', 'char_missing');
      expect(useDynastyStore.getState().characters.char_only?.family.spouseId).toBeNull();
    });
  });

  describe('assignCourtRole', () => {
    it('updates the position.courtRole field', () => {
      const c = makeCharacter({ id: 'char_chancellor_candidate' });
      useDynastyStore.getState().setCharacter(c.id, c);
      useDynastyStore.getState().assignCourtRole('char_chancellor_candidate', 'chancellor');
      expect(
        useDynastyStore.getState().characters.char_chancellor_candidate?.position
          .courtRole,
      ).toBe('chancellor');
    });
  });

  describe('giveTrait', () => {
    it('appends a trait once and only once', () => {
      const c = makeCharacter({ id: 'c' });
      useDynastyStore.getState().setCharacter(c.id, c);
      const date = { year: 1205, month: 5, day: 1 };
      useDynastyStore.getState().giveTrait('c', 'wounded', date);
      useDynastyStore.getState().giveTrait('c', 'wounded', date);
      expect(useDynastyStore.getState().characters.c?.traits).toHaveLength(1);
      expect(useDynastyStore.getState().characters.c?.traits[0]?.traitId).toBe('wounded');
    });
  });

  describe('dynasties', () => {
    it('stores and looks up dynasty entities', () => {
      const d = makeDynasty({ id: 'dyn_capet', name: 'House Capet' });
      useDynastyStore.getState().setDynasty(d.id, d);
      expect(useDynastyStore.getState().dynasties.dyn_capet?.name).toBe('House Capet');
    });
  });

  describe('snapshot / hydrate', () => {
    it('round-trips through JSON and rebuilds indices', () => {
      const c = makeCharacter({ id: 'c1' });
      const d = makeDynasty({ id: 'dyn_default' });
      useDynastyStore.getState().setCharacter(c.id, c);
      useDynastyStore.getState().setDynasty(d.id, d);

      const snap = useDynastyStore.getState().snapshot();
      const restored = JSON.parse(JSON.stringify(snap));

      useDynastyStore.getState().initialize();
      useDynastyStore.getState().hydrate(restored);

      const s = useDynastyStore.getState();
      expect(s.characters.c1?.id).toBe('c1');
      expect(s.dynasties.dyn_default?.id).toBe('dyn_default');
      expect(s.livingCharacters).toContain('c1');
    });
  });
});
