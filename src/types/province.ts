import type {
  BuildingId,
  CultureId,
  NationId,
  Position,
  ProvinceId,
  ReligionId,
  TradeGoodId,
  EstateId,
} from './common';

export type TerrainType =
  | 'plains'
  | 'hills'
  | 'mountains'
  | 'forest'
  | 'desert'
  | 'jungle'
  | 'marsh'
  | 'steppe'
  | 'tundra'
  | 'coastal';

export type ClimateType =
  | 'temperate'
  | 'arid'
  | 'tropical'
  | 'mediterranean'
  | 'continental'
  | 'arctic'
  | 'subarctic';

export type FortificationLevel = 0 | 1 | 2 | 3 | 4;

export interface ProvinceDevelopment {
  tax: number;
  production: number;
  manpower: number;
}

export interface ProvinceManpowerPool {
  current: number;
  max: number;
  regenRate: number;
}

export interface Province {
  id: ProvinceId;
  name: string;
  nameByCulture?: Record<CultureId, string>;

  // Geography
  position: Position;
  pathData: string;
  adjacencies: ProvinceId[];
  navalAdjacencies: ProvinceId[];
  regionId: string;
  terrain: TerrainType;
  climate: ClimateType;

  // Development (three sub-stats, 1-30 medieval, 50+ industrial)
  development: ProvinceDevelopment;

  // Demographics
  population: number;
  cultureId: CultureId;
  religionId: ReligionId;

  // Control
  controllerId: NationId;
  occupierId: NationId | null;
  coreNationIds: NationId[];
  claimNationIds: NationId[];

  // Production
  tradeGoodId: TradeGoodId;
  buildings: BuildingId[];
  fortificationLevel: FortificationLevel;

  // Sub-systems
  estateOwnership: Record<EstateId, number>;
  unrest: number;
  culturalInfluencePresent: Record<NationId, number>;
  institutions: Record<string, number>;

  // Active state
  beingDeveloped: boolean;
  beingConverted: boolean;
  conversionTargetReligionId: ReligionId | null;
  promotionTargetCultureId: CultureId | null;
  conversionProgress: number;
  promotionProgress: number;

  // Special flags
  isCapital: boolean;
  isPilgrimageSite: boolean;
  pilgrimageSiteFaith: ReligionId | null;
  isCoastal: boolean;
  navalCapacity: number;

  // Hidden / computed
  manpowerPool: ProvinceManpowerPool;
  monthlyIncome: number;
}
