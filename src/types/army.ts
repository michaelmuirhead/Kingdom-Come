import type {
  ArmyId,
  BattleId,
  CharacterId,
  FleetId,
  GameDate,
  NationId,
  ProvinceId,
  ShipType,
  SiegeId,
  UnitType,
} from './common';

export interface Regiment {
  id: string;
  unitType: UnitType;
  size: number; // 0..1000 (full strength = 1000)
  experience: number; // 0..100
}

export interface Army {
  id: ArmyId;
  nationId: NationId;
  name: string;

  // Composition
  regiments: Regiment[];

  // Location
  provinceId: ProvinceId;
  movementTarget: ProvinceId | null;
  movementProgress: number; // 0..1

  // Leadership
  generalId: CharacterId | null;

  // Status
  morale: number; // 0..100
  organization: number; // 0..100
  attritionMonth: number;
  inBattle: BattleId | null;
  inSiege: SiegeId | null;
  isEmbarked: boolean;
  embarkedOnFleetId: FleetId | null;
}

export interface BattleResult {
  winnerId: NationId;
  attackerCasualties: number;
  defenderCasualties: number;
  generalsKilled: CharacterId[];
  generalsWounded: CharacterId[];
}

export interface Battle {
  id: BattleId;
  provinceId: ProvinceId;
  attackerArmyIds: ArmyId[];
  defenderArmyIds: ArmyId[];
  combatWidth: number;
  startDate: GameDate;
  resolved: boolean;
  result?: BattleResult;
}

export interface Siege {
  id: SiegeId;
  provinceId: ProvinceId;
  besiegingArmyId: ArmyId;
  defendingNationId: NationId;
  garrisonStrength: number;
  fortLevel: number;
  progress: number; // 0..100
  monthsElapsed: number;
  startDate: GameDate;
}

export interface Ship {
  id: string;
  shipType: ShipType;
  isTransport: boolean;
  capacity: number; // regiments if transport
}

export interface Fleet {
  id: FleetId;
  nationId: NationId;
  ships: Ship[];
  seaZoneId: string;
  movementTarget: string | null;
  movementProgress: number;
  admiralId: CharacterId | null;
  morale: number;
  carryingArmyId: ArmyId | null;
}
