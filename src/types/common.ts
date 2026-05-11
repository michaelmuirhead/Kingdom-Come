/**
 * Shared primitive and ID types used across every domain.
 *
 * Stub string-alias IDs (CultureId, ReligionId, TraitId, etc.) intentionally
 * stay as `string` for v0.1 — their full schemas land in v0.3+ when the
 * corresponding systems get implemented.
 */

// Entity IDs — branded-ish string aliases for readability only. They remain
// assignable to/from plain strings; runtime validation lives in Zod schemas.
export type EntityId = string;
export type NationId = EntityId;
export type ProvinceId = EntityId;
export type CharacterId = EntityId;
export type ArmyId = EntityId;
export type FleetId = EntityId;
export type BattleId = EntityId;
export type SiegeId = EntityId;
export type DynastyId = EntityId;
export type TreatyId = EntityId;
export type WarId = EntityId;

// Content-layer string IDs — stubs for v0.1, real schemas later.
export type CultureId = string;
export type ReligionId = string;
export type TraitId = string;
export type BuildingId = string;
export type TradeGoodId = string;
export type ArchetypeId = string;
export type EstateId = string;
export type UnitType = string;
export type ShipType = string;
export type PartyId = string;

// In-game calendar.
export interface GameDate {
  year: number; // 1200-1900 for canonical campaign range
  month: number; // 1-12
  day: number; // 1-30 (simplified — no leap years, no length variance)
}

// World era — highest era reached by any major nation drives the global era.
export type Era = 'medieval' | 'renaissance' | 'early_modern' | 'industrial';

// 2D position on the SVG map (viewBox coordinates).
export interface Position {
  x: number;
  y: number;
}
