/**
 * Zod schema for Province content files. Mirrors the TypeScript
 * `Province` type in `@/types`. Used by tests and the runtime content
 * loader to validate every authored province at load time.
 */

import { z } from 'zod';

const TerrainTypeSchema = z.enum([
  'plains',
  'hills',
  'mountains',
  'forest',
  'desert',
  'jungle',
  'marsh',
  'steppe',
  'tundra',
  'coastal',
]);

const ClimateTypeSchema = z.enum([
  'temperate',
  'arid',
  'tropical',
  'mediterranean',
  'continental',
  'arctic',
  'subarctic',
]);

const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const DevelopmentSchema = z.object({
  tax: z.number().min(0),
  production: z.number().min(0),
  manpower: z.number().min(0),
});

const ManpowerPoolSchema = z.object({
  current: z.number().min(0),
  max: z.number().min(0),
  regenRate: z.number().min(0),
});

const FortLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const ProvinceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameByCulture: z.record(z.string(), z.string()).optional(),

  position: PositionSchema,
  pathData: z.string().min(1),
  adjacencies: z.array(z.string()),
  navalAdjacencies: z.array(z.string()),
  regionId: z.string().min(1),
  terrain: TerrainTypeSchema,
  climate: ClimateTypeSchema,

  development: DevelopmentSchema,

  population: z.number().min(0),
  cultureId: z.string().min(1),
  religionId: z.string().min(1),

  controllerId: z.string().min(1),
  occupierId: z.string().min(1).nullable(),
  coreNationIds: z.array(z.string()),
  claimNationIds: z.array(z.string()),

  tradeGoodId: z.string().min(1),
  buildings: z.array(z.string()),
  fortificationLevel: FortLevelSchema,

  estateOwnership: z.record(z.string(), z.number()),
  unrest: z.number().min(0).max(10),
  culturalInfluencePresent: z.record(z.string(), z.number()),
  institutions: z.record(z.string(), z.number().min(0).max(1)),

  beingDeveloped: z.boolean(),
  beingConverted: z.boolean(),
  conversionTargetReligionId: z.string().nullable(),
  promotionTargetCultureId: z.string().nullable(),
  conversionProgress: z.number().min(0).max(1),
  promotionProgress: z.number().min(0).max(1),

  isCapital: z.boolean(),
  isPilgrimageSite: z.boolean(),
  pilgrimageSiteFaith: z.string().nullable(),
  isCoastal: z.boolean(),
  navalCapacity: z.number().min(0),

  manpowerPool: ManpowerPoolSchema,
  monthlyIncome: z.number(),
});

export type ProvinceSchemaType = z.infer<typeof ProvinceSchema>;
