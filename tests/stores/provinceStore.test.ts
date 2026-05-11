import { describe, it, expect, beforeEach } from 'vitest';
import { useProvinceStore } from '@/stores/provinceStore';
import { makeProvince } from './fixtures';

describe('provinceStore', () => {
  beforeEach(() => {
    useProvinceStore.getState().initialize();
  });

  describe('setProvince', () => {
    it('adds a province and updates indices', () => {
      const p = makeProvince({ id: 'prov_normandy', controllerId: 'FRA' });
      useProvinceStore.getState().setProvince(p.id, p);

      const s = useProvinceStore.getState();
      expect(s.provinces.prov_normandy).toBe(p);
      expect(s.provincesByNation.FRA).toContain('prov_normandy');
      expect(s.provincesByRegion.western_europe).toContain('prov_normandy');
      expect(s.provincesByCulture.frankish).toContain('prov_normandy');
      expect(s.provincesByReligion.catholic).toContain('prov_normandy');
    });
  });

  describe('bulkSet', () => {
    it('replaces all provinces and rebuilds indices', () => {
      const p1 = makeProvince({ id: 'p1', controllerId: 'FRA' });
      const p2 = makeProvince({ id: 'p2', controllerId: 'ENG' });
      useProvinceStore.getState().bulkSet({ p1, p2 });

      const s = useProvinceStore.getState();
      expect(Object.keys(s.provinces)).toEqual(['p1', 'p2']);
      expect(s.provincesByNation.FRA).toEqual(['p1']);
      expect(s.provincesByNation.ENG).toEqual(['p2']);
    });
  });

  describe('updateOwnership', () => {
    it('moves the province between nation indices', () => {
      const p = makeProvince({ id: 'prov_aquitaine', controllerId: 'FRA' });
      useProvinceStore.getState().setProvince(p.id, p);

      useProvinceStore.getState().updateOwnership('prov_aquitaine', 'ENG');

      const s = useProvinceStore.getState();
      expect(s.provinces.prov_aquitaine?.controllerId).toBe('ENG');
      expect(s.provincesByNation.FRA ?? []).not.toContain('prov_aquitaine');
      expect(s.provincesByNation.ENG).toContain('prov_aquitaine');
    });

    it('is a no-op when ownership does not change', () => {
      const p = makeProvince({ id: 'p', controllerId: 'FRA' });
      useProvinceStore.getState().setProvince(p.id, p);
      const before = useProvinceStore.getState().provinces.p;
      useProvinceStore.getState().updateOwnership('p', 'FRA');
      expect(useProvinceStore.getState().provinces.p).toBe(before);
    });
  });

  describe('updateOccupation', () => {
    it('sets occupierId without touching the controller', () => {
      const p = makeProvince({ id: 'p', controllerId: 'FRA' });
      useProvinceStore.getState().setProvince(p.id, p);

      useProvinceStore.getState().updateOccupation('p', 'ENG');
      expect(useProvinceStore.getState().provinces.p?.occupierId).toBe('ENG');
      expect(useProvinceStore.getState().provinces.p?.controllerId).toBe('FRA');

      useProvinceStore.getState().updateOccupation('p', null);
      expect(useProvinceStore.getState().provinces.p?.occupierId).toBeNull();
    });
  });

  describe('addBuilding / removeBuilding', () => {
    it('appends without duplicating', () => {
      const p = makeProvince({ id: 'p' });
      useProvinceStore.getState().setProvince(p.id, p);
      useProvinceStore.getState().addBuilding('p', 'market');
      useProvinceStore.getState().addBuilding('p', 'market'); // duplicate
      expect(useProvinceStore.getState().provinces.p?.buildings).toEqual([
        'market',
      ]);
    });

    it('removeBuilding filters the array', () => {
      const p = makeProvince({ id: 'p', buildings: ['market', 'temple'] });
      useProvinceStore.getState().setProvince(p.id, p);
      useProvinceStore.getState().removeBuilding('p', 'market');
      expect(useProvinceStore.getState().provinces.p?.buildings).toEqual([
        'temple',
      ]);
    });
  });

  describe('updateDevelopment', () => {
    it('patches only the specified sub-stats', () => {
      const p = makeProvince({
        id: 'p',
        development: { tax: 5, production: 6, manpower: 7 },
      });
      useProvinceStore.getState().setProvince(p.id, p);
      useProvinceStore.getState().updateDevelopment('p', { tax: 10 });
      expect(useProvinceStore.getState().provinces.p?.development).toEqual({
        tax: 10,
        production: 6,
        manpower: 7,
      });
    });
  });

  describe('startConversion', () => {
    it('begins conversion when given a target religion', () => {
      const p = makeProvince({ id: 'p', religionId: 'catholic' });
      useProvinceStore.getState().setProvince(p.id, p);
      useProvinceStore.getState().startConversion('p', 'sunni');
      const s = useProvinceStore.getState().provinces.p;
      expect(s?.beingConverted).toBe(true);
      expect(s?.conversionTargetReligionId).toBe('sunni');
    });

    it('clears conversion when given null', () => {
      const p = makeProvince({
        id: 'p',
        beingConverted: true,
        conversionTargetReligionId: 'sunni',
        conversionProgress: 0.4,
      });
      useProvinceStore.getState().setProvince(p.id, p);
      useProvinceStore.getState().startConversion('p', null);
      const s = useProvinceStore.getState().provinces.p;
      expect(s?.beingConverted).toBe(false);
      expect(s?.conversionTargetReligionId).toBeNull();
      expect(s?.conversionProgress).toBe(0);
    });
  });

  describe('snapshot / hydrate', () => {
    it('round-trips through JSON', () => {
      const p1 = makeProvince({ id: 'p1', controllerId: 'FRA' });
      const p2 = makeProvince({ id: 'p2', controllerId: 'ENG' });
      useProvinceStore.getState().bulkSet({ p1, p2 });

      const snap = useProvinceStore.getState().snapshot();
      const restored = JSON.parse(JSON.stringify(snap));

      useProvinceStore.getState().initialize();
      useProvinceStore.getState().hydrate(restored);

      const s = useProvinceStore.getState();
      expect(Object.keys(s.provinces).sort()).toEqual(['p1', 'p2']);
      expect(s.provincesByNation.FRA).toEqual(['p1']);
      expect(s.provincesByNation.ENG).toEqual(['p2']);
    });
  });
});
