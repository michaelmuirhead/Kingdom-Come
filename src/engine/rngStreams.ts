/**
 * Per-subsystem RNG streams.
 *
 * Each tick, every subsystem builds its own RNG seeded by the master seed
 * plus a subsystem name plus `monthsPlayed`. That way changing the order
 * of tick subsystems (or inserting new ones) doesn't shift the sequence
 * consumed by unrelated systems — reproducibility holds across refactors
 * as long as the master seed and the months counter agree.
 */

import { createRNG, type RNG } from '@/lib/rng';

export type RngStreamName =
  | 'economy'
  | 'military'
  | 'diplomacy'
  | 'dynasty'
  | 'mortality'
  | 'tech'
  | 'religion'
  | 'politics'
  | 'ideology'
  | 'ai'
  | 'events';

export function createStream(
  masterSeed: string,
  name: RngStreamName,
  monthsPlayed: number,
): RNG {
  return createRNG(`${masterSeed}|${name}|${monthsPlayed}`);
}

export interface StreamFactory {
  (name: RngStreamName): RNG;
}

/**
 * Returns a function that builds RNG streams for the given (seed, month)
 * pair. Pass this around inside a single tick so every subsystem gets a
 * consistent set of independent streams.
 */
export function createStreamFactory(
  masterSeed: string,
  monthsPlayed: number,
): StreamFactory {
  return (name) => createStream(masterSeed, name, monthsPlayed);
}
