'use client';

/**
 * DeclareWarDialog — confirm a war declaration.
 *
 * Opens when uiStore.openDialog === 'declare_war'. The target nation
 * is the currently selected nation. Confirm calls the declareWar
 * orchestrator and dismisses the dialog; cancel just dismisses.
 *
 * v0.1: only the conquest casus belli is available.
 */

import { Backdrop } from '@/components/shared/Backdrop';
import { declareWar } from '@/engine/orchestrator';
import { useNationStore } from '@/stores/nationStore';
import { useUIStore } from '@/stores/uiStore';
import { useWorldStore } from '@/stores/worldStore';

export function DeclareWarDialog() {
  const open = useUIStore((s) => s.openDialog === 'declare_war');
  const closeDialog = useUIStore((s) => s.closeDialog);
  const playerNationId = useWorldStore((s) => s.playerNationId);
  const targetId = useUIStore((s) => s.selectedNationId);
  const now = useWorldStore((s) => s.currentDate);
  const target = useNationStore((s) =>
    targetId ? s.nations[targetId] : undefined,
  );
  const player = useNationStore((s) => s.nations[playerNationId]);

  if (!open || !target || !player) return null;

  const handleConfirm = () => {
    declareWar({
      attackerNationId: playerNationId,
      defenderNationId: target.id,
      casusBelli: 'conquest',
      now,
    });
    closeDialog();
  };

  return (
    <Backdrop onDismiss={closeDialog} testid="declare-war-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Declare war"
        data-testid="declare-war-dialog"
        className="m-4 w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-950 p-4 text-neutral-100 shadow-2xl sm:m-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">Declare War on {target.name}?</h2>
        <p className="mt-2 text-sm text-neutral-300">
          {player.name} will declare war on {target.name} with a casus belli
          of <span className="font-mono text-amber-400">Conquest</span>. Both
          nations' opinions will drop by 50.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            data-testid="declare-war-cancel"
            onClick={closeDialog}
            className="flex h-11 items-center rounded px-4 text-sm font-semibold text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="declare-war-confirm"
            onClick={handleConfirm}
            className="flex h-11 items-center rounded bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500"
          >
            Declare War
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
