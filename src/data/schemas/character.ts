/**
 * Zod schema for Character content files. Mirrors the TypeScript
 * `Character` type. Trait IDs, intellectual specialty ids, and other
 * cross-references are validated structurally — full referential
 * integrity (every traitId resolves to a real trait definition, etc.)
 * is checked by the content loader in Issue #12.
 */

import { z } from 'zod';

const GameDateSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
});

const StatsSchema = z.object({
  diplomacy: z.number().min(0).max(25),
  stewardship: z.number().min(0).max(25),
  martial: z.number().min(0).max(25),
  intrigue: z.number().min(0).max(25),
  learning: z.number().min(0).max(25),
  piety: z.number().min(0).max(25),
});

const TraitSchema = z.object({
  traitId: z.string().min(1),
  source: z.enum(['born', 'inherited', 'educated', 'event', 'genetic']),
  acquiredDate: GameDateSchema,
});

const HealthConditionSchema = z.object({
  conditionId: z.string().min(1),
  severity: z.number().min(0).max(1),
  acquiredDate: GameDateSchema,
  expectedDuration: z.number().optional(),
});

const HealthSchema = z.object({
  current: z.number().min(0).max(100),
  max: z.number().min(0),
  conditions: z.array(HealthConditionSchema),
  plotArmor: z.boolean(),
  plotArmorExpires: GameDateSchema.optional(),
});

const FertilitySchema = z.object({
  base: z.number().min(0),
  modifiers: z.number(),
  sterile: z.boolean(),
});

const FamilySchema = z.object({
  fatherId: z.string().nullable(),
  motherId: z.string().nullable(),
  spouseId: z.string().nullable(),
  exSpouseIds: z.array(z.string()),
  childIds: z.array(z.string()),
  legitimateChildIds: z.array(z.string()),
  bastardIds: z.array(z.string()),
  siblingIds: z.array(z.string()),
});

const GeneticPoolSchema = z.object({
  commonAncestorIds: z.array(z.string()),
  consanguinityScore: z.number().min(0),
});

const PositionSchema = z.object({
  locationProvinceId: z.string().min(1),
  title: z.string(),
  courtRole: z.enum([
    'chancellor', 'marshal', 'spymaster', 'steward',
    'court_chaplain', 'court_physician', 'court_intellectual',
  ]).nullable(),
  fieldRole: z.enum(['general', 'admiral', 'governor']).nullable(),
  nationId: z.string().nullable(),
});

export const CharacterSchema = z.object({
  id: z.string().min(1),
  dynastyId: z.string().min(1),
  cultureId: z.string().min(1),
  religionId: z.string().min(1),

  givenName: z.string().min(1),
  dynastyName: z.string().min(1),
  nickname: z.string().optional(),

  birthDate: GameDateSchema,
  deathDate: GameDateSchema.nullable(),
  gender: z.enum(['male', 'female']),

  stats: StatsSchema,
  statsHiddenUntilAge: z.number().int().min(0),

  traits: z.array(TraitSchema),
  health: HealthSchema,
  fertility: FertilitySchema,
  family: FamilySchema,
  geneticPool: GeneticPoolSchema,
  position: PositionSchema,

  heldClaimNationIds: z.array(z.string()),
  heldClaimProvinceIds: z.array(z.string()),
  inheritanceClaimNationIds: z.array(z.string()),

  prestige: z.number(),
  pietyScore: z.number(),
  plotsInvolvedIn: z.array(z.string()),

  educationFocus: z.enum([
    'martial', 'stewardship', 'intrigue',
    'diplomatic', 'learning', 'piety',
  ]).nullable(),
  educationComplete: z.boolean(),
  tutorId: z.string().nullable(),

  regentForId: z.string().nullable(),
  isRegent: z.boolean(),

  marriagesProposedByMe: z.array(z.string()),
  marriagesProposedToMe: z.array(z.string()),

  intellectualSpecialty: z
    .enum([
      'theologian', 'astronomer', 'philosopher',
      'poet', 'mathematician', 'engineer', 'historian',
    ])
    .optional(),
});

export type CharacterSchemaType = z.infer<typeof CharacterSchema>;

export const DynastySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cultureId: z.string().min(1),
  foundingDate: GameDateSchema,
  foundingCharacterId: z.string().min(1),
});

export type DynastySchemaType = z.infer<typeof DynastySchema>;
