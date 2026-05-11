import type { GameDate, NationId } from './common';

/**
 * Runtime event queue entry — what the eventQueueStore tracks.
 * Full EventDefinition / EventTrigger / EventEffect schemas live with
 * the event engine in v0.3+; for v0.1 we just need enough state to
 * queue, schedule, and dismiss events.
 */
export interface QueuedEvent {
  id: string;
  eventDefinitionId: string;
  nationId: NationId;
  triggeredDate: GameDate;
  expiresDate?: GameDate;
  contextParams: Record<string, unknown>;
}

export type EventCategory =
  | 'dynasty'
  | 'estate'
  | 'religion'
  | 'diplomacy'
  | 'military'
  | 'economy'
  | 'technology'
  | 'ideology'
  | 'scripted_earthquake'
  | 'flavor';
