/**
 * Hand-authored v0.1 provinces — Western Europe in AD 1200.
 *
 * Layout is a stylized 10×8 grid (each cell 100×100 in a 1000×800
 * SVG viewBox). Province polygons are single-cell squares; adjacency is
 * derived from cell-neighbour relationships, so the symmetric-edges
 * guarantee falls out automatically.
 *
 * Geography is approximate — the goal is "looks like a map" not "to
 * the meter." See ROADMAP_V01 Issue #9.
 */

import type { ClimateType, Province, TerrainType } from '@/types';

const CELL = 100;
export const PROVINCE_VIEWBOX = { width: 1000, height: 800 };

interface Spec {
  id: string;
  name: string;
  col: number;
  row: number;
  cultureId: string;
  religionId: string;
  controllerId: string;
  tradeGoodId: string;
  terrain: TerrainType;
  climate: ClimateType;
  regionId: string;
  isCoastal?: boolean;
  isCapital?: boolean;
  fortLevel?: 0 | 1 | 2 | 3 | 4;
  population?: number;
  development?: { tax: number; production: number; manpower: number };
  isPilgrimageSite?: boolean;
  pilgrimageSiteFaith?: string | null;
  coreNationIds?: string[];
  claimNationIds?: string[];
}

// Western Europe, 1200. Controllers:
//   FRA Capetian France                          ALM Almohads (Andalusia)
//   ENG Angevin Empire (Plantagenet)             POR Kingdom of Portugal
//   HRE Holy Roman Empire                        VEN Republic of Venice
//   CAS Kingdom of Castile / León                GEN Republic of Genoa
//   ARA Crown of Aragon                          PAP Papal States
//                                                SIC Kingdom of Sicily
const SPECS: readonly Spec[] = [
  // ── British Isles ──────────────────────────────────────────────────
  // Northumbria + Yorkshire are northern English. Wales is welsh-cultured.
  // Cornwall is south-western. Wessex is the heartland and ENG capital.
  { id: 'prov_wales', name: 'Wales', col: 3, row: 2,
    cultureId: 'welsh', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'wool', terrain: 'hills', climate: 'temperate',
    regionId: 'british_isles', isCoastal: true,
    development: { tax: 2, production: 3, manpower: 3 },
    population: 80_000 },
  { id: 'prov_northumbria', name: 'Northumbria', col: 4, row: 2,
    cultureId: 'anglo_saxon', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'wool', terrain: 'hills', climate: 'temperate',
    regionId: 'british_isles', isCoastal: true,
    development: { tax: 3, production: 3, manpower: 4 } },
  { id: 'prov_yorkshire', name: 'Yorkshire', col: 5, row: 2,
    cultureId: 'anglo_saxon', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'wool', terrain: 'plains', climate: 'temperate',
    regionId: 'british_isles', isCoastal: true,
    development: { tax: 4, production: 4, manpower: 4 } },
  { id: 'prov_cornwall', name: 'Cornwall', col: 3, row: 3,
    cultureId: 'welsh', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'fish', terrain: 'hills', climate: 'temperate',
    regionId: 'british_isles', isCoastal: true,
    development: { tax: 2, production: 3, manpower: 2 } },
  { id: 'prov_wessex', name: 'Wessex', col: 4, row: 3,
    cultureId: 'anglo_saxon', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'grain', terrain: 'plains', climate: 'temperate',
    regionId: 'british_isles', isCoastal: true, isCapital: true,
    fortLevel: 2, population: 120_000,
    development: { tax: 6, production: 5, manpower: 5 } },
  { id: 'prov_mercia', name: 'Mercia', col: 5, row: 3,
    cultureId: 'anglo_saxon', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'grain', terrain: 'plains', climate: 'temperate',
    regionId: 'british_isles',
    development: { tax: 5, production: 5, manpower: 4 } },

  // ── Low Countries ──────────────────────────────────────────────────
  { id: 'prov_flanders', name: 'Flanders', col: 6, row: 3,
    cultureId: 'dutch', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'cloth', terrain: 'plains', climate: 'temperate',
    regionId: 'low_countries', isCoastal: true,
    development: { tax: 7, production: 7, manpower: 4 },
    population: 130_000,
    claimNationIds: ['ENG'] },
  { id: 'prov_frisia', name: 'Frisia', col: 7, row: 3,
    cultureId: 'dutch', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'fish', terrain: 'marsh', climate: 'temperate',
    regionId: 'low_countries', isCoastal: true,
    development: { tax: 3, production: 3, manpower: 2 } },
  { id: 'prov_saxony', name: 'Saxony', col: 8, row: 3,
    cultureId: 'german', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'iron', terrain: 'forest', climate: 'continental',
    regionId: 'germany',
    development: { tax: 4, production: 5, manpower: 4 } },

  // ── France (kingdom) and Angevin Empire ────────────────────────────
  // Anjou and Aquitaine are Plantagenet holdings in 1200 — the French
  // throne has claims on both (the historical setup for Philip II's
  // war against John of England).
  { id: 'prov_brittany', name: 'Brittany', col: 3, row: 4,
    cultureId: 'frankish', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'fish', terrain: 'hills', climate: 'temperate',
    regionId: 'france', isCoastal: true,
    development: { tax: 3, production: 3, manpower: 3 } },
  { id: 'prov_normandy', name: 'Normandy', col: 4, row: 4,
    cultureId: 'norman', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'grain', terrain: 'plains', climate: 'temperate',
    regionId: 'france', isCoastal: true,
    fortLevel: 2,
    development: { tax: 5, production: 5, manpower: 4 },
    claimNationIds: ['FRA'] },
  { id: 'prov_ile_de_france', name: 'Île-de-France', col: 5, row: 4,
    cultureId: 'frankish', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'grain', terrain: 'plains', climate: 'temperate',
    regionId: 'france', isCapital: true, fortLevel: 2,
    population: 110_000,
    development: { tax: 6, production: 5, manpower: 5 } },
  { id: 'prov_champagne', name: 'Champagne', col: 6, row: 4,
    cultureId: 'frankish', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'wine', terrain: 'plains', climate: 'temperate',
    regionId: 'france',
    development: { tax: 5, production: 5, manpower: 4 } },
  { id: 'prov_lotharingia', name: 'Lotharingia', col: 7, row: 4,
    cultureId: 'german', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'iron', terrain: 'hills', climate: 'temperate',
    regionId: 'germany',
    development: { tax: 4, production: 5, manpower: 4 } },
  { id: 'prov_swabia', name: 'Swabia', col: 8, row: 4,
    cultureId: 'german', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'iron', terrain: 'hills', climate: 'continental',
    regionId: 'germany',
    development: { tax: 4, production: 4, manpower: 4 } },
  { id: 'prov_bavaria', name: 'Bavaria', col: 9, row: 4,
    cultureId: 'german', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'grain', terrain: 'hills', climate: 'continental',
    regionId: 'germany',
    development: { tax: 4, production: 4, manpower: 4 } },

  { id: 'prov_anjou', name: 'Anjou', col: 3, row: 5,
    cultureId: 'frankish', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'wine', terrain: 'plains', climate: 'temperate',
    regionId: 'france', isCoastal: true,
    development: { tax: 4, production: 4, manpower: 3 },
    claimNationIds: ['FRA'] },
  { id: 'prov_orleans', name: 'Orléans', col: 4, row: 5,
    cultureId: 'frankish', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'grain', terrain: 'plains', climate: 'temperate',
    regionId: 'france',
    development: { tax: 5, production: 4, manpower: 4 } },
  { id: 'prov_burgundy', name: 'Burgundy', col: 5, row: 5,
    cultureId: 'frankish', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'wine', terrain: 'hills', climate: 'temperate',
    regionId: 'france',
    development: { tax: 5, production: 5, manpower: 4 } },
  { id: 'prov_switzerland', name: 'Helvetia', col: 6, row: 5,
    cultureId: 'german', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'livestock', terrain: 'mountains', climate: 'continental',
    regionId: 'germany',
    development: { tax: 2, production: 2, manpower: 3 } },

  // ── Italy ──────────────────────────────────────────────────────────
  // Lombardy is the HRE Kingdom of Italy. Venice and Genoa are merchant
  // republics with their own capitals. Tuscany is loosely under Papal
  // suzerainty for v0.1. Naples is the mainland half of the Kingdom of
  // Sicily; Sicily proper is Frederick II's island throne.
  { id: 'prov_piedmont', name: 'Piedmont', col: 7, row: 5,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'livestock', terrain: 'mountains', climate: 'continental',
    regionId: 'italy',
    development: { tax: 3, production: 3, manpower: 3 } },
  { id: 'prov_lombardy', name: 'Lombardy', col: 8, row: 5,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'cloth', terrain: 'plains', climate: 'mediterranean',
    regionId: 'italy',
    development: { tax: 7, production: 7, manpower: 5 },
    claimNationIds: ['VEN'] },
  { id: 'prov_venice', name: 'Venice', col: 9, row: 5,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'VEN',
    tradeGoodId: 'cloth', terrain: 'coastal', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true, isCapital: true, fortLevel: 3,
    development: { tax: 8, production: 7, manpower: 4 },
    population: 80_000 },
  { id: 'prov_genoa', name: 'Genoa', col: 6, row: 6,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'GEN',
    tradeGoodId: 'cloth', terrain: 'coastal', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true, isCapital: true, fortLevel: 3,
    development: { tax: 7, production: 6, manpower: 3 },
    population: 60_000 },
  { id: 'prov_tuscany', name: 'Tuscany', col: 7, row: 6,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'PAP',
    tradeGoodId: 'wine', terrain: 'hills', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true,
    development: { tax: 6, production: 5, manpower: 3 } },
  { id: 'prov_lazio', name: 'Lazio', col: 8, row: 6,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'PAP',
    tradeGoodId: 'wine', terrain: 'hills', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true, isCapital: true, fortLevel: 2,
    isPilgrimageSite: true, pilgrimageSiteFaith: 'catholic',
    development: { tax: 5, production: 4, manpower: 3 },
    population: 70_000 },
  { id: 'prov_naples', name: 'Naples', col: 9, row: 6,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'SIC',
    tradeGoodId: 'grain', terrain: 'hills', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true,
    development: { tax: 6, production: 5, manpower: 4 } },
  { id: 'prov_sicily', name: 'Sicily', col: 9, row: 7,
    cultureId: 'sicilian', religionId: 'catholic', controllerId: 'SIC',
    tradeGoodId: 'grain', terrain: 'hills', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true, isCapital: true, fortLevel: 2,
    development: { tax: 6, production: 6, manpower: 4 } },

  // ── Iberia ─────────────────────────────────────────────────────────
  // León and Castile are unified under Alfonso VIII for v0.1 simplicity
  // (historically separate until 1230). The Almohads still hold the
  // south (Andalusia, Valencia) and the Reconquista is the live story.
  { id: 'prov_portugal', name: 'Portugal', col: 0, row: 6,
    cultureId: 'portuguese', religionId: 'catholic', controllerId: 'POR',
    tradeGoodId: 'fish', terrain: 'hills', climate: 'mediterranean',
    regionId: 'iberia', isCoastal: true, isCapital: true,
    development: { tax: 4, production: 4, manpower: 3 } },
  { id: 'prov_galicia', name: 'Galicia', col: 1, row: 6,
    cultureId: 'castilian', religionId: 'catholic', controllerId: 'CAS',
    tradeGoodId: 'fish', terrain: 'hills', climate: 'temperate',
    regionId: 'iberia', isCoastal: true,
    isPilgrimageSite: true, pilgrimageSiteFaith: 'catholic',
    development: { tax: 3, production: 3, manpower: 3 } },
  { id: 'prov_leon', name: 'León', col: 2, row: 6,
    cultureId: 'castilian', religionId: 'catholic', controllerId: 'CAS',
    tradeGoodId: 'wool', terrain: 'plains', climate: 'mediterranean',
    regionId: 'iberia',
    development: { tax: 4, production: 4, manpower: 4 } },
  { id: 'prov_andalusia', name: 'Andalusia', col: 1, row: 7,
    cultureId: 'andalusian', religionId: 'sunni', controllerId: 'ALM',
    tradeGoodId: 'wine', terrain: 'hills', climate: 'mediterranean',
    regionId: 'iberia', isCoastal: true, isCapital: true, fortLevel: 3,
    development: { tax: 7, production: 6, manpower: 4 },
    claimNationIds: ['CAS', 'POR'],
    population: 150_000 },
  { id: 'prov_valencia', name: 'Valencia', col: 2, row: 7,
    cultureId: 'andalusian', religionId: 'sunni', controllerId: 'ALM',
    tradeGoodId: 'wine', terrain: 'plains', climate: 'mediterranean',
    regionId: 'iberia', isCoastal: true,
    development: { tax: 6, production: 5, manpower: 3 },
    claimNationIds: ['ARA'] },
  { id: 'prov_castile', name: 'Castile', col: 3, row: 7,
    cultureId: 'castilian', religionId: 'catholic', controllerId: 'CAS',
    tradeGoodId: 'wool', terrain: 'plains', climate: 'mediterranean',
    regionId: 'iberia', isCapital: true, fortLevel: 2,
    development: { tax: 5, production: 5, manpower: 5 } },
  { id: 'prov_aragon', name: 'Aragon', col: 4, row: 7,
    cultureId: 'catalan', religionId: 'catholic', controllerId: 'ARA',
    tradeGoodId: 'grain', terrain: 'hills', climate: 'mediterranean',
    regionId: 'iberia', isCapital: true,
    development: { tax: 4, production: 4, manpower: 4 } },
  { id: 'prov_catalonia', name: 'Catalonia', col: 5, row: 7,
    cultureId: 'catalan', religionId: 'catholic', controllerId: 'ARA',
    tradeGoodId: 'cloth', terrain: 'hills', climate: 'mediterranean',
    regionId: 'iberia', isCoastal: true,
    development: { tax: 5, production: 5, manpower: 3 } },

  // ── Southern France ────────────────────────────────────────────────
  { id: 'prov_aquitaine', name: 'Aquitaine', col: 3, row: 6,
    cultureId: 'occitan', religionId: 'catholic', controllerId: 'ENG',
    tradeGoodId: 'wine', terrain: 'plains', climate: 'temperate',
    regionId: 'france', isCoastal: true,
    development: { tax: 6, production: 6, manpower: 4 },
    claimNationIds: ['FRA'] },
  { id: 'prov_toulouse', name: 'Toulouse', col: 4, row: 6,
    cultureId: 'occitan', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'grain', terrain: 'hills', climate: 'mediterranean',
    regionId: 'france',
    development: { tax: 4, production: 4, manpower: 3 } },
  { id: 'prov_provence', name: 'Provence', col: 5, row: 6,
    cultureId: 'occitan', religionId: 'catholic', controllerId: 'FRA',
    tradeGoodId: 'wine', terrain: 'hills', climate: 'mediterranean',
    regionId: 'france', isCoastal: true,
    development: { tax: 5, production: 4, manpower: 3 } },

  // ── Mediterranean islands and northern HRE ──────────────────────────
  // Corsica and Sardinia are Genoese-Pisan in 1200; for v0.1 simplicity
  // both sit under GEN. Holstein anchors the HRE's North Sea coast.
  { id: 'prov_corsica', name: 'Corsica', col: 6, row: 7,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'GEN',
    tradeGoodId: 'wood', terrain: 'mountains', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true,
    development: { tax: 2, production: 2, manpower: 2 } },
  { id: 'prov_sardinia', name: 'Sardinia', col: 7, row: 7,
    cultureId: 'italian', religionId: 'catholic', controllerId: 'GEN',
    tradeGoodId: 'salt', terrain: 'hills', climate: 'mediterranean',
    regionId: 'italy', isCoastal: true,
    development: { tax: 2, production: 3, manpower: 2 },
    claimNationIds: ['ARA'] },
  { id: 'prov_holstein', name: 'Holstein', col: 9, row: 3,
    cultureId: 'german', religionId: 'catholic', controllerId: 'HRE',
    tradeGoodId: 'fish', terrain: 'plains', climate: 'temperate',
    regionId: 'germany', isCoastal: true,
    development: { tax: 3, production: 3, manpower: 3 } },
];

// ──────────────────────────────────────────────────────────────────
// Path / position / adjacency builders
// ──────────────────────────────────────────────────────────────────

function cellPath(col: number, row: number): string {
  const x = col * CELL;
  const y = row * CELL;
  return `M ${x} ${y} L ${x + CELL} ${y} L ${x + CELL} ${y + CELL} L ${x} ${y + CELL} Z`;
}

function cellCenter(col: number, row: number): { x: number; y: number } {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

function buildAdjacencies(specs: readonly Spec[]): Map<string, string[]> {
  const byCell = new Map<string, string>();
  for (const s of specs) byCell.set(`${s.col},${s.row}`, s.id);

  const result = new Map<string, string[]>();
  for (const s of specs) {
    const candidates: Array<[number, number]> = [
      [s.col - 1, s.row],
      [s.col + 1, s.row],
      [s.col, s.row - 1],
      [s.col, s.row + 1],
    ];
    const adj: string[] = [];
    for (const [c, r] of candidates) {
      const n = byCell.get(`${c},${r}`);
      if (n) adj.push(n);
    }
    result.set(s.id, adj);
  }
  return result;
}

// Hand-authored naval-adjacency overlay. Coastal provinces with a sea
// connection that the cell grid can't express (the English Channel, the
// Tyrrhenian Sea, Strait of Gibraltar, etc.).
const NAVAL_PAIRS: ReadonlyArray<readonly [string, string]> = [
  // English Channel
  ['prov_wessex', 'prov_normandy'],
  ['prov_wessex', 'prov_brittany'],
  ['prov_cornwall', 'prov_brittany'],
  ['prov_yorkshire', 'prov_flanders'],
  // Bay of Biscay
  ['prov_brittany', 'prov_aquitaine'],
  ['prov_aquitaine', 'prov_galicia'],
  // Western Mediterranean
  ['prov_provence', 'prov_genoa'],
  ['prov_catalonia', 'prov_valencia'],
  ['prov_catalonia', 'prov_genoa'],
  ['prov_valencia', 'prov_andalusia'],
  // Tyrrhenian / Italian seas
  ['prov_genoa', 'prov_tuscany'],
  ['prov_tuscany', 'prov_lazio'],
  ['prov_lazio', 'prov_naples'],
  ['prov_naples', 'prov_sicily'],
];

function buildNavalAdjacencies(): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const [a, b] of NAVAL_PAIRS) {
    (m.get(a) ?? m.set(a, []).get(a))!.push(b);
    (m.get(b) ?? m.set(b, []).get(b))!.push(a);
  }
  return m;
}

// ──────────────────────────────────────────────────────────────────
// Final province array
// ──────────────────────────────────────────────────────────────────

const ADJ = buildAdjacencies(SPECS);
const NAVAL = buildNavalAdjacencies();

function specToProvince(s: Spec): Province {
  return {
    id: s.id,
    name: s.name,
    position: cellCenter(s.col, s.row),
    pathData: cellPath(s.col, s.row),
    adjacencies: ADJ.get(s.id) ?? [],
    navalAdjacencies: NAVAL.get(s.id) ?? [],
    regionId: s.regionId,
    terrain: s.terrain,
    climate: s.climate,
    development: s.development ?? { tax: 4, production: 4, manpower: 4 },
    population: s.population ?? 60_000,
    cultureId: s.cultureId,
    religionId: s.religionId,
    controllerId: s.controllerId,
    occupierId: null,
    coreNationIds: s.coreNationIds ?? [s.controllerId],
    claimNationIds: s.claimNationIds ?? [],
    tradeGoodId: s.tradeGoodId,
    buildings: [],
    fortificationLevel: s.fortLevel ?? 1,
    estateOwnership: {},
    unrest: 0,
    culturalInfluencePresent: {},
    institutions: { feudalism: 1 },
    beingDeveloped: false,
    beingConverted: false,
    conversionTargetReligionId: null,
    promotionTargetCultureId: null,
    conversionProgress: 0,
    promotionProgress: 0,
    isCapital: s.isCapital ?? false,
    isPilgrimageSite: s.isPilgrimageSite ?? false,
    pilgrimageSiteFaith: s.pilgrimageSiteFaith ?? null,
    isCoastal: s.isCoastal ?? false,
    navalCapacity: s.isCoastal ? 2 : 0,
    manpowerPool: { current: 1000, max: 1000, regenRate: 50 },
    monthlyIncome: 0,
  };
}

export const PROVINCES: readonly Province[] = SPECS.map(specToProvince);

export const PROVINCES_BY_ID: Readonly<Record<string, Province>> = (() => {
  const map: Record<string, Province> = {};
  for (const p of PROVINCES) map[p.id] = p;
  return map;
})();
