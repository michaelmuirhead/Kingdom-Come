'use client';

/**
 * SaveLoadDrawer — manual save/load UI.
 *
 * Five manual slots plus the three rotating autosaves plus the
 * emergency-on-ruler-death slot. Each row shows the in-game date,
 * player nation, and savedAt timestamp when populated, "Empty"
 * otherwise. Tap to save (manual slots) or load (any slot with data).
 */

import { useEffect, useState } from 'react';
import { loadGame, listSaves, type SaveSummary } from '@/persistence/loadGame';
import {
  AUTOSAVE_SLOTS,
  EMERGENCY_SLOT,
  MANUAL_SLOTS,
  saveGame,
} from '@/persistence/saveGame';
import { formatDate } from '@/lib/date';
import { useUIStore } from '@/stores/uiStore';
import { DrawerContainer } from './DrawerContainer';

export function SaveLoadDrawer() {
  const open = useUIStore((s) => s.openDrawer === 'save_load');
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const [summaries, setSummaries] = useState<Record<string, SaveSummary>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setError(null);
    const all = await listSaves('');
    const next: Record<string, SaveSummary> = {};
    for (const s of all) next[s.slot] = s;
    setSummaries(next);
  };

  useEffect(() => {
    if (open) {
      refresh().catch((e) => setError(String(e)));
    }
  }, [open]);

  const handleSave = async (slot: string) => {
    setBusy(true);
    setError(null);
    try {
      await saveGame(slot);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = async (slot: string) => {
    setBusy(true);
    setError(null);
    try {
      await loadGame(slot);
      await refresh();
      closeDrawer();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <DrawerContainer
      open={open}
      onClose={closeDrawer}
      title="Save / Load"
      subtitle="5 manual slots plus rotating autosaves"
      testid="save-load-drawer"
    >
      {error ? (
        <div
          data-testid="save-load-error"
          className="mb-3 rounded border border-red-700 bg-red-900/40 px-3 py-2 text-xs text-red-200"
        >
          {error}
        </div>
      ) : null}

      <Section title="Manual slots">
        {MANUAL_SLOTS.map((slot) => (
          <Row
            key={slot}
            label={slot.replace('slot', 'Slot ')}
            summary={summaries[slot]}
            busy={busy}
            onSave={() => handleSave(slot)}
            onLoad={() => handleLoad(slot)}
          />
        ))}
      </Section>

      <Section title="Autosaves">
        {AUTOSAVE_SLOTS.map((slot, idx) => (
          <Row
            key={slot}
            label={`Autosave ${idx + 1}`}
            summary={summaries[slot]}
            busy={busy}
            onLoad={() => handleLoad(slot)}
          />
        ))}
        <Row
          label="Emergency (ruler death)"
          summary={summaries[EMERGENCY_SLOT]}
          busy={busy}
          onLoad={() => handleLoad(EMERGENCY_SLOT)}
        />
      </Section>
    </DrawerContainer>
  );
}

function Row({
  label,
  summary,
  busy,
  onSave,
  onLoad,
}: {
  label: string;
  summary?: SaveSummary;
  busy: boolean;
  onSave?: () => void;
  onLoad: () => void;
}) {
  const hasSave = summary !== undefined;
  return (
    <div
      className="mb-2 flex items-center gap-2 rounded border border-neutral-800 px-3 py-2"
      data-testid={`save-row-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex-1 leading-tight">
        <div className="text-sm font-semibold text-neutral-100">{label}</div>
        {hasSave ? (
          <div className="text-xs text-neutral-400">
            {formatDate(summary.metadata.inGameDate)} · {summary.metadata.playerNationName}
            <span className="ml-2 text-neutral-500">
              saved {new Date(summary.savedAt).toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">Empty</div>
        )}
      </div>
      {onSave ? (
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          data-testid={`save-button-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="flex h-9 items-center rounded border border-neutral-700 px-3 text-xs font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-50"
        >
          Save
        </button>
      ) : null}
      <button
        type="button"
        disabled={!hasSave || busy}
        onClick={onLoad}
        data-testid={`load-button-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="flex h-9 items-center rounded bg-amber-500 px-3 text-xs font-semibold text-neutral-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Load
      </button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      {children}
    </section>
  );
}
