import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { DeclareWarDialog } from '@/components/dialogs/DeclareWarDialog';
import { NationDrawer } from '@/components/drawers/NationDrawer';
import { ProvinceDrawer } from '@/components/drawers/ProvinceDrawer';
import { declareWar } from '@/engine/orchestrator';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useMilitaryStore, useUIStore, useWorldStore } from '@/stores';

function Mount() {
  return (
    <>
      <ProvinceDrawer />
      <NationDrawer />
      <DeclareWarDialog />
    </>
  );
}

describe('declare-war UI flow', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'declare-war-ui' });
  });

  it('foreign nation drawer shows a Declare War button', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('ENG');
      useUIStore.getState().setDrawer('nation');
    });
    render(<Mount />);
    expect(screen.getByTestId('declare-war-button')).toBeDefined();
  });

  it('player nation drawer does NOT show a Declare War button', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<Mount />);
    expect(screen.queryByTestId('declare-war-button')).toBeNull();
  });

  it('clicking the button opens the dialog; confirm calls declareWar', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('ENG');
      useUIStore.getState().setDrawer('nation');
    });
    render(<Mount />);
    act(() => {
      screen.getByTestId('declare-war-button').click();
    });
    expect(useUIStore.getState().openDialog).toBe('declare_war');

    act(() => {
      screen.getByTestId('declare-war-confirm').click();
    });
    // Dialog dismissed, war exists.
    expect(useUIStore.getState().openDialog).toBeNull();
    const wars = Object.values(useMilitaryStore.getState().wars);
    expect(wars.length).toBe(1);
    expect(wars[0]?.attackers).toEqual(['FRA']);
    expect(wars[0]?.defenders).toEqual(['ENG']);
  });

  it('cancel button closes the dialog without declaring war', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('ENG');
      useUIStore.getState().setDrawer('nation');
    });
    render(<Mount />);
    act(() => {
      screen.getByTestId('declare-war-button').click();
    });
    act(() => {
      screen.getByTestId('declare-war-cancel').click();
    });
    expect(useUIStore.getState().openDialog).toBeNull();
    expect(Object.values(useMilitaryStore.getState().wars).length).toBe(0);
  });

  it('once at war, the button is replaced with an At War banner', () => {
    declareWar({
      attackerNationId: 'FRA',
      defenderNationId: 'ENG',
      casusBelli: 'conquest',
      now: useWorldStore.getState().currentDate,
    });
    act(() => {
      useUIStore.getState().setSelectedNation('ENG');
      useUIStore.getState().setDrawer('nation');
    });
    render(<Mount />);
    expect(screen.queryByTestId('declare-war-button')).toBeNull();
    expect(screen.getByTestId('nation-drawer-at-war')).toBeDefined();
  });

  it('ProvinceDrawer "View owner" pivots to the NationDrawer for that nation', () => {
    act(() => {
      useUIStore.getState().setSelectedProvince('prov_normandy'); // ENG-held
      useUIStore.getState().setDrawer('province');
    });
    render(<Mount />);
    act(() => {
      screen.getByTestId('view-owner-button').click();
    });
    expect(useUIStore.getState().openDrawer).toBe('nation');
    expect(useUIStore.getState().selectedNationId).toBe('ENG');
  });
});
