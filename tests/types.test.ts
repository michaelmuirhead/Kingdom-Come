import { describe, it, expectTypeOf } from 'vitest';
import type {
  Ambition,
  AmbitionType,
  Army,
  Battle,
  CasusBelliType,
  Character,
  CourtRole,
  Dynasty,
  EducationFocus,
  ExpenseBreakdown,
  Fleet,
  GameDate,
  GovernmentType,
  IdeologyVector,
  IncomeBreakdown,
  MapMode,
  Nation,
  OpinionEntry,
  Province,
  Regiment,
  Siege,
  SuccessionLaw,
  TechTreeId,
  Treaty,
  TreatyType,
  UIState,
  War,
  WarGoal,
  WorldState,
} from '@/types';

describe('types/common', () => {
  it('GameDate fields are all required numbers', () => {
    expectTypeOf<GameDate['year']>().toEqualTypeOf<number>();
    expectTypeOf<GameDate['month']>().toEqualTypeOf<number>();
    expectTypeOf<GameDate['day']>().toEqualTypeOf<number>();
  });
});

describe('types/province', () => {
  it('Province has required core fields', () => {
    expectTypeOf<Province>().toHaveProperty('id');
    expectTypeOf<Province>().toHaveProperty('name');
    expectTypeOf<Province>().toHaveProperty('controllerId');
    expectTypeOf<Province>().toHaveProperty('development');
    expectTypeOf<Province>().toHaveProperty('manpowerPool');
    expectTypeOf<Province['adjacencies']>().toEqualTypeOf<string[]>();
  });

  it('occupierId is nullable', () => {
    expectTypeOf<Province['occupierId']>().toEqualTypeOf<string | null>();
  });

  it('development is the three-sub-stat shape', () => {
    expectTypeOf<Province['development']>().toEqualTypeOf<{
      tax: number;
      production: number;
      manpower: number;
    }>();
  });
});

describe('types/nation', () => {
  it('Nation requires identity + treasury fields', () => {
    expectTypeOf<Nation>().toHaveProperty('id');
    expectTypeOf<Nation>().toHaveProperty('tag');
    expectTypeOf<Nation>().toHaveProperty('treasury');
    expectTypeOf<Nation>().toHaveProperty('ideologyVector');
    expectTypeOf<Nation>().toHaveProperty('rulerId');
    expectTypeOf<Nation>().toHaveProperty('successionLaw');
  });

  it('IdeologyVector has exactly the seven axes', () => {
    expectTypeOf<IdeologyVector>().toEqualTypeOf<{
      militaristPacifist: number;
      mercantileAgrarian: number;
      theocraticSecular: number;
      openIsolationist: number;
      aristocraticPopulist: number;
      traditionalProgressive: number;
      centralistFederalist: number;
    }>();
  });

  it('techLevels is keyed by all five TechTreeIds', () => {
    expectTypeOf<Nation['techLevels']>().toEqualTypeOf<
      Record<TechTreeId, number>
    >();
  });

  it('IncomeBreakdown and ExpenseBreakdown share a total', () => {
    expectTypeOf<IncomeBreakdown['total']>().toEqualTypeOf<number>();
    expectTypeOf<ExpenseBreakdown['total']>().toEqualTypeOf<number>();
  });

  it('GovernmentType and SuccessionLaw are non-empty unions', () => {
    expectTypeOf<GovernmentType>().not.toBeAny();
    expectTypeOf<SuccessionLaw>().not.toBeAny();
  });

  it('Ambition uses AmbitionType', () => {
    expectTypeOf<Ambition['type']>().toEqualTypeOf<AmbitionType>();
  });

  it('Dynasty is the v0.1 minimal shape', () => {
    expectTypeOf<Dynasty>().toHaveProperty('id');
    expectTypeOf<Dynasty>().toHaveProperty('foundingDate');
    expectTypeOf<Dynasty>().toHaveProperty('foundingCharacterId');
  });
});

describe('types/character', () => {
  it('Character has the six-stat block', () => {
    expectTypeOf<Character['stats']>().toEqualTypeOf<{
      diplomacy: number;
      stewardship: number;
      martial: number;
      intrigue: number;
      learning: number;
      piety: number;
    }>();
  });

  it('deathDate is nullable', () => {
    expectTypeOf<Character['deathDate']>().toEqualTypeOf<GameDate | null>();
  });

  it('CourtRole and EducationFocus unions exist', () => {
    expectTypeOf<CourtRole>().not.toBeAny();
    expectTypeOf<EducationFocus>().not.toBeAny();
  });
});

describe('types/army', () => {
  it('Army composition uses Regiment[]', () => {
    expectTypeOf<Army['regiments']>().toEqualTypeOf<Regiment[]>();
  });

  it('Battle, Siege, Fleet exist with required ids', () => {
    expectTypeOf<Battle>().toHaveProperty('id');
    expectTypeOf<Siege>().toHaveProperty('id');
    expectTypeOf<Fleet>().toHaveProperty('id');
  });
});

describe('types/war + treaty', () => {
  it('CasusBelliType is a string literal union (not any)', () => {
    expectTypeOf<CasusBelliType>().not.toBeAny();
  });

  it('War tracks warScore + warGoals', () => {
    expectTypeOf<War['warScore']>().toEqualTypeOf<number>();
    expectTypeOf<War['warGoals']>().toEqualTypeOf<WarGoal[]>();
  });

  it('Treaty has a TreatyType discriminant', () => {
    expectTypeOf<Treaty['type']>().toEqualTypeOf<TreatyType>();
  });

  it('OpinionEntry value is -200..200 (just number at the type level)', () => {
    expectTypeOf<OpinionEntry['value']>().toEqualTypeOf<number>();
  });
});

describe('types/world + ui', () => {
  it('WorldState tracks speed + paused + monthsPlayed', () => {
    expectTypeOf<WorldState>().toHaveProperty('currentDate');
    expectTypeOf<WorldState>().toHaveProperty('speedSetting');
    expectTypeOf<WorldState>().toHaveProperty('isPaused');
    expectTypeOf<WorldState>().toHaveProperty('monthsPlayed');
  });

  it('UIState selectors are all nullable IDs', () => {
    expectTypeOf<UIState['selectedProvinceId']>().toEqualTypeOf<string | null>();
    expectTypeOf<UIState['selectedNationId']>().toEqualTypeOf<string | null>();
    expectTypeOf<UIState['selectedCharacterId']>().toEqualTypeOf<string | null>();
    expectTypeOf<UIState['openDrawer']>().not.toBeAny();
  });

  it('MapMode includes the v0.1 minimum modes', () => {
    expectTypeOf<'political' | 'terrain' | 'trade'>().toMatchTypeOf<MapMode>();
  });
});

describe('runtime construction', () => {
  it('A minimal IdeologyVector literal type-checks', () => {
    const v: IdeologyVector = {
      militaristPacifist: 0,
      mercantileAgrarian: 0,
      theocraticSecular: 0,
      openIsolationist: 0,
      aristocraticPopulist: 0,
      traditionalProgressive: 0,
      centralistFederalist: 0,
    };
    expectTypeOf(v).toEqualTypeOf<IdeologyVector>();
  });
});
