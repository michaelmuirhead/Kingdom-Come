import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { NationDrawer } from '@/components/drawers/NationDrawer';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useUIStore } from '@/stores/uiStore';

describe('NationDrawer', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'nation-drawer-tests' });
  });

  it('renders nothing when the drawer is closed', () => {
    const { container } = render(<NationDrawer />);
    expect(container.querySelector('[data-testid="nation-drawer"]')).toBeNull();
  });

  it('falls back to the player nation when no nation is selected', () => {
    act(() => {
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    const drawer = screen.getByTestId('nation-drawer');
    expect(drawer.textContent).toContain('Kingdom of France');
  });

  it('shows the ruler name and stats', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    const drawer = screen.getByTestId('nation-drawer');
    expect(drawer.textContent).toContain('Philippe');
    expect(drawer.textContent).toContain('Augustus');
    expect(drawer.textContent).toContain('Dip');
  });

  it('renders ideology axis labels', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    const drawer = screen.getByTestId('nation-drawer');
    expect(drawer.textContent).toContain('Militarist');
    expect(drawer.textContent).toContain('Mercantile');
    expect(drawer.textContent).toContain('Theocratic');
  });

  it('switches content when selectedNationId changes', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    expect(screen.getByTestId('nation-drawer').textContent).toContain(
      'Kingdom of France',
    );

    act(() => {
      useUIStore.getState().setSelectedNation('ENG');
    });
    expect(screen.getByTestId('nation-drawer').textContent).toContain(
      'Kingdom of England',
    );
  });

  it('close button closes the drawer', () => {
    act(() => {
      useUIStore.getState().setSelectedNation('FRA');
      useUIStore.getState().setDrawer('nation');
    });
    render(<NationDrawer />);
    act(() => {
      screen.getByTestId('nation-drawer-close').click();
    });
    expect(useUIStore.getState().openDrawer).toBeNull();
  });
});
