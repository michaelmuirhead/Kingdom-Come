/**
 * Hand-authored v0.1 starting nations — AD 1200.
 *
 * 11 nations: the 10 from ROADMAP_V01 Issue #10 plus ALM (Almohads)
 * who hold Andalusia and Valencia in the province data.
 *
 * Ideology vectors are seeded by hand to express each nation's
 * historical character at 1200; ambitions are 1-2 per nation to give
 * the AI early goals to pursue. Treasury sits in 100-300 gold,
 * manpower scaled to provincial weight. Rulers and dynasties reference
 * characters authored in Issue #11.
 */

import type { Ambition, IdeologyVector, Nation } from '@/types';

const START_DATE = { year: 1200, month: 1, day: 1 } as const;

const ZERO_VECTOR: IdeologyVector = {
  militaristPacifist: 0,
  mercantileAgrarian: 0,
  theocraticSecular: 0,
  openIsolationist: 0,
  aristocraticPopulist: 0,
  traditionalProgressive: 0,
  centralistFederalist: 0,
};

const ZERO_INCOME = {
  tax: 0,
  trade: 0,
  production: 0,
  tariffs: 0,
  tribute: 0,
  total: 0,
};

const ZERO_EXPENSES = {
  armyUpkeep: 0,
  navyUpkeep: 0,
  buildingConstruction: 0,
  courtCosts: 0,
  loanInterest: 0,
  subsidies: 0,
  total: 0,
};

function v(partial: Partial<IdeologyVector>): IdeologyVector {
  return { ...ZERO_VECTOR, ...partial };
}

function ambition(
  id: string,
  type: Ambition['type'],
  description: string,
  weight: number,
  extra: Partial<Ambition> = {},
): Ambition {
  return {
    id,
    type,
    description,
    progress: 0,
    startedDate: START_DATE,
    weight,
    ...extra,
  };
}

interface Spec {
  id: string;
  name: string;
  tag: string;
  cultureId: string;
  primaryReligionId: string;
  governmentType: Nation['governmentType'];
  archetypeId: string;
  flagColor: string;
  rulerId: string;
  dynastyId: string;
  successionLaw: Nation['successionLaw'];
  treasury: number;
  manpower: number;
  maxManpower: number;
  prestige?: number;
  legitimacy?: number;
  ideologyVector: IdeologyVector;
  ambitions: Ambition[];
  rivals: string[];
  interests: string[];
  activeEstateIds?: string[];
  stability?: number;
  religiousUnity?: number;
  culturalUnity?: number;
  toleranceScore?: number;
  defenderOfFaithFor?: string | null;
  caliphateClaim?: boolean;
  thirdRomeClaim?: boolean;
  greatPowerRank?: number | null;
}

const SPECS: readonly Spec[] = [
  // ────────────────────────────────────────────────────────────────
  // FRANCE — Capetian. Centralizing. Anti-English. The player's most
  // historically dynamic starting choice.
  {
    id: 'FRA',
    name: 'Kingdom of France',
    tag: 'FRA',
    cultureId: 'frankish',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#4070d0',
    rulerId: 'char_philip_ii_augustus',
    dynastyId: 'dyn_capet',
    successionLaw: 'salic_primogeniture',
    treasury: 250,
    manpower: 8000,
    maxManpower: 15000,
    prestige: 20,
    ideologyVector: v({
      centralistFederalist: 25,
      aristocraticPopulist: -30,
      traditionalProgressive: -10,
      theocraticSecular: -15,
    }),
    ambitions: [
      ambition(
        'amb_fra_reconquer_normandy',
        'territorial',
        'Reclaim Normandy from the Plantagenets.',
        20,
        { targetProvinceIds: ['prov_normandy'] },
      ),
      ambition(
        'amb_fra_centralize_realm',
        'cultural',
        'Bring all Frankish lands under direct royal administration.',
        12,
      ),
    ],
    rivals: ['ENG'],
    interests: ['france', 'low_countries'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 50,
  },

  // ────────────────────────────────────────────────────────────────
  // ENGLAND — Angevin Empire under John Lackland. Sprawling, brittle.
  {
    id: 'ENG',
    name: 'Kingdom of England',
    tag: 'ENG',
    cultureId: 'norman',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#c73030',
    rulerId: 'char_john_of_england',
    dynastyId: 'dyn_plantagenet',
    successionLaw: 'primogeniture',
    treasury: 180,
    manpower: 7000,
    maxManpower: 14000,
    prestige: 25,
    legitimacy: 80,
    ideologyVector: v({
      militaristPacifist: 15,
      aristocraticPopulist: -40,
      centralistFederalist: -10,
      theocraticSecular: -10,
    }),
    ambitions: [
      ambition(
        'amb_eng_hold_aquitaine',
        'territorial',
        'Hold the Angevin lands against French ambition.',
        18,
        { targetProvinceIds: ['prov_anjou', 'prov_aquitaine', 'prov_normandy'] },
      ),
      ambition(
        'amb_eng_subdue_wales',
        'territorial',
        'Bring Wales fully under English rule.',
        8,
        { targetProvinceIds: ['prov_wales'] },
      ),
    ],
    rivals: ['FRA'],
    interests: ['british_isles', 'france'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 35,
  },

  // ────────────────────────────────────────────────────────────────
  // HOLY ROMAN EMPIRE — child king Frederick II under regency.
  // Wildly decentralized; the central authority is contested.
  {
    id: 'HRE',
    name: 'Holy Roman Empire',
    tag: 'HRE',
    cultureId: 'german',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#f0c040',
    rulerId: 'char_frederick_ii',
    dynastyId: 'dyn_hohenstaufen',
    successionLaw: 'elective',
    treasury: 200,
    manpower: 9000,
    maxManpower: 18000,
    prestige: 30,
    legitimacy: 60,
    ideologyVector: v({
      centralistFederalist: -50, // strongly federal
      aristocraticPopulist: -50,
      traditionalProgressive: -20,
      theocraticSecular: -5,
    }),
    ambitions: [
      ambition(
        'amb_hre_imperial_reclamation',
        'territorial',
        'Reassert imperial authority over the Italian crown.',
        15,
        { targetProvinceIds: ['prov_lombardy', 'prov_piedmont'] },
      ),
    ],
    rivals: ['PAP'],
    interests: ['germany', 'italy'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 25,
    greatPowerRank: 3,
  },

  // ────────────────────────────────────────────────────────────────
  // CASTILE — Alfonso VIII. Reconquista posture; the southern frontier
  // is the live story.
  {
    id: 'CAS',
    name: 'Kingdom of Castile',
    tag: 'CAS',
    cultureId: 'castilian',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#ffd060',
    rulerId: 'char_alfonso_viii',
    dynastyId: 'dyn_ivrea',
    successionLaw: 'primogeniture',
    treasury: 160,
    manpower: 6000,
    maxManpower: 12000,
    prestige: 25,
    ideologyVector: v({
      militaristPacifist: 25,
      theocraticSecular: -25, // crusader piety
      traditionalProgressive: -10,
      aristocraticPopulist: -20,
    }),
    ambitions: [
      ambition(
        'amb_cas_reconquista',
        'religious',
        'Drive the Almohads from Iberia.',
        25,
        { targetProvinceIds: ['prov_andalusia', 'prov_valencia'] },
      ),
    ],
    rivals: ['ALM', 'ARA'],
    interests: ['iberia'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 50,
    religiousUnity: 75,
  },

  // ────────────────────────────────────────────────────────────────
  // ARAGON — Peter II. Mediterranean trade ambitions.
  {
    id: 'ARA',
    name: 'Crown of Aragon',
    tag: 'ARA',
    cultureId: 'catalan',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#c08040',
    rulerId: 'char_peter_ii_aragon',
    dynastyId: 'dyn_barcelona',
    successionLaw: 'primogeniture',
    treasury: 140,
    manpower: 4500,
    maxManpower: 9000,
    prestige: 15,
    ideologyVector: v({
      mercantileAgrarian: -30,
      openIsolationist: -15,
      aristocraticPopulist: -10,
      militaristPacifist: 10,
    }),
    ambitions: [
      ambition(
        'amb_ara_take_valencia',
        'territorial',
        'Take Valencia from the Almohads.',
        18,
        { targetProvinceIds: ['prov_valencia'] },
      ),
      ambition(
        'amb_ara_claim_sardinia',
        'territorial',
        'Press the Aragonese claim on Sardinia.',
        10,
        { targetProvinceIds: ['prov_sardinia'] },
      ),
    ],
    rivals: ['CAS', 'GEN'],
    interests: ['iberia', 'italy'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 50,
  },

  // ────────────────────────────────────────────────────────────────
  // PORTUGAL — Sancho I. Newest of the Iberian crowns.
  {
    id: 'POR',
    name: 'Kingdom of Portugal',
    tag: 'POR',
    cultureId: 'portuguese',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#50a050',
    rulerId: 'char_sancho_i',
    dynastyId: 'dyn_burgundy_portugal',
    successionLaw: 'primogeniture',
    treasury: 110,
    manpower: 3000,
    maxManpower: 6000,
    prestige: 10,
    legitimacy: 85,
    ideologyVector: v({
      openIsolationist: -10,
      mercantileAgrarian: -15,
      theocraticSecular: -20,
      militaristPacifist: 10,
    }),
    ambitions: [
      ambition(
        'amb_por_press_south',
        'religious',
        'Push the Portuguese reconquista further south.',
        15,
        { targetProvinceIds: ['prov_andalusia'] },
      ),
    ],
    rivals: ['CAS'],
    interests: ['iberia'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 50,
  },

  // ────────────────────────────────────────────────────────────────
  // PAPAL STATES — Innocent III. Apex of medieval papal authority.
  {
    id: 'PAP',
    name: 'Papal States',
    tag: 'PAP',
    cultureId: 'italian',
    primaryReligionId: 'catholic',
    governmentType: 'theocracy',
    archetypeId: 'theocracy',
    flagColor: '#f5f0e0',
    rulerId: 'char_innocent_iii',
    dynastyId: 'dyn_papacy',
    successionLaw: 'elective',
    treasury: 200,
    manpower: 2000,
    maxManpower: 4000,
    prestige: 40,
    legitimacy: 95,
    ideologyVector: v({
      theocraticSecular: -80,
      traditionalProgressive: -25,
      aristocraticPopulist: -10,
      militaristPacifist: -5,
    }),
    ambitions: [
      ambition(
        'amb_pap_call_crusade',
        'religious',
        'Call a new crusade in defense of Christendom.',
        25,
      ),
      ambition(
        'amb_pap_assert_supremacy',
        'religious',
        'Assert papal supremacy over secular kings.',
        15,
      ),
    ],
    rivals: ['HRE'],
    interests: ['italy'],
    activeEstateIds: ['clergy', 'burghers', 'peasants'],
    stability: 60,
    religiousUnity: 100,
    defenderOfFaithFor: 'catholic',
  },

  // ────────────────────────────────────────────────────────────────
  // VENICE — Doge Enrico Dandolo. Master of the Adriatic.
  {
    id: 'VEN',
    name: 'Republic of Venice',
    tag: 'VEN',
    cultureId: 'italian',
    primaryReligionId: 'catholic',
    governmentType: 'merchant_republic',
    archetypeId: 'merchant_republic',
    flagColor: '#903030',
    rulerId: 'char_enrico_dandolo',
    dynastyId: 'dyn_dandolo',
    successionLaw: 'elective',
    treasury: 300,
    manpower: 2500,
    maxManpower: 5000,
    prestige: 35,
    ideologyVector: v({
      mercantileAgrarian: -80,
      openIsolationist: -30,
      aristocraticPopulist: 10,
      theocraticSecular: 20,
      traditionalProgressive: 15,
    }),
    ambitions: [
      ambition(
        'amb_ven_dominate_adriatic',
        'economic',
        'Make the Adriatic a Venetian lake.',
        20,
      ),
      ambition(
        'amb_ven_eastern_trade',
        'economic',
        'Secure trade routes to the Levant.',
        18,
      ),
    ],
    rivals: ['GEN'],
    interests: ['italy', 'mediterranean'],
    activeEstateIds: ['nobility', 'burghers', 'clergy'],
    stability: 60,
  },

  // ────────────────────────────────────────────────────────────────
  // GENOA — the other great Italian republic. Western Mediterranean.
  {
    id: 'GEN',
    name: 'Republic of Genoa',
    tag: 'GEN',
    cultureId: 'italian',
    primaryReligionId: 'catholic',
    governmentType: 'merchant_republic',
    archetypeId: 'merchant_republic',
    flagColor: '#d04040',
    rulerId: 'char_genoese_doge',
    dynastyId: 'dyn_genoese_doges',
    successionLaw: 'elective',
    treasury: 240,
    manpower: 2200,
    maxManpower: 4500,
    prestige: 25,
    ideologyVector: v({
      mercantileAgrarian: -70,
      openIsolationist: -20,
      militaristPacifist: 5,
      traditionalProgressive: 10,
    }),
    ambitions: [
      ambition(
        'amb_gen_hold_islands',
        'territorial',
        'Hold Corsica and Sardinia against Aragonese ambition.',
        15,
        { targetProvinceIds: ['prov_corsica', 'prov_sardinia'] },
      ),
    ],
    rivals: ['VEN', 'ARA'],
    interests: ['italy', 'mediterranean'],
    activeEstateIds: ['nobility', 'burghers', 'clergy'],
    stability: 55,
  },

  // ────────────────────────────────────────────────────────────────
  // SICILY — Frederick II also wears this crown as a child king.
  // Norman-Arab-Greek cultural mixture, papal vassal nominally.
  {
    id: 'SIC',
    name: 'Kingdom of Sicily',
    tag: 'SIC',
    cultureId: 'sicilian',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#ff8030',
    rulerId: 'char_frederick_ii',
    dynastyId: 'dyn_hohenstaufen',
    successionLaw: 'primogeniture',
    treasury: 170,
    manpower: 3500,
    maxManpower: 7000,
    prestige: 20,
    legitimacy: 70,
    ideologyVector: v({
      openIsolationist: -25, // cosmopolitan
      mercantileAgrarian: -20,
      theocraticSecular: 10, // unusually secular for the era
      traditionalProgressive: 15,
    }),
    ambitions: [
      ambition(
        'amb_sic_consolidate',
        'cultural',
        'Hold the mainland and the island as one realm.',
        15,
      ),
    ],
    rivals: ['PAP'],
    interests: ['italy', 'mediterranean'],
    activeEstateIds: ['nobility', 'clergy', 'burghers', 'peasants'],
    stability: 25,
    culturalUnity: 50,
    toleranceScore: 60,
  },

  // ────────────────────────────────────────────────────────────────
  // ALMOHAD CALIPHATE — the Sunni power in Iberia. Heavily theocratic.
  {
    id: 'ALM',
    name: 'Almohad Caliphate',
    tag: 'ALM',
    cultureId: 'andalusian',
    primaryReligionId: 'sunni',
    governmentType: 'caliphate',
    archetypeId: 'caliphate',
    flagColor: '#406020',
    rulerId: 'char_muhammad_an_nasir',
    dynastyId: 'dyn_almohad',
    successionLaw: 'tanistry',
    treasury: 220,
    manpower: 5500,
    maxManpower: 11000,
    prestige: 30,
    legitimacy: 75,
    ideologyVector: v({
      theocraticSecular: -70,
      militaristPacifist: 15,
      traditionalProgressive: -30,
      openIsolationist: -10,
      aristocraticPopulist: -20,
    }),
    ambitions: [
      ambition(
        'amb_alm_jihad',
        'religious',
        'Press the jihad against the Iberian Christians.',
        20,
        { targetProvinceIds: ['prov_castile', 'prov_aragon'] },
      ),
    ],
    rivals: ['CAS', 'POR', 'ARA'],
    interests: ['iberia', 'north_africa'],
    activeEstateIds: ['ulama', 'nobility', 'peasants'],
    stability: 45,
    religiousUnity: 90,
    caliphateClaim: true,
  },
];

// ──────────────────────────────────────────────────────────────────
// Builder
// ──────────────────────────────────────────────────────────────────

function specToNation(s: Spec): Nation {
  return {
    id: s.id,
    name: s.name,
    tag: s.tag,
    cultureId: s.cultureId,
    primaryReligionId: s.primaryReligionId,
    governmentType: s.governmentType,
    archetypeId: s.archetypeId,
    flagColor: s.flagColor,
    rulerId: s.rulerId,
    dynastyId: s.dynastyId,
    successionLaw: s.successionLaw,
    treasury: s.treasury,
    manpower: s.manpower,
    maxManpower: s.maxManpower,
    prestige: s.prestige ?? 0,
    legitimacy: s.legitimacy ?? 100,
    techLevels: {
      admin: 0,
      military: 0,
      diplomatic: 0,
      cultural: 0,
      religious: 0,
    },
    embracedInstitutions: ['feudalism'],
    ideologyVector: s.ideologyVector,
    ideologyHistory: [],
    ambitions: s.ambitions,
    rivals: s.rivals,
    interests: s.interests,
    honor: 50,
    diplomaticReputation: 0,
    aggressiveExpansion: 0,
    threat: 0,
    stability: s.stability ?? 50,
    religiousUnity: s.religiousUnity ?? 90,
    culturalUnity: s.culturalUnity ?? 80,
    toleranceScore: s.toleranceScore ?? 30,
    greatPowerRank: s.greatPowerRank ?? null,
    activeEstateIds: s.activeEstateIds ?? ['nobility', 'clergy', 'burghers', 'peasants'],
    culturalInfluenceScore: 0,
    defenderOfFaithFor: s.defenderOfFaithFor ?? null,
    caliphateClaim: s.caliphateClaim ?? false,
    thirdRomeClaim: s.thirdRomeClaim ?? false,
    cachedIncome: { ...ZERO_INCOME },
    cachedExpenses: { ...ZERO_EXPENSES },
    cachedNetMonthly: 0,
    cachedPersonality: null,
  };
}

export const NATIONS: readonly Nation[] = SPECS.map(specToNation);

export const NATIONS_BY_ID: Readonly<Record<string, Nation>> = (() => {
  const m: Record<string, Nation> = {};
  for (const n of NATIONS) m[n.id] = n;
  return m;
})();
