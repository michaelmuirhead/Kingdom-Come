/**
 * Test fixtures — minimal but type-correct entities for store tests.
 * Override fields per test by spreading the result.
 */

import type {
  Character,
  Dynasty,
  GameDate,
  Nation,
  Province,
} from '@/types';

const DATE: GameDate = { year: 1200, month: 1, day: 1 };

export function makeProvince(
  override: Partial<Province> & { id: string },
): Province {
  const { id, name, ...rest } = override;
  return {
    id,
    name: name ?? `Province ${id}`,
    position: { x: 0, y: 0 },
    pathData: 'M 0 0 L 10 0 L 10 10 L 0 10 Z',
    adjacencies: [],
    navalAdjacencies: [],
    regionId: 'western_europe',
    terrain: 'plains',
    climate: 'temperate',
    development: { tax: 5, production: 5, manpower: 5 },
    population: 50_000,
    cultureId: 'frankish',
    religionId: 'catholic',
    controllerId: 'FRA',
    occupierId: null,
    coreNationIds: [],
    claimNationIds: [],
    tradeGoodId: 'grain',
    buildings: [],
    fortificationLevel: 1,
    estateOwnership: {},
    unrest: 0,
    culturalInfluencePresent: {},
    institutions: {},
    beingDeveloped: false,
    beingConverted: false,
    conversionTargetReligionId: null,
    promotionTargetCultureId: null,
    conversionProgress: 0,
    promotionProgress: 0,
    isCapital: false,
    isPilgrimageSite: false,
    pilgrimageSiteFaith: null,
    isCoastal: false,
    navalCapacity: 0,
    manpowerPool: { current: 1000, max: 1000, regenRate: 50 },
    monthlyIncome: 0,
    ...rest,
  };
}

export function makeNation(
  override: Partial<Nation> & { id: string },
): Nation {
  const { id, name, tag, ...rest } = override;
  return {
    id,
    name: name ?? `Nation ${id}`,
    tag: tag ?? id,
    cultureId: 'frankish',
    primaryReligionId: 'catholic',
    governmentType: 'feudal_monarchy',
    archetypeId: 'feudal_kingdom',
    flagColor: '#3366cc',
    rulerId: 'char_default',
    dynastyId: 'dyn_default',
    successionLaw: 'salic_primogeniture',
    treasury: 100,
    manpower: 5000,
    maxManpower: 10000,
    prestige: 0,
    legitimacy: 100,
    techLevels: { admin: 0, military: 0, diplomatic: 0, cultural: 0, religious: 0 },
    embracedInstitutions: ['feudalism'],
    ideologyVector: {
      militaristPacifist: 0,
      mercantileAgrarian: 0,
      theocraticSecular: 0,
      openIsolationist: 0,
      aristocraticPopulist: 0,
      traditionalProgressive: 0,
      centralistFederalist: 0,
    },
    ideologyHistory: [],
    ambitions: [],
    rivals: [],
    interests: [],
    honor: 50,
    diplomaticReputation: 0,
    aggressiveExpansion: 0,
    threat: 0,
    stability: 50,
    religiousUnity: 90,
    culturalUnity: 80,
    toleranceScore: 30,
    greatPowerRank: null,
    activeEstateIds: [],
    culturalInfluenceScore: 0,
    defenderOfFaithFor: null,
    caliphateClaim: false,
    thirdRomeClaim: false,
    cachedIncome: { tax: 0, trade: 0, production: 0, tariffs: 0, tribute: 0, total: 0 },
    cachedExpenses: {
      armyUpkeep: 0,
      navyUpkeep: 0,
      buildingConstruction: 0,
      courtCosts: 0,
      loanInterest: 0,
      subsidies: 0,
      total: 0,
    },
    cachedNetMonthly: 0,
    cachedPersonality: null,
    ...rest,
  };
}

export function makeCharacter(
  override: Partial<Character> & { id: string },
): Character {
  const { id, givenName, dynastyName, ...rest } = override;
  return {
    id,
    dynastyId: 'dyn_default',
    cultureId: 'frankish',
    religionId: 'catholic',
    givenName: givenName ?? 'Henri',
    dynastyName: dynastyName ?? 'Capet',
    birthDate: { year: 1170, month: 1, day: 1 },
    deathDate: null,
    gender: 'male',
    stats: {
      diplomacy: 10,
      stewardship: 10,
      martial: 10,
      intrigue: 10,
      learning: 10,
      piety: 10,
    },
    statsHiddenUntilAge: 16,
    traits: [],
    health: {
      current: 100,
      max: 100,
      conditions: [],
      plotArmor: false,
    },
    fertility: { base: 1, modifiers: 0, sterile: false },
    family: {
      fatherId: null,
      motherId: null,
      spouseId: null,
      exSpouseIds: [],
      childIds: [],
      legitimateChildIds: [],
      bastardIds: [],
      siblingIds: [],
    },
    geneticPool: { commonAncestorIds: [], consanguinityScore: 0 },
    position: {
      locationProvinceId: 'prov_ile_de_france',
      title: 'King',
      courtRole: null,
      fieldRole: null,
      nationId: 'FRA',
    },
    heldClaimNationIds: [],
    heldClaimProvinceIds: [],
    inheritanceClaimNationIds: [],
    prestige: 0,
    pietyScore: 0,
    plotsInvolvedIn: [],
    educationFocus: null,
    educationComplete: true,
    tutorId: null,
    regentForId: null,
    isRegent: false,
    marriagesProposedByMe: [],
    marriagesProposedToMe: [],
    ...rest,
  };
}

export function makeDynasty(
  override: Partial<Dynasty> & { id: string },
): Dynasty {
  const { id, name, ...rest } = override;
  return {
    id,
    name: name ?? `House ${id}`,
    cultureId: 'frankish',
    foundingDate: DATE,
    foundingCharacterId: 'char_default',
    ...rest,
  };
}
