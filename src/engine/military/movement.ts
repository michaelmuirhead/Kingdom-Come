/**
 * Army movement math for v0.1.
 *
 * Terrain determines how many months it takes to cross a province:
 *   plains / coastal / marsh / steppe / tundra / desert : 1 month
 *   hills / forest / jungle                             : 2 months
 *   mountains                                           : 3 months
 *
 * Movement progress accumulates at 1 / monthsRequired per tick. When
 * progress reaches 1, the army arrives and movementTarget clears.
 */

import type { Army, ProvinceId, TerrainType } from '@/types';

export function monthsToCross(terrain: TerrainType): number {
  switch (terrain) {
    case 'mountains':
      return 3;
    case 'hills':
    case 'forest':
    case 'jungle':
      return 2;
    case 'plains':
    case 'coastal':
    case 'marsh':
    case 'steppe':
    case 'tundra':
    case 'desert':
    default:
      return 1;
  }
}

export interface MovementResult {
  army: Army;
  arrived: boolean;
}

export function advanceMovement(
  army: Army,
  targetTerrain: TerrainType,
): MovementResult {
  if (army.movementTarget === null) {
    return { army, arrived: false };
  }
  const months = monthsToCross(targetTerrain);
  const step = 1 / months;
  const nextProgress = army.movementProgress + step;
  if (nextProgress >= 1) {
    const arrivedAt: ProvinceId = army.movementTarget;
    return {
      army: {
        ...army,
        provinceId: arrivedAt,
        movementTarget: null,
        movementProgress: 0,
      },
      arrived: true,
    };
  }
  return {
    army: { ...army, movementProgress: nextProgress },
    arrived: false,
  };
}
