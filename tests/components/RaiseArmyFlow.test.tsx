import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { NationDrawer } from '@/components/drawers/NationDrawer';
import { ArmySelector } from '@/components/hud/ArmySelector';
import { raiseArmy } from '@/engine/orchestrator';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useMilitaryStore, useUIStore } from '@/stores';

describe('Raise army UI + ArmySelector', () => {
  beforeEach(() => {
    startNewCampaign({
      playerNationTag: 'FRA',
      seed: 'raise-army-ui-tests',
    });
  });

  it('player NationDrawer shows the raise-army button', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    expect(screen.getByTestId('raise-army-button')).toBeDefined();
  });

  it('foreign NationDrawer hides the raise-army button', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('ENG');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    expect(screen.queryByTestId('raise-army-button')).toBeNull();
  });

  it('clicking the raise-army button creates an army in militaryStore', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    expect(Object.keys(useMilitaryStore.getState().armies).length).toBe(0);
    act(() => {
      screen.getByTestId('raise-army-button').click();
    });
    expect(Object.keys(useMilitaryStore.getState().armies).length).toBe(1);
  });

  it('ArmySelector appears when an army is selected', () => {
    const armyId = raiseArmy({ nationId: 'FRA', regimentCount: 2 });
    act(() => {
      useUIStore.getState().setSelectedArmy(armyId);
    });
    render(<ArmySelector />);
    expect(screen.getByTestId('army-selector')).toBeDefined();
  });

  it('ArmySelector cancel button deselects the army', () => {
    const armyId = raiseArmy({ nationId: 'FRA', regimentCount: 2 });
    act(() => {
      useUIStore.getState().setSelectedArmy(armyId);
    });
    render(<ArmySelector />);
    act(() => {
      screen.getByTestId('army-selector-cancel').click();
    });
    expect(useUIStore.getState().selectedArmyId).toBeNull();
  });
});
