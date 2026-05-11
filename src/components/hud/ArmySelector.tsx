'use client';

/**
 * ArmySelector — floating HUD panel shown when an army is selected.
 *
 * Floats above the map (centred at the bottom). Surfaces the army's
 * name, current location, total strength, and a "Cancel" button that
 * deselects. Tapping a province on the map orders the selected army
 * to move there (handled by WorldMap / Province).
 */

import { useMilitaryStore } from '@/stores/militaryStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';

export function ArmySelector() {
  const armyId = useUIStore((s) => s.selectedArmyId);
  const army = useMilitaryStore((s) =>
    armyId ? s.armies[armyId] : undefined,
  );
  const provinceName = useProvinceStore((s) =>
    army ? s.provinces[army.provinceId]?.name ?? army.provinceId : '',
  );
  const setSelectedArmy = useUIStore((s) => s.setSelectedArmy);

  if (!army) return null;
  const size = army.regiments.reduce((s, r) => s + r.size, 0);

  return (
    <div
      data-testid="army-selector"
      className="pointer-events-auto fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-950/90 px-4 py-2 text-sm text-neutral-100 shadow-xl backdrop-blur"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col leading-tight">
          <span className="font-semibold">{army.name}</span>
          <span className="text-xs text-neutral-400">
            {provinceName} · {size.toLocaleString()} men
          </span>
        </div>
        <span className="text-xs text-amber-400">
          Tap a province to march
        </span>
        <button
          type="button"
          data-testid="army-selector-cancel"
          onClick={() => setSelectedArmy(null)}
          className="flex h-9 items-center rounded border border-neutral-700 px-3 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
