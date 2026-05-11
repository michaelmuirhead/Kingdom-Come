import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ProvinceComponent } from '@/components/map/Province';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useProvinceStore } from '@/stores/provinceStore';
import { useNationStore } from '@/stores/nationStore';
import { useUIStore } from '@/stores/uiStore';

function renderProvince(id: string) {
  return render(
    <svg viewBox="0 0 1000 800" data-testid="svg">
      <ProvinceComponent provinceId={id} />
    </svg>,
  );
}

describe('ProvinceComponent', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'province-tests' });
    useUIStore.getState().initialize();
  });

  it('renders a <path> with the controller flag color', () => {
    renderProvince('prov_ile_de_france');
    const svg = screen.getByTestId('svg');
    const path = svg.querySelector(
      '[data-province-id="prov_ile_de_france"]',
    ) as SVGPathElement | null;
    expect(path).not.toBeNull();
    // FRA flag color from /src/data/nations.ts
    expect(path!.getAttribute('fill')).toBe('#4070d0');
  });

  it('renders nothing when the province does not exist', () => {
    const { container } = renderProvince('prov_nonexistent');
    expect(container.querySelector('path')).toBeNull();
  });

  it('clicking sets uiStore.selectedProvinceId', () => {
    renderProvince('prov_normandy');
    const path = document.querySelector(
      '[data-province-id="prov_normandy"]',
    ) as SVGPathElement;
    act(() => {
      path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(useUIStore.getState().selectedProvinceId).toBe('prov_normandy');
  });

  it('shows a thicker white stroke when selected', () => {
    renderProvince('prov_ile_de_france');
    act(() => {
      useUIStore.getState().setSelectedProvince('prov_ile_de_france');
    });
    const path = document.querySelector(
      '[data-province-id="prov_ile_de_france"]',
    ) as SVGPathElement;
    expect(path.getAttribute('stroke')).toBe('#ffffff');
    expect(path.getAttribute('stroke-width')).toBe('3');
  });

  it('keeps its rendered output stable when an unrelated province changes', () => {
    renderProvince('prov_normandy');
    const before = (
      document.querySelector(
        '[data-province-id="prov_normandy"]',
      ) as SVGPathElement
    ).outerHTML;

    act(() => {
      useProvinceStore
        .getState()
        .updateDevelopment('prov_castile', { tax: 999 });
    });

    const after = (
      document.querySelector(
        '[data-province-id="prov_normandy"]',
      ) as SVGPathElement
    ).outerHTML;
    expect(after).toBe(before);
  });

  it('updates its fill when its own controller flag color changes', () => {
    renderProvince('prov_ile_de_france');
    expect(
      (
        document.querySelector(
          '[data-province-id="prov_ile_de_france"]',
        ) as SVGPathElement
      ).getAttribute('fill'),
    ).toBe('#4070d0');

    act(() => {
      const fra = useNationStore.getState().nations.FRA;
      if (fra) {
        useNationStore
          .getState()
          .setNation('FRA', { ...fra, flagColor: '#abcdef' });
      }
    });

    expect(
      (
        document.querySelector(
          '[data-province-id="prov_ile_de_france"]',
        ) as SVGPathElement
      ).getAttribute('fill'),
    ).toBe('#abcdef');
  });
});
