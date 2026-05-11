import type {
  CharacterId,
  CultureId,
  DynastyId,
  GameDate,
  NationId,
  ProvinceId,
  ReligionId,
  TraitId,
} from './common';

export interface CharacterStats {
  diplomacy: number;
  stewardship: number;
  martial: number;
  intrigue: number;
  learning: number;
  piety: number;
}

export type CharacterTraitSource =
  | 'born'
  | 'inherited'
  | 'educated'
  | 'event'
  | 'genetic';

export interface CharacterTrait {
  traitId: TraitId;
  source: CharacterTraitSource;
  acquiredDate: GameDate;
}

export interface HealthCondition {
  conditionId: string; // "smallpox", "wounded", "plague", etc.
  severity: number; // 0..1
  acquiredDate: GameDate;
  expectedDuration?: number; // months
}

export interface CharacterHealth {
  current: number; // 0..100
  max: number;
  conditions: HealthCondition[];
  plotArmor: boolean;
  plotArmorExpires?: GameDate;
}

export interface CharacterFertility {
  base: number;
  modifiers: number;
  sterile: boolean;
}

export interface CharacterFamily {
  fatherId: CharacterId | null;
  motherId: CharacterId | null;
  spouseId: CharacterId | null;
  exSpouseIds: CharacterId[];
  childIds: CharacterId[];
  legitimateChildIds: CharacterId[];
  bastardIds: CharacterId[];
  siblingIds: CharacterId[];
}

export interface CharacterGeneticPool {
  commonAncestorIds: CharacterId[];
  consanguinityScore: number;
}

export type CourtRole =
  | 'chancellor'
  | 'marshal'
  | 'spymaster'
  | 'steward'
  | 'court_chaplain'
  | 'court_physician'
  | 'court_intellectual';

export type FieldRole = 'general' | 'admiral' | 'governor';

export type EducationFocus =
  | 'martial'
  | 'stewardship'
  | 'intrigue'
  | 'diplomatic'
  | 'learning'
  | 'piety';

export type IntellectualSpecialty =
  | 'theologian'
  | 'astronomer'
  | 'philosopher'
  | 'poet'
  | 'mathematician'
  | 'engineer'
  | 'historian';

export interface CharacterPosition {
  locationProvinceId: ProvinceId;
  title: string;
  courtRole: CourtRole | null;
  fieldRole: FieldRole | null;
  nationId: NationId | null;
}

export interface Character {
  id: CharacterId;
  dynastyId: DynastyId;
  cultureId: CultureId;
  religionId: ReligionId;

  // Names
  givenName: string;
  dynastyName: string;
  nickname?: string;

  // Lifespan
  birthDate: GameDate;
  deathDate: GameDate | null;
  gender: 'male' | 'female';

  // Stats (0-25)
  stats: CharacterStats;
  statsHiddenUntilAge: number;

  // Traits
  traits: CharacterTrait[];

  // Health
  health: CharacterHealth;

  // Fertility
  fertility: CharacterFertility;

  // Family relationships
  family: CharacterFamily;

  // Genetic background
  geneticPool: CharacterGeneticPool;

  // Position in the world
  position: CharacterPosition;

  // Claims
  heldClaimNationIds: NationId[];
  heldClaimProvinceIds: ProvinceId[];
  inheritanceClaimNationIds: NationId[];

  // Status
  prestige: number;
  pietyScore: number;
  plotsInvolvedIn: string[];

  // Education
  educationFocus: EducationFocus | null;
  educationComplete: boolean;
  tutorId: CharacterId | null;

  // Regency
  regentForId: CharacterId | null;
  isRegent: boolean;

  // Marriage status
  marriagesProposedByMe: CharacterId[];
  marriagesProposedToMe: CharacterId[];

  // Special intellectuals
  intellectualSpecialty?: IntellectualSpecialty;
}
