import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.getState().initialize();
  });

  describe('initialize', () => {
    it('starts on the political map mode, paused / unselected', () => {
      const s = useUIStore.getState();
      expect(s.currentMapMode).toBe('political');
      expect(s.selectedProvinceId).toBeNull();
      expect(s.selectedNationId).toBeNull();
      expect(s.selectedCharacterId).toBeNull();
      expect(s.openDrawer).toBeNull();
      expect(s.openDialog).toBeNull();
      expect(s.cameraZoom).toBe(1);
    });
  });

  describe('selections', () => {
    it('setSelectedProvince updates state', () => {
      useUIStore.getState().setSelectedProvince('prov_normandy');
      expect(useUIStore.getState().selectedProvinceId).toBe('prov_normandy');
    });

    it('setSelectedNation updates state', () => {
      useUIStore.getState().setSelectedNation('FRA');
      expect(useUIStore.getState().selectedNationId).toBe('FRA');
    });

    it('setSelectedCharacter updates state', () => {
      useUIStore.getState().setSelectedCharacter('char_philip_ii');
      expect(useUIStore.getState().selectedCharacterId).toBe('char_philip_ii');
    });

    it('setSelectedArmy updates state', () => {
      useUIStore.getState().setSelectedArmy('army_42');
      expect(useUIStore.getState().selectedArmyId).toBe('army_42');
    });

    it('clearSelections nulls every selection', () => {
      const ui = useUIStore.getState();
      ui.setSelectedProvince('p');
      ui.setSelectedNation('n');
      ui.setSelectedCharacter('c');
      ui.setSelectedArmy('a');
      ui.clearSelections();
      const s = useUIStore.getState();
      expect(s.selectedProvinceId).toBeNull();
      expect(s.selectedNationId).toBeNull();
      expect(s.selectedCharacterId).toBeNull();
      expect(s.selectedArmyId).toBeNull();
    });
  });

  describe('drawers and dialogs', () => {
    it('setDrawer opens, closeDrawer closes', () => {
      useUIStore.getState().setDrawer('province');
      expect(useUIStore.getState().openDrawer).toBe('province');
      useUIStore.getState().closeDrawer();
      expect(useUIStore.getState().openDrawer).toBeNull();
    });

    it('setDialog opens, closeDialog closes', () => {
      useUIStore.getState().setDialog('declare_war');
      expect(useUIStore.getState().openDialog).toBe('declare_war');
      useUIStore.getState().closeDialog();
      expect(useUIStore.getState().openDialog).toBeNull();
    });

    it('setActiveEventDialog toggles the active event id', () => {
      useUIStore.getState().setActiveEventDialog('estate_demand_1');
      expect(useUIStore.getState().activeEventDialog).toBe('estate_demand_1');
      useUIStore.getState().setActiveEventDialog(null);
      expect(useUIStore.getState().activeEventDialog).toBeNull();
    });
  });

  describe('map mode', () => {
    it('setMapMode swaps modes', () => {
      useUIStore.getState().setMapMode('religion');
      expect(useUIStore.getState().currentMapMode).toBe('religion');
      useUIStore.getState().setMapMode('terrain');
      expect(useUIStore.getState().currentMapMode).toBe('terrain');
    });
  });

  describe('camera', () => {
    it('setCamera updates center and clamps zoom', () => {
      useUIStore.getState().setCamera({ x: 100, y: 200 }, 3);
      expect(useUIStore.getState().cameraCenter).toEqual({ x: 100, y: 200 });
      expect(useUIStore.getState().cameraZoom).toBe(3);
    });

    it('clamps zoom to [0.5, 5]', () => {
      useUIStore.getState().setZoom(10);
      expect(useUIStore.getState().cameraZoom).toBe(5);
      useUIStore.getState().setZoom(0.1);
      expect(useUIStore.getState().cameraZoom).toBe(0.5);
    });

    it('panCamera adds to the current center', () => {
      useUIStore.getState().setCamera({ x: 100, y: 100 }, 1);
      useUIStore.getState().panCamera(50, -25);
      expect(useUIStore.getState().cameraCenter).toEqual({ x: 150, y: 75 });
    });
  });

  describe('ledger', () => {
    it('setShowLedger + setLedgerTab update the ledger state', () => {
      useUIStore.getState().setShowLedger(true);
      useUIStore.getState().setLedgerTab('economy');
      expect(useUIStore.getState().showLedger).toBe(true);
      expect(useUIStore.getState().ledgerTab).toBe('economy');
    });
  });
});
