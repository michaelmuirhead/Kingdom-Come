import type {
  ArchetypeId,
  CharacterId,
  CultureId,
  DynastyId,
  Era,
  EstateId,
  GameDate,
  NationId,
  ProvinceId,
  ReligionId,
} from './common';

export type GovernmentType =
  | 'feudal_monarchy'
  | 'merchant_republic'
  | 'theocracy'
  | 'tribal_federation'
  | 'imperial_bureaucratic'
  | 'caliphate'
  | 'sultanate'
  | 'administrative_monarchy'
  | 'absolute_monarchy'
  | 'constitutional_monarchy'
  | 'parliamentary_republic'
  | 'revolutionary_republic'
  | 'industrial_empire'
  | 'cosmopolitan_empire'
  | 'reactionary_empire'
  | 'hermit_kingdom'
  | 'confederation'
  | 'shogunate'
  | 'mandala_kingdom'
  | 'maritime_sultanate'
  | 'sahel_empire';

export type SuccessionLaw =
  | 'confederate_partition'
  | 'elective'
  | 'salic_primogeniture'
  | 'primogeniture'
  | 'seniority'
  | 'tanistry'
  | 'absolute_primogeniture';

export interface IdeologyVector {
  militaristPacifist: number;
  mercantileAgrarian: number;
  theocraticSecular: number;
  openIsolationist: number;
  aristocraticPopulist: number;
  traditionalProgressive: number;
  centralistFederalist: number;
}

export interface IdeologyDriftEntry {
  date: GameDate;
  vector: IdeologyVector;
  archetypeId: ArchetypeId;
  reason?: string;
}

export type AmbitionType =
  | 'territorial'
  | 'religious'
  | 'economic'
  | 'dynastic'
  | 'cultural';

export interface Ambition {
  id: string;
  type: AmbitionType;
  description: string;
  targetProvinceIds?: ProvinceId[];
  targetNationId?: NationId;
  targetReligionId?: ReligionId;
  progress: number; // 0..1
  startedDate: GameDate;
  weight: number;
}

export interface IncomeBreakdown {
  tax: number;
  trade: number;
  production: number;
  tariffs: number;
  tribute: number;
  total: number;
}

export interface ExpenseBreakdown {
  armyUpkeep: number;
  navyUpkeep: number;
  buildingConstruction: number;
  courtCosts: number;
  loanInterest: number;
  subsidies: number;
  total: number;
}

// Cached AI personality profile. Real shape lands when /engine/ai exists in v0.2+.
export type PersonalityProfile = Record<string, number>;

// Tech tree ids are kept as a string union here so Nation.techLevels has a
// stable key set even before /engine/tech exists.
export type TechTreeId =
  | 'admin'
  | 'military'
  | 'diplomatic'
  | 'cultural'
  | 'religious';

export interface Nation {
  id: NationId;
  name: string;
  nameByEra?: Partial<Record<Era, string>>;
  tag: string;

  // Identity
  cultureId: CultureId;
  primaryReligionId: ReligionId;
  governmentType: GovernmentType;
  archetypeId: ArchetypeId;
  flagColor: string;

  // Ruler & dynasty
  rulerId: CharacterId;
  dynastyId: DynastyId;
  successionLaw: SuccessionLaw;

  // Treasury & resources
  treasury: number;
  manpower: number;
  maxManpower: number;
  prestige: number;
  legitimacy: number;

  // Tech & institutions
  techLevels: Record<TechTreeId, number>;
  embracedInstitutions: string[];

  // Ideology
  ideologyVector: IdeologyVector;
  ideologyHistory: IdeologyDriftEntry[];

  // Diplomatic
  ambitions: Ambition[];
  rivals: NationId[];
  interests: string[];

  // Reputation
  honor: number;
  diplomaticReputation: number;
  aggressiveExpansion: number;
  threat: number;

  // Status
  stability: number;
  religiousUnity: number;
  culturalUnity: number;
  toleranceScore: number;

  // Era / Great Power
  greatPowerRank: number | null;

  // Estates active in this nation
  activeEstateIds: EstateId[];

  // Cultural Influence
  culturalInfluenceScore: number;

  // Religious authority claims held
  defenderOfFaithFor: ReligionId | null;
  caliphateClaim: boolean;
  thirdRomeClaim: boolean;

  // Cached computed fields (refresh tick) — populated by economy engine; safe
  // to leave at zeros in v0.1 content.
  cachedIncome: IncomeBreakdown;
  cachedExpenses: ExpenseBreakdown;
  cachedNetMonthly: number;

  // AI personality (cached, refresh monthly). null until first AI tick.
  cachedPersonality: PersonalityProfile | null;
}

// Minimal Dynasty entity. Full shape (claims, prestige, members) lands when
// the dynasty engine grows past v0.1's basic succession.
export interface Dynasty {
  id: DynastyId;
  name: string;
  cultureId: CultureId;
  foundingDate: GameDate;
  foundingCharacterId: CharacterId;
}
