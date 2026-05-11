import { describe, it, expect, beforeEach } from 'vitest';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { militaryTick } from '@/engine/military/tick';
import { resolveBattle } from '@/engine/orchestrator';
import { createRNG } from '@/lib/rng';
import {
  useMilitaryStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
} from '@/stores';
import type { Army, War } from '@/types';

function makeArmy(over: Partial<Army> & { id: string; nationId: string; provinceId: string }): Army {
  const { id, nationId, provinceId, name, regiments, ...rest } = over;
  return {
    id,
    nationId,
    provinceId,
    name: name ?? `Army ${id}`,
    regiments: regiments ?? [
      { id: `${id}_r1`, unitType: 'levy', size: 1000, experience: 0 },
    ],
    movementTarget: null,
    movementProgress: 0,
    generalId: null,
    morale: 100,
    organization: 100,
    attritionMonth: 0,
    inBattle: null,
    inSiege: null,
    isEmbarked: false,
    embarkedOnFleetId: null,
    ...rest,
  };
}

function makeWar(over: Partial<War> & { id: string }): War {
  const { id, ...rest } = over;
  return {
    id,
    name: 'Anglo-French War',
    startDate: { year: 1200, month: 1, day: 1 },
    endDate: null,
    attackers: ['FRA'],
    defenders: ['ENG'],
    warLeader: { attacker: 'FRA', defender: 'ENG' },
    warGoals: [],
    casusBelli: 'conquest',
    warScore: 0,
    battlesIds: [],
    siegesIds: [],
    occupiedProvinces: [],
    ...rest,
  };
}

describe('war outcome integration', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'war-integration' });
  });

  it('moves a French army across the channel into Normandy and resolves combat', () => {
    // Declare war.
    useMilitaryStore.getState().declareWar(makeWar({ id: 'w_anglo_french' }));

    // Place a strong French army in Île-de-France, then move it into Normandy.
    useMilitaryStore.getState().createArmy(
      makeArmy({
        id: 'fra_army',
        nationId: 'FRA',
        provinceId: 'prov_ile_de_france',
        regiments: [
          { id: 'r1', unitType: 'levy', size: 1500, experience: 0 },
        ],
      }),
    );
    // English defender already in Normandy.
    useMilitaryStore.getState().createArmy(
      makeArmy({
        id: 'eng_army',
        nationId: 'ENG',
        provinceId: 'prov_normandy',
        regiments: [
          { id: 'r2', unitType: 'levy', size: 700, experience: 0 },
        ],
      }),
    );

    // Start moving — Normandy is plains, so movement completes in 1 tick.
    useMilitaryStore.getState().moveArmy('fra_army', 'prov_normandy');
    militaryTick();

    // Battle should have resolved: stronger French army wins; Normandy is
    // now occupied by FRA.
    const normandy = useProvinceStore.getState().provinces.prov_normandy;
    expect(normandy?.occupierId).toBe('FRA');

    // English defender was outmatched 2:1 — should have retreated or been
    // disbanded. Either way it should no longer hold prov_normandy.
    const engArmy = useMilitaryStore.getState().armies.eng_army;
    if (engArmy) {
      expect(engArmy.provinceId).not.toBe('prov_normandy');
    }
  });

  it('applies casualties to nation manpower', () => {
    useMilitaryStore.getState().declareWar(makeWar({ id: 'w' }));
    useMilitaryStore.getState().createArmy(
      makeArmy({
        id: 'fra_army',
        nationId: 'FRA',
        provinceId: 'prov_normandy',
        regiments: [{ id: 'r1', unitType: 'levy', size: 1000, experience: 0 }],
      }),
    );
    useMilitaryStore.getState().createArmy(
      makeArmy({
        id: 'eng_army',
        nationId: 'ENG',
        provinceId: 'prov_normandy',
        regiments: [{ id: 'r2', unitType: 'levy', size: 1000, experience: 0 }],
      }),
    );
    const beforeFRA = useNationStore.getState().nations.FRA?.manpower ?? 0;
    const beforeENG = useNationStore.getState().nations.ENG?.manpower ?? 0;

    const world = useWorldStore.getState();
    resolveBattle(
      'prov_normandy',
      'ENG', // sort puts ENG before FRA alphabetically
      'FRA',
      createRNG('explicit-battle'),
      world.currentDate,
    );

    const afterFRA = useNationStore.getState().nations.FRA?.manpower ?? 0;
    const afterENG = useNationStore.getState().nations.ENG?.manpower ?? 0;
    expect(afterFRA).toBeLessThan(beforeFRA);
    expect(afterENG).toBeLessThan(beforeENG);
  });

  it('destroys the loser when no friendly retreat province exists', () => {
    useMilitaryStore.getState().declareWar(makeWar({ id: 'w2' }));
    // Burgundy is surrounded by FRA + HRE provinces — no adjacent
    // ENG-controlled territory for an English raid to retreat to.
    useMilitaryStore.getState().createArmy(
      makeArmy({
        id: 'eng_doomed',
        nationId: 'ENG',
        provinceId: 'prov_burgundy',
        regiments: [{ id: 'r', unitType: 'levy', size: 50, experience: 0 }],
      }),
    );
    useMilitaryStore.getState().createArmy(
      makeArmy({
        id: 'fra_huge',
        nationId: 'FRA',
        provinceId: 'prov_burgundy',
        regiments: [{ id: 'r2', unitType: 'levy', size: 3000, experience: 0 }],
      }),
    );

    resolveBattle(
      'prov_burgundy',
      'ENG',
      'FRA',
      createRNG('no-retreat'),
      useWorldStore.getState().currentDate,
    );

    // English army should be gone — no friendly retreat available.
    expect(useMilitaryStore.getState().armies.eng_doomed).toBeUndefined();
  });
});
