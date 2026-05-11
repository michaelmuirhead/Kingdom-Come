import type {
  BattleId,
  GameDate,
  NationId,
  ProvinceId,
  SiegeId,
  WarId,
} from './common';

export type CasusBelliType =
  | 'conquest'
  | 'reconquest'
  | 'holy_war'
  | 'imperial_reclamation'
  | 'trade_war'
  | 'vassalization'
  | 'humiliate'
  | 'independence'
  | 'succession'
  | 'reduce_threat'
  | 'doctrinal_reclamation'
  | 'heresy_suppression'
  | 'religious_civil_war'
  | 'crusade'
  | 'no_cb';

export type WarGoalType =
  | 'annex_province'
  | 'annex_provinces'
  | 'vassalize'
  | 'force_religion'
  | 'force_culture'
  | 'humiliate'
  | 'transfer_throne'
  | 'force_treaty_break';

export interface WarGoal {
  id: string;
  type: WarGoalType;
  targetProvinceId?: ProvinceId;
  targetNationId?: NationId;
  achieved: boolean;
  tickingValue?: number;
}

export interface OccupiedProvinceEntry {
  provinceId: ProvinceId;
  occupierId: NationId;
  occupiedSince: GameDate;
}

export interface WarLeaders {
  attacker: NationId;
  defender: NationId;
}

export interface War {
  id: WarId;
  name: string;
  startDate: GameDate;
  endDate: GameDate | null;

  attackers: NationId[];
  defenders: NationId[];
  warLeader: WarLeaders;

  warGoals: WarGoal[];
  casusBelli: CasusBelliType;

  warScore: number; // -100..+100 (positive = attacker winning)

  battlesIds: BattleId[];
  siegesIds: SiegeId[];

  occupiedProvinces: OccupiedProvinceEntry[];
}
