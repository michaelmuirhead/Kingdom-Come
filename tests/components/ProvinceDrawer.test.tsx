import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ProvinceDrawer } from '@/components/drawers/ProvinceDrawer';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';

describe('ProvinceDrawer', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'drawer-tests' });
  });

  it('renders nothing when the drawer is closed', () => {
    const { container } = render(<ProvinceDrawer />);
    expect(container.querySelector('[data-testid="province-drawer"]')).toBeNull();
  });

  it('renders nothing when no province is selected', () => {
    act(() => {
      useUIStore.getState().setDrawer('province');
    });
    const { container } = render(<ProvinceDrawer />);
    expect(container.querySelector('[data-testid="province-drawer"]')).toBeNull();
  });

  it('renders province details when open and selected', () => {
    act(() => {
      useUIStore.getState().setSelectedProvince('prov_normandy');
      useUIStore.getState().setDrawer('province');
    });
    render(<ProvinceDrawer />);
    const drawer = screen.getByTestId('province-drawer');
    expect(drawer.textContent).toContain('Normandy');
    expect(drawer.textContent).toContain('Kingdom of England'); // owner
    expect(drawer.textContent).toContain('norman'); // culture
    expect(drawer.textContent).toContain('catholic'); // religion
  });

  it('close button closes the drawer', () => {
    act(() => {
      useUIStore.getState().setSelectedProvince('prov_normandy');
      useUIStore.getState().setDrawer('province');
    });
    render(<ProvinceDrawer />);
    act(() => {
      screen.getByTestId('province-drawer-close').click();
    });
    expect(useUIStore.getState().openDrawer).toBeNull();
  });

  it('backdrop click closes the drawer', () => {
    act(() => {
      useUIStore.getState().setSelectedProvince('prov_normandy');
      useUIStore.getState().setDrawer('province');
    });
    render(<ProvinceDrawer />);
    act(() => {
      screen.getByTestId('province-drawer-backdrop').click();
    });
    expect(useUIStore.getState().openDrawer).toBeNull();
  });

  it('surfaces occupation status in the subtitle when occupied', () => {
    act(() => {
      useProvinceStore.getState().updateOccupation('prov_normandy', 'FRA');
      useUIStore.getState().setSelectedProvince('prov_normandy');
      useUIStore.getState().setDrawer('province');
    });
    render(<ProvinceDrawer />);
    const drawer = screen.getByTestId('province-drawer');
    expect(drawer.textContent).toMatch(/occupied by Kingdom of France/i);
  });
});
