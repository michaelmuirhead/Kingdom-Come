/**
 * Hand-authored v0.1 characters and dynasties — AD 1200.
 *
 * 18 historical figures: the ruler of each starting nation plus their
 * spouses, heirs, and a few claimants/rivals. Plot armour is set to the
 * historical death year for each ruler so they can't die randomly
 * before the events the player would expect.
 *
 * Family cross-references (father/mother/spouse/children/siblings) are
 * fully wired between characters in this file. The content loader
 * (Issue #12) will assert that every reference resolves.
 */

import type {
  Character,
  CharacterStats,
  CharacterTrait,
  Dynasty,
  GameDate,
} from '@/types';

const D1200: GameDate = { year: 1200, month: 1, day: 1 };
const FOUNDING_DATE: GameDate = { year: 800, month: 1, day: 1 };

interface CharSpec {
  id: string;
  dynastyId: string;
  cultureId: string;
  religionId: string;
  givenName: string;
  dynastyName: string;
  nickname?: string;
  birthDate: GameDate;
  gender: 'male' | 'female';
  stats: CharacterStats;
  traitIds?: string[];
  plotArmorUntil?: GameDate;
  health?: number; // starting health 0..100, default 95
  locationProvinceId: string;
  title: string;
  nationId: string | null;
  isRegent?: boolean;
  regentForId?: string | null;
  heldClaimNationIds?: string[];
  heldClaimProvinceIds?: string[];
  inheritanceClaimNationIds?: string[];
  prestige?: number;
  // Family wiring — IDs only; resolved at build time.
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  childIds?: string[];
  legitimateChildIds?: string[];
  siblingIds?: string[];
}

// Dynasty definitions for v0.1.
export const DYNASTIES: readonly Dynasty[] = [
  {
    id: 'dyn_capet',
    name: 'House of Capet',
    cultureId: 'frankish',
    foundingDate: { year: 987, month: 7, day: 3 },
    foundingCharacterId: 'char_philip_ii_augustus',
  },
  {
    id: 'dyn_plantagenet',
    name: 'House of Plantagenet',
    cultureId: 'norman',
    foundingDate: { year: 1154, month: 12, day: 19 },
    foundingCharacterId: 'char_john_of_england',
  },
  {
    id: 'dyn_hohenstaufen',
    name: 'House of Hohenstaufen',
    cultureId: 'german',
    foundingDate: { year: 1138, month: 3, day: 7 },
    foundingCharacterId: 'char_frederick_ii',
  },
  {
    id: 'dyn_ivrea',
    name: 'House of Ivrea',
    cultureId: 'castilian',
    foundingDate: { year: 1126, month: 3, day: 1 },
    foundingCharacterId: 'char_alfonso_viii',
  },
  {
    id: 'dyn_barcelona',
    name: 'House of Barcelona',
    cultureId: 'catalan',
    foundingDate: { year: 1137, month: 8, day: 11 },
    foundingCharacterId: 'char_peter_ii_aragon',
  },
  {
    id: 'dyn_burgundy_portugal',
    name: 'House of Burgundy (Portugal)',
    cultureId: 'portuguese',
    foundingDate: { year: 1139, month: 7, day: 25 },
    foundingCharacterId: 'char_sancho_i',
  },
  {
    id: 'dyn_papacy',
    name: 'Cathedra Petri',
    cultureId: 'italian',
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_innocent_iii',
  },
  {
    id: 'dyn_dandolo',
    name: 'House Dandolo',
    cultureId: 'italian',
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_enrico_dandolo',
  },
  {
    id: 'dyn_genoese_doges',
    name: 'Genoese Republic',
    cultureId: 'italian',
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_lanfranco_pevere',
  },
  {
    id: 'dyn_almohad',
    name: 'House of the Almohads',
    cultureId: 'andalusian',
    foundingDate: { year: 1121, month: 1, day: 1 },
    foundingCharacterId: 'char_muhammad_an_nasir',
  },
  {
    id: 'dyn_poitou',
    name: 'House of Poitou',
    cultureId: 'occitan',
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_eleanor_aquitaine',
  },
  {
    id: 'dyn_oldenburg',
    name: 'Royal House of Denmark',
    cultureId: 'frankish', // stand-in; full culture set lives in v0.3+
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_ingeborg_denmark',
  },
  {
    id: 'dyn_taillefer',
    name: 'House of Taillefer',
    cultureId: 'occitan',
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_isabella_angouleme',
  },
  {
    id: 'dyn_brittany',
    name: 'House of Brittany',
    cultureId: 'frankish',
    foundingDate: FOUNDING_DATE,
    foundingCharacterId: 'char_arthur_brittany',
  },
];

const CHARS: readonly CharSpec[] = [
  // ── FRANCE ─────────────────────────────────────────────────────
  {
    id: 'char_philip_ii_augustus',
    dynastyId: 'dyn_capet',
    cultureId: 'frankish',
    religionId: 'catholic',
    givenName: 'Philippe',
    dynastyName: 'Capet',
    nickname: 'Augustus',
    birthDate: { year: 1165, month: 8, day: 21 },
    gender: 'male',
    stats: { diplomacy: 18, stewardship: 15, martial: 14, intrigue: 16, learning: 10, piety: 8 },
    traitIds: ['patient', 'cunning', 'just'],
    plotArmorUntil: { year: 1223, month: 7, day: 14 },
    locationProvinceId: 'prov_ile_de_france',
    title: 'King of France',
    nationId: 'FRA',
    prestige: 60,
    spouseId: 'char_ingeborg_denmark',
    legitimateChildIds: ['char_louis_viii'],
  },
  {
    id: 'char_ingeborg_denmark',
    dynastyId: 'dyn_oldenburg',
    cultureId: 'frankish',
    religionId: 'catholic',
    givenName: 'Ingeborg',
    dynastyName: 'of Denmark',
    birthDate: { year: 1175, month: 1, day: 1 },
    gender: 'female',
    stats: { diplomacy: 11, stewardship: 9, martial: 4, intrigue: 8, learning: 12, piety: 14 },
    traitIds: ['pious', 'patient'],
    locationProvinceId: 'prov_ile_de_france',
    title: 'Queen of France',
    nationId: 'FRA',
    spouseId: 'char_philip_ii_augustus',
  },
  {
    id: 'char_louis_viii',
    dynastyId: 'dyn_capet',
    cultureId: 'frankish',
    religionId: 'catholic',
    givenName: 'Louis',
    dynastyName: 'Capet',
    nickname: 'the Lion',
    birthDate: { year: 1187, month: 9, day: 5 },
    gender: 'male',
    stats: { diplomacy: 13, stewardship: 12, martial: 16, intrigue: 10, learning: 11, piety: 12 },
    traitIds: ['brave'],
    plotArmorUntil: { year: 1226, month: 11, day: 8 },
    locationProvinceId: 'prov_ile_de_france',
    title: 'Heir of France',
    nationId: 'FRA',
    inheritanceClaimNationIds: ['FRA'],
    fatherId: 'char_philip_ii_augustus',
    // Mother was Isabella of Hainault (died 1190, before our 1200 start).
    // Not modelled in v0.1.
  },

  // ── ENGLAND ────────────────────────────────────────────────────
  {
    id: 'char_john_of_england',
    dynastyId: 'dyn_plantagenet',
    cultureId: 'norman',
    religionId: 'catholic',
    givenName: 'John',
    dynastyName: 'Plantagenet',
    nickname: 'Lackland',
    birthDate: { year: 1166, month: 12, day: 24 },
    gender: 'male',
    stats: { diplomacy: 7, stewardship: 12, martial: 9, intrigue: 14, learning: 11, piety: 6 },
    traitIds: ['wroth', 'greedy', 'suspicious'],
    plotArmorUntil: { year: 1216, month: 10, day: 19 },
    locationProvinceId: 'prov_wessex',
    title: 'King of England, Duke of Aquitaine',
    nationId: 'ENG',
    prestige: 40,
    heldClaimProvinceIds: ['prov_anjou', 'prov_normandy', 'prov_aquitaine'],
    motherId: 'char_eleanor_aquitaine',
  },
  {
    id: 'char_eleanor_aquitaine',
    dynastyId: 'dyn_poitou',
    cultureId: 'occitan',
    religionId: 'catholic',
    givenName: 'Eleanor',
    dynastyName: 'of Aquitaine',
    birthDate: { year: 1122, month: 4, day: 1 },
    gender: 'female',
    stats: { diplomacy: 22, stewardship: 17, martial: 8, intrigue: 19, learning: 16, piety: 11 },
    traitIds: ['cunning', 'patient', 'sociable'],
    health: 60,
    plotArmorUntil: { year: 1204, month: 4, day: 1 },
    locationProvinceId: 'prov_aquitaine',
    title: 'Duchess of Aquitaine',
    nationId: 'ENG',
    prestige: 80,
    childIds: ['char_john_of_england'],
    legitimateChildIds: ['char_john_of_england'],
  },
  {
    id: 'char_isabella_angouleme',
    dynastyId: 'dyn_taillefer',
    cultureId: 'occitan',
    religionId: 'catholic',
    givenName: 'Isabella',
    dynastyName: 'of Angoulême',
    birthDate: { year: 1188, month: 1, day: 1 },
    gender: 'female',
    stats: { diplomacy: 10, stewardship: 8, martial: 4, intrigue: 12, learning: 9, piety: 9 },
    locationProvinceId: 'prov_aquitaine',
    title: 'Countess of Angoulême',
    nationId: null,
  },
  {
    id: 'char_arthur_brittany',
    dynastyId: 'dyn_brittany',
    cultureId: 'frankish',
    religionId: 'catholic',
    givenName: 'Arthur',
    dynastyName: 'of Brittany',
    birthDate: { year: 1187, month: 3, day: 29 },
    gender: 'male',
    stats: { diplomacy: 9, stewardship: 7, martial: 10, intrigue: 6, learning: 8, piety: 9 },
    traitIds: ['brave'],
    plotArmorUntil: { year: 1203, month: 4, day: 3 },
    locationProvinceId: 'prov_brittany',
    title: 'Duke of Brittany',
    nationId: 'FRA',
    heldClaimNationIds: ['ENG'],
    inheritanceClaimNationIds: ['ENG'],
  },

  // ── CASTILE ────────────────────────────────────────────────────
  {
    id: 'char_alfonso_viii',
    dynastyId: 'dyn_ivrea',
    cultureId: 'castilian',
    religionId: 'catholic',
    givenName: 'Alfonso',
    dynastyName: 'de Castilla',
    nickname: 'the Noble',
    birthDate: { year: 1155, month: 11, day: 11 },
    gender: 'male',
    stats: { diplomacy: 14, stewardship: 13, martial: 17, intrigue: 10, learning: 11, piety: 13 },
    traitIds: ['just', 'brave', 'reformer'],
    plotArmorUntil: { year: 1214, month: 10, day: 6 },
    locationProvinceId: 'prov_castile',
    title: 'King of Castile',
    nationId: 'CAS',
    prestige: 55,
    spouseId: 'char_eleanor_of_england',
    legitimateChildIds: ['char_berengaria_castile', 'char_blanche_castile'],
  },
  {
    id: 'char_eleanor_of_england',
    dynastyId: 'dyn_plantagenet',
    cultureId: 'norman',
    religionId: 'catholic',
    givenName: 'Eleanor',
    dynastyName: 'Plantagenet',
    birthDate: { year: 1162, month: 10, day: 13 },
    gender: 'female',
    stats: { diplomacy: 14, stewardship: 11, martial: 5, intrigue: 9, learning: 13, piety: 12 },
    traitIds: ['pious', 'sociable'],
    locationProvinceId: 'prov_castile',
    title: 'Queen of Castile',
    nationId: 'CAS',
    spouseId: 'char_alfonso_viii',
    legitimateChildIds: ['char_berengaria_castile', 'char_blanche_castile'],
  },
  {
    id: 'char_berengaria_castile',
    dynastyId: 'dyn_ivrea',
    cultureId: 'castilian',
    religionId: 'catholic',
    givenName: 'Berengaria',
    dynastyName: 'de Castilla',
    birthDate: { year: 1180, month: 1, day: 1 },
    gender: 'female',
    stats: { diplomacy: 14, stewardship: 14, martial: 6, intrigue: 11, learning: 13, piety: 13 },
    traitIds: ['just', 'pious'],
    locationProvinceId: 'prov_castile',
    title: 'Infanta of Castile',
    nationId: 'CAS',
    fatherId: 'char_alfonso_viii',
    motherId: 'char_eleanor_of_england',
    siblingIds: ['char_blanche_castile'],
    inheritanceClaimNationIds: ['CAS'],
  },
  {
    id: 'char_blanche_castile',
    dynastyId: 'dyn_ivrea',
    cultureId: 'castilian',
    religionId: 'catholic',
    givenName: 'Blanche',
    dynastyName: 'de Castilla',
    birthDate: { year: 1188, month: 3, day: 4 },
    gender: 'female',
    stats: { diplomacy: 18, stewardship: 16, martial: 7, intrigue: 14, learning: 14, piety: 13 },
    traitIds: ['patient', 'just'],
    locationProvinceId: 'prov_castile',
    title: 'Infanta of Castile',
    nationId: 'CAS',
    fatherId: 'char_alfonso_viii',
    motherId: 'char_eleanor_of_england',
    siblingIds: ['char_berengaria_castile'],
  },

  // ── ARAGON ─────────────────────────────────────────────────────
  {
    id: 'char_peter_ii_aragon',
    dynastyId: 'dyn_barcelona',
    cultureId: 'catalan',
    religionId: 'catholic',
    givenName: 'Pere',
    dynastyName: 'de Barcelona',
    nickname: 'the Catholic',
    birthDate: { year: 1178, month: 1, day: 1 },
    gender: 'male',
    stats: { diplomacy: 13, stewardship: 11, martial: 16, intrigue: 9, learning: 9, piety: 11 },
    traitIds: ['brave', 'ambitious'],
    plotArmorUntil: { year: 1213, month: 9, day: 13 },
    locationProvinceId: 'prov_aragon',
    title: 'King of Aragon',
    nationId: 'ARA',
  },

  // ── PORTUGAL ───────────────────────────────────────────────────
  {
    id: 'char_sancho_i',
    dynastyId: 'dyn_burgundy_portugal',
    cultureId: 'portuguese',
    religionId: 'catholic',
    givenName: 'Sancho',
    dynastyName: 'de Borgonha',
    nickname: 'the Populator',
    birthDate: { year: 1154, month: 11, day: 11 },
    gender: 'male',
    stats: { diplomacy: 10, stewardship: 14, martial: 14, intrigue: 8, learning: 9, piety: 13 },
    traitIds: ['diligent', 'just'],
    plotArmorUntil: { year: 1211, month: 3, day: 26 },
    locationProvinceId: 'prov_portugal',
    title: 'King of Portugal',
    nationId: 'POR',
    legitimateChildIds: ['char_afonso_ii_portugal'],
  },
  {
    id: 'char_afonso_ii_portugal',
    dynastyId: 'dyn_burgundy_portugal',
    cultureId: 'portuguese',
    religionId: 'catholic',
    givenName: 'Afonso',
    dynastyName: 'de Borgonha',
    nickname: 'the Fat',
    birthDate: { year: 1185, month: 4, day: 23 },
    gender: 'male',
    stats: { diplomacy: 9, stewardship: 13, martial: 11, intrigue: 7, learning: 10, piety: 11 },
    traitIds: ['stubborn'],
    plotArmorUntil: { year: 1223, month: 3, day: 25 },
    locationProvinceId: 'prov_portugal',
    title: 'Heir of Portugal',
    nationId: 'POR',
    fatherId: 'char_sancho_i',
    inheritanceClaimNationIds: ['POR'],
  },

  // ── PAPAL STATES ───────────────────────────────────────────────
  {
    id: 'char_innocent_iii',
    dynastyId: 'dyn_papacy',
    cultureId: 'italian',
    religionId: 'catholic',
    givenName: 'Lotario',
    dynastyName: 'dei Conti di Segni',
    nickname: 'Innocent III',
    birthDate: { year: 1161, month: 2, day: 1 },
    gender: 'male',
    stats: { diplomacy: 19, stewardship: 16, martial: 7, intrigue: 14, learning: 18, piety: 22 },
    traitIds: ['patient', 'just', 'zealous', 'reformer'],
    plotArmorUntil: { year: 1216, month: 7, day: 16 },
    locationProvinceId: 'prov_lazio',
    title: 'Pope, Vicar of Christ',
    nationId: 'PAP',
    prestige: 90,
  },

  // ── HRE + SICILY (one boy king holds both) ─────────────────────
  {
    id: 'char_frederick_ii',
    dynastyId: 'dyn_hohenstaufen',
    cultureId: 'german',
    religionId: 'catholic',
    givenName: 'Friedrich',
    dynastyName: 'von Hohenstaufen',
    nickname: 'stupor mundi',
    birthDate: { year: 1194, month: 12, day: 26 },
    gender: 'male',
    stats: { diplomacy: 22, stewardship: 18, martial: 13, intrigue: 17, learning: 25, piety: 4 },
    traitIds: ['genius', 'cynic', 'scholar', 'wroth'],
    plotArmorUntil: { year: 1250, month: 12, day: 13 },
    locationProvinceId: 'prov_sicily',
    title: 'King of the Romans, King of Sicily',
    nationId: 'HRE',
    prestige: 30,
    heldClaimNationIds: ['HRE', 'SIC'],
    inheritanceClaimNationIds: ['HRE', 'SIC'],
  },

  // ── VENICE ─────────────────────────────────────────────────────
  {
    id: 'char_enrico_dandolo',
    dynastyId: 'dyn_dandolo',
    cultureId: 'italian',
    religionId: 'catholic',
    givenName: 'Enrico',
    dynastyName: 'Dandolo',
    birthDate: { year: 1107, month: 1, day: 1 },
    gender: 'male',
    stats: { diplomacy: 23, stewardship: 19, martial: 11, intrigue: 22, learning: 19, piety: 10 },
    traitIds: ['brilliant_strategist', 'cunning', 'patient', 'sociable'],
    health: 50,
    plotArmorUntil: { year: 1205, month: 6, day: 1 },
    locationProvinceId: 'prov_venice',
    title: 'Doge of Venice',
    nationId: 'VEN',
    prestige: 70,
  },

  // ── GENOA ──────────────────────────────────────────────────────
  {
    id: 'char_lanfranco_pevere',
    dynastyId: 'dyn_genoese_doges',
    cultureId: 'italian',
    religionId: 'catholic',
    givenName: 'Lanfranco',
    dynastyName: 'Pevere',
    birthDate: { year: 1150, month: 1, day: 1 },
    gender: 'male',
    stats: { diplomacy: 14, stewardship: 16, martial: 9, intrigue: 12, learning: 13, piety: 9 },
    traitIds: ['diligent'],
    locationProvinceId: 'prov_genoa',
    title: 'Doge of Genoa',
    nationId: 'GEN',
  },

  // ── ALMOHADS ───────────────────────────────────────────────────
  {
    id: 'char_muhammad_an_nasir',
    dynastyId: 'dyn_almohad',
    cultureId: 'andalusian',
    religionId: 'sunni',
    givenName: 'Muhammad',
    dynastyName: 'al-Muʾminid',
    nickname: 'an-Nasir',
    birthDate: { year: 1182, month: 1, day: 1 },
    gender: 'male',
    stats: { diplomacy: 11, stewardship: 12, martial: 15, intrigue: 10, learning: 12, piety: 16 },
    traitIds: ['zealous', 'brave'],
    plotArmorUntil: { year: 1213, month: 12, day: 25 },
    locationProvinceId: 'prov_andalusia',
    title: 'Caliph of the Faithful',
    nationId: 'ALM',
    prestige: 50,
  },
];

// ──────────────────────────────────────────────────────────────────
// Builder
// ──────────────────────────────────────────────────────────────────

function makeTrait(id: string): CharacterTrait {
  return { traitId: id, source: 'born', acquiredDate: D1200 };
}

function specToCharacter(c: CharSpec): Character {
  return {
    id: c.id,
    dynastyId: c.dynastyId,
    cultureId: c.cultureId,
    religionId: c.religionId,
    givenName: c.givenName,
    dynastyName: c.dynastyName,
    ...(c.nickname !== undefined ? { nickname: c.nickname } : {}),
    birthDate: c.birthDate,
    deathDate: null,
    gender: c.gender,
    stats: c.stats,
    statsHiddenUntilAge: 16,
    traits: (c.traitIds ?? []).map(makeTrait),
    health: {
      current: c.health ?? 95,
      max: 100,
      conditions: [],
      plotArmor: c.plotArmorUntil !== undefined,
      ...(c.plotArmorUntil ? { plotArmorExpires: c.plotArmorUntil } : {}),
    },
    fertility: { base: 1, modifiers: 0, sterile: false },
    family: {
      fatherId: c.fatherId ?? null,
      motherId: c.motherId ?? null,
      spouseId: c.spouseId ?? null,
      exSpouseIds: [],
      childIds: c.childIds ?? c.legitimateChildIds ?? [],
      legitimateChildIds: c.legitimateChildIds ?? [],
      bastardIds: [],
      siblingIds: c.siblingIds ?? [],
    },
    geneticPool: { commonAncestorIds: [], consanguinityScore: 0 },
    position: {
      locationProvinceId: c.locationProvinceId,
      title: c.title,
      courtRole: null,
      fieldRole: null,
      nationId: c.nationId,
    },
    heldClaimNationIds: c.heldClaimNationIds ?? [],
    heldClaimProvinceIds: c.heldClaimProvinceIds ?? [],
    inheritanceClaimNationIds: c.inheritanceClaimNationIds ?? [],
    prestige: c.prestige ?? 10,
    pietyScore: 0,
    plotsInvolvedIn: [],
    educationFocus: null,
    educationComplete: c.birthDate.year <= 1184, // age 16+
    tutorId: null,
    regentForId: c.regentForId ?? null,
    isRegent: c.isRegent ?? false,
    marriagesProposedByMe: [],
    marriagesProposedToMe: [],
  };
}

export const CHARACTERS: readonly Character[] = CHARS.map(specToCharacter);

export const CHARACTERS_BY_ID: Readonly<Record<string, Character>> = (() => {
  const m: Record<string, Character> = {};
  for (const c of CHARACTERS) m[c.id] = c;
  return m;
})();

export const DYNASTIES_BY_ID: Readonly<Record<string, Dynasty>> = (() => {
  const m: Record<string, Dynasty> = {};
  for (const d of DYNASTIES) m[d.id] = d;
  return m;
})();
