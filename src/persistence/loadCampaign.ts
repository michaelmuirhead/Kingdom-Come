/**
 * Campaign initializer. Validates content (loudly in dev, warning in
 * prod), resets every store, then bulk-loads provinces / nations /
 * characters / dynasties and primes the world clock.
 */

import {
  useDynastyStore,
  useEventQueueStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
  useDiplomacyStore,
  useMilitaryStore,
} from '@/stores';
import type {
  Character,
  Dynasty,
  GameDate,
  Nation,
  Province,
} from '@/types';
import {
  loadContent,
  validateContent,
  type ContentBundle,
  type ValidationReport,
} from './contentLoader';

export interface StartCampaignOpts {
  playerNationTag: string;
  seed?: string;
  startDate?: GameDate;
}

export interface CampaignSummary {
  playerNationId: string;
  seed: string;
  startDate: GameDate;
  provinceCount: number;
  nationCount: number;
  characterCount: number;
  validation: ValidationReport;
}

const DEFAULT_START: GameDate = { year: 1200, month: 1, day: 1 };

function randomSeed(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Fallback for ancient runtimes; not security-sensitive.
  return `seed-${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffff).toString(36)}`;
}

function recordById<T extends { id: string }>(
  items: readonly T[],
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const it of items) out[it.id] = it;
  return out;
}

/**
 * Start a fresh campaign. Idempotent — calling it again wipes every
 * store and reloads from authored content with a (possibly new) seed.
 */
export function startNewCampaign(opts: StartCampaignOpts): CampaignSummary {
  const startDate = opts.startDate ?? DEFAULT_START;
  const seed = opts.seed ?? randomSeed();

  // 1. Validate content. In dev, throw on issues so authoring mistakes
  //    surface immediately; in prod, warn so the player still gets a
  //    playable session.
  const bundle = loadContent();
  const report = validateContent(bundle);
  if (!report.ok) {
    const summary = report.issues
      .slice(0, 10)
      .map((i) => `  - [${i.kind}] ${i.entityId}: ${i.message}`)
      .join('\n');
    const message = `Content validation failed (${report.issues.length} issue${
      report.issues.length === 1 ? '' : 's'
    }):\n${summary}`;
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(message);
    }
    // eslint-disable-next-line no-console
    console.warn(message);
  }

  const playerNation = bundle.nations.find(
    (n) => n.tag === opts.playerNationTag || n.id === opts.playerNationTag,
  );
  if (!playerNation) {
    throw new Error(
      `Unknown player nation tag: ${opts.playerNationTag}. Known tags: ${bundle.nations
        .map((n) => n.tag)
        .join(', ')}`,
    );
  }

  // 2. Reset every store to a known empty state.
  useProvinceStore.getState().initialize();
  useNationStore.getState().initialize();
  useDynastyStore.getState().initialize();
  useMilitaryStore.getState().initialize();
  useDiplomacyStore.getState().initialize();
  useEventQueueStore.getState().initialize();

  // 3. Bulk-load authored content into the appropriate stores.
  useProvinceStore.getState().bulkSet(recordById<Province>(bundle.provinces));
  useNationStore.getState().bulkSet(recordById<Nation>(bundle.nations));
  useDynastyStore
    .getState()
    .bulkSetCharacters(recordById<Character>(bundle.characters));
  useDynastyStore
    .getState()
    .bulkSetDynasties(recordById<Dynasty>(bundle.dynasties));

  // 4. Prime the world clock — start date, paused, seeded RNG identity,
  //    chosen player nation.
  useWorldStore.getState().initialize({
    startDate,
    campaignSeed: seed,
    playerNationId: playerNation.id,
  });

  return {
    playerNationId: playerNation.id,
    seed,
    startDate,
    provinceCount: bundle.provinces.length,
    nationCount: bundle.nations.length,
    characterCount: bundle.characters.length,
    validation: report,
  };
}

/**
 * Re-export for convenience — most callers want both this and the
 * validator together.
 */
export { loadContent, validateContent };
export type { ContentBundle, ValidationReport };
