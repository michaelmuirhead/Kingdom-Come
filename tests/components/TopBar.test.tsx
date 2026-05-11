import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { TopBar } from '@/components/hud/TopBar';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useNationStore } from '@/stores/nationStore';
import { useUIStore } from '@/stores/uiStore';
import { useWorldStore } from '@/stores/worldStore';

describe('TopBar', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'topbar-tests' });
  });

  it('renders the current in-game date', () => {
    render(<TopBar />);
    expect(screen.getByTestId('current-date').textContent).toBe('January 1200');

    // Advance two months — display should update reactively.
    act(() => {
      useWorldStore.getState().advanceMonth();
      useWorldStore.getState().advanceMonth();
    });
    expect(screen.getByTestId('current-date').textContent).toBe('March 1200');
  });

  it('renders the player nation banner with its flag color', () => {
    render(<TopBar />);
    const banner = screen.getByTestId('nation-banner');
    expect(banner.textContent).toContain('Kingdom of France');
    const swatch = banner.querySelector('span[aria-hidden="true"]');
    expect((swatch as HTMLElement | null)?.style.backgroundColor).toBe(
      'rgb(64, 112, 208)', // #4070d0
    );
  });

  it('tapping the nation banner opens the nation drawer', () => {
    render(<TopBar />);
    act(() => {
      screen.getByTestId('nation-banner').click();
    });
    expect(useUIStore.getState().openDrawer).toBe('nation');
  });

  it('speed buttons set worldStore.speedSetting and unpause', () => {
    render(<TopBar />);
    expect(useWorldStore.getState().speedSetting).toBe(0);
    expect(useWorldStore.getState().isPaused).toBe(true);

    act(() => {
      screen.getByTestId('speed-3').click();
    });
    expect(useWorldStore.getState().speedSetting).toBe(3);
    expect(useWorldStore.getState().isPaused).toBe(false);
  });

  it('the active speed button is aria-pressed', () => {
    render(<TopBar />);
    act(() => {
      screen.getByTestId('speed-4').click();
    });
    expect(screen.getByTestId('speed-4').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('speed-1').getAttribute('aria-pressed')).toBe('false');
  });

  it('pause toggle flips isPaused', () => {
    render(<TopBar />);
    act(() => {
      screen.getByTestId('speed-3').click();
    });
    expect(useWorldStore.getState().isPaused).toBe(false);

    act(() => {
      screen.getByTestId('pause-toggle').click();
    });
    expect(useWorldStore.getState().isPaused).toBe(true);
  });

  it('resource display reacts to treasury changes', () => {
    render(<TopBar />);
    const before = screen.getByTestId('stat-treasury').textContent ?? '';
    expect(before).toContain('250'); // FRA starts at 250 gold

    act(() => {
      useNationStore.getState().updateTreasury('FRA', 500);
    });
    const after = screen.getByTestId('stat-treasury').textContent ?? '';
    expect(after).toContain('750');
  });

  it('all tap targets meet the 44px minimum (h-11 class)', () => {
    render(<TopBar />);
    const targets = [
      screen.getByTestId('pause-toggle'),
      screen.getByTestId('speed-1'),
      screen.getByTestId('speed-5'),
      screen.getByTestId('nation-banner'),
    ];
    for (const t of targets) {
      expect(t.className).toMatch(/h-11/);
    }
  });
});
