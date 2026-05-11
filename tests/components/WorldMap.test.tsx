import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { WorldMap } from '@/components/map/WorldMap';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useProvinceStore } from '@/stores/provinceStore';

describe('WorldMap', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'worldmap-tests' });
  });

  it('renders one <path> per province in the store', () => {
    const { container } = render(<WorldMap />);
    const paths = container.querySelectorAll('path[data-province-id]');
    expect(paths.length).toBe(
      Object.keys(useProvinceStore.getState().provinces).length,
    );
  });

  it('uses the 1000x800 viewBox', () => {
    const { container } = render(<WorldMap />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1000 800');
  });
});
