/**
 * worldStore — game time, speed, player nation, campaign-wide flags.
 *
 * Small but central. The tick loop reads `speedSetting`/`isPaused` from
 * here; the orchestrator writes `pauseReasons` to surface auto-pause
 * conditions (ruler death, war declaration, urgent events).
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  GameDate,
  NationId,
  PauseReason,
  SpeedSetting,
  WorldFlagValue,
  WorldState,
} from '@/types';
import { advanceMonth as advanceGameDate } from '@/lib/date';

export interface WorldStoreState extends WorldState {
  // Actions
  initialize: (opts: InitializeOpts) => void;
  advanceMonth: () => void;
  setSpeed: (speed: SpeedSetting) => void;
  togglePause: () => void;
  pauseWithReasons: (reasons: PauseReason[]) => void;
  clearPauseReasons: () => void;
  setPlayerNation: (id: NationId) => void;
  setFlag: (key: string, value: WorldFlagValue) => void;
  markScriptedEventFired: (eventId: string) => void;
  // Save/load
  snapshot: () => WorldState;
  hydrate: (state: WorldState) => void;
}

export interface InitializeOpts {
  startDate: GameDate;
  campaignSeed: string;
  playerNationId: NationId;
}

const INITIAL: WorldState = {
  currentDate: { year: 1200, month: 1, day: 1 },
  campaignStartDate: { year: 1200, month: 1, day: 1 },
  speedSetting: 0,
  isPaused: true,
  campaignSeed: '',
  era: 'medieval',
  playerNationId: '',
  flags: {},
  firedScriptedEvents: [],
  pauseReasons: [],
  monthsPlayed: 0,
};

function pureSnapshot(state: WorldState): WorldState {
  return {
    currentDate: { ...state.currentDate },
    campaignStartDate: { ...state.campaignStartDate },
    speedSetting: state.speedSetting,
    isPaused: state.isPaused,
    campaignSeed: state.campaignSeed,
    era: state.era,
    playerNationId: state.playerNationId,
    flags: { ...state.flags },
    firedScriptedEvents: [...state.firedScriptedEvents],
    pauseReasons: state.pauseReasons.map((r) => ({ ...r })),
    monthsPlayed: state.monthsPlayed,
  };
}

export const useWorldStore = create<WorldStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...INITIAL,

      initialize: ({ startDate, campaignSeed, playerNationId }) =>
        set(
          () => ({
            ...INITIAL,
            currentDate: { ...startDate },
            campaignStartDate: { ...startDate },
            campaignSeed,
            playerNationId,
            // Start paused so the player can orient themselves.
            speedSetting: 0,
            isPaused: true,
          }),
          false,
          'world/initialize',
        ),

      advanceMonth: () =>
        set(
          (state) => ({
            currentDate: advanceGameDate(state.currentDate),
            monthsPlayed: state.monthsPlayed + 1,
          }),
          false,
          'world/advanceMonth',
        ),

      setSpeed: (speed) =>
        set(
          () => ({ speedSetting: speed, isPaused: speed === 0 }),
          false,
          'world/setSpeed',
        ),

      togglePause: () =>
        set(
          (state) => ({ isPaused: !state.isPaused }),
          false,
          'world/togglePause',
        ),

      pauseWithReasons: (reasons) =>
        set(
          () => ({ isPaused: true, pauseReasons: reasons }),
          false,
          'world/pauseWithReasons',
        ),

      clearPauseReasons: () =>
        set(() => ({ pauseReasons: [] }), false, 'world/clearPauseReasons'),

      setPlayerNation: (id) =>
        set(() => ({ playerNationId: id }), false, 'world/setPlayerNation'),

      setFlag: (key, value) =>
        set(
          (state) => ({ flags: { ...state.flags, [key]: value } }),
          false,
          'world/setFlag',
        ),

      markScriptedEventFired: (eventId) =>
        set(
          (state) =>
            state.firedScriptedEvents.includes(eventId)
              ? state
              : {
                  firedScriptedEvents: [...state.firedScriptedEvents, eventId],
                },
          false,
          'world/markScriptedEventFired',
        ),

      snapshot: () => pureSnapshot(get()),

      hydrate: (state) =>
        set(() => pureSnapshot(state), false, 'world/hydrate'),
    })),
    { name: 'worldStore' },
  ),
);
