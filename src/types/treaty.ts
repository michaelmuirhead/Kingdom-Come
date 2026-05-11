import type {
  CharacterId,
  GameDate,
  NationId,
  TreatyId,
} from './common';

export type TreatyType =
  | 'alliance'
  | 'royal_marriage'
  | 'guarantee'
  | 'non_aggression'
  | 'embargo'
  | 'tributary'
  | 'vassalage'
  | 'subsidy';

export interface TreatyTerms {
  marriageCharacterIds?: [CharacterId, CharacterId];
  tributeAmount?: number;
  embargoTarget?: NationId;
  // Additional term types added as treaty mechanics deepen post-v0.1.
}

export interface Treaty {
  id: TreatyId;
  type: TreatyType;
  signedDate: GameDate;
  expiresDate: GameDate | null;
  signatoryIds: NationId[];
  terms: TreatyTerms;
  broken: boolean;
}

export interface OpinionModifier {
  source: string; // e.g. "Royal Marriage", "Broke Treaty"
  value: number;
  expiresDate: GameDate | null;
  appliedDate: GameDate;
}

export interface OpinionEntry {
  fromNationId: NationId;
  toNationId: NationId;
  value: number; // -200..+200
  modifiers: OpinionModifier[];
}
