/**
 * Zod schema for Nation content files. Mirrors the TypeScript `Nation`
 * type in `@/types`. Cached-income / cached-expenses / cached-personality
 * fields can be zero / null at authoring time — the engine fills them
 * on the first economy tick.
 */

import { z } from 'zod';

const GovernmentTypeSchema = z.enum([
  'feudal_monarchy',
  'merchant_republic',
  'theocracy',
  'tribal_federation',
  'imperial_bureaucratic',
  'caliphate',
  'sultanate',
  'administrative_monarchy',
  'absolute_monarchy',
  'constitutional_monarchy',
  'parliamentary_republic',
  'revolutionary_republic',
  'industrial_empire',
  'cosmopolitan_empire',
  'reactionary_empire',
  'hermit_kingdom',
  'confederation',
  'shogunate',
  'mandala_kingdom',
  'maritime_sultanate',
  'sahel_empire',
]);

const SuccessionLawSchema = z.enum([
  'confederate_partition',
  'elective',
  'salic_primogeniture',
  'primogeniture',
  'seniority',
  'tanistry',
  'absolute_primogeniture',
]);

const TechTreeIdSchema = z.enum([
  'admin',
  'military',
  'diplomatic',
  'cultural',
  'religious',
]);

const IdeologyVectorSchema = z.object({
  militaristPacifist: z.number().min(-100).max(100),
  mercantileAgrarian: z.number().min(-100).max(100),
  theocraticSecular: z.number().min(-100).max(100),
  openIsolationist: z.number().min(-100).max(100),
  aristocraticPopulist: z.number().min(-100).max(100),
  traditionalProgressive: z.number().min(-100).max(100),
  centralistFederalist: z.number().min(-100).max(100),
});

const GameDateSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
});

const AmbitionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['territorial', 'religious', 'economic', 'dynastic', 'cultural']),
  description: z.string().min(1),
  targetProvinceIds: z.array(z.string()).optional(),
  targetNationId: z.string().optional(),
  targetReligionId: z.string().optional(),
  progress: z.number().min(0).max(1),
  startedDate: GameDateSchema,
  weight: z.number().min(0),
});

const IncomeBreakdownSchema = z.object({
  tax: z.number(),
  trade: z.number(),
  production: z.number(),
  tariffs: z.number(),
  tribute: z.number(),
  total: z.number(),
});

const ExpenseBreakdownSchema = z.object({
  armyUpkeep: z.number(),
  navyUpkeep: z.number(),
  buildingConstruction: z.number(),
  courtCosts: z.number(),
  loanInterest: z.number(),
  subsidies: z.number(),
  total: z.number(),
});

export const NationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameByEra: z
    .record(
      z.enum(['medieval', 'renaissance', 'early_modern', 'industrial']),
      z.string(),
    )
    .optional(),
  tag: z.string().min(2).max(4),

  cultureId: z.string().min(1),
  primaryReligionId: z.string().min(1),
  governmentType: GovernmentTypeSchema,
  archetypeId: z.string().min(1),
  flagColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),

  rulerId: z.string().min(1),
  dynastyId: z.string().min(1),
  successionLaw: SuccessionLawSchema,

  treasury: z.number(),
  manpower: z.number().min(0),
  maxManpower: z.number().min(0),
  prestige: z.number().min(-100).max(500),
  legitimacy: z.number().min(0).max(100),

  techLevels: z.record(TechTreeIdSchema, z.number().min(0)),
  embracedInstitutions: z.array(z.string()),

  ideologyVector: IdeologyVectorSchema,
  ideologyHistory: z.array(z.unknown()),

  ambitions: z.array(AmbitionSchema),
  rivals: z.array(z.string()),
  interests: z.array(z.string()),

  honor: z.number().min(0).max(100),
  diplomaticReputation: z.number().min(-5).max(5),
  aggressiveExpansion: z.number().min(0).max(100),
  threat: z.number().min(0).max(100),

  stability: z.number().min(0).max(100),
  religiousUnity: z.number().min(0).max(100),
  culturalUnity: z.number().min(0).max(100),
  toleranceScore: z.number().min(0).max(100),

  greatPowerRank: z.number().int().nullable(),

  activeEstateIds: z.array(z.string()),

  culturalInfluenceScore: z.number(),

  defenderOfFaithFor: z.string().nullable(),
  caliphateClaim: z.boolean(),
  thirdRomeClaim: z.boolean(),

  cachedIncome: IncomeBreakdownSchema,
  cachedExpenses: ExpenseBreakdownSchema,
  cachedNetMonthly: z.number(),
  cachedPersonality: z.record(z.string(), z.number()).nullable(),
});

export type NationSchemaType = z.infer<typeof NationSchema>;
