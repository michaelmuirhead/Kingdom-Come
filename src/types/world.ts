import type { Era, GameDate, NationId } from './common';

export type SpeedSetting = 0 | 1 | 2 | 3 | 4 | 5;

export type PauseReasonType =
  | 'ruler_death'
  | 'war_declaration'
  | 'event_decision'
  | 'manual';

export interface PauseReason {
  type: PauseReasonType;
  priority: number;
  message?: string;
}

export type WorldFlagValue = boolean | number | string;

export interface WorldState {
  currentDate: GameDate;
  speedSetting: SpeedSetting; // 0 = paused
  isPaused: boolean;

  campaignSeed: string;
  campaignStartDate: GameDate;

  era: Era;

  playerNationId: NationId;

  // Global flags for one-off campaign state without dedicated stores.
  flags: Record<string, WorldFlagValue>;

  // Scripted earthquake / one-shot event IDs already fired.
  firedScriptedEvents: string[];

  // Why the game is currently paused (cleared on resume).
  pauseReasons: PauseReason[];

  // Tracking
  monthsPlayed: number;
}
