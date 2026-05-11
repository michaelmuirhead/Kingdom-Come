/**
 * Content loader — single entry point for validating and exposing every
 * authored content module. The runtime loader (loadCampaign.ts) and the
 * CLI validator (scripts/validateContent.ts) both consume this so dev
 * and CI fail loudly on the same conditions.
 */

import type {
  Character,
  Dynasty,
  Nation,
  Province,
} from '@/types';
import { PROVINCES } from '@/data/provinces';
import { NATIONS } from '@/data/nations';
import { CHARACTERS, DYNASTIES } from '@/data/characters';
import { ProvinceSchema } from '@/data/schemas/province';
import { NationSchema } from '@/data/schemas/nation';
import {
  CharacterSchema,
  DynastySchema,
} from '@/data/schemas/character';

export interface ContentBundle {
  provinces: readonly Province[];
  nations: readonly Nation[];
  characters: readonly Character[];
  dynasties: readonly Dynasty[];
}

export interface ContentIssue {
  kind: 'province' | 'nation' | 'character' | 'dynasty' | 'cross';
  entityId: string;
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  issues: ContentIssue[];
}

/**
 * Validate all content against its Zod schemas plus cross-reference
 * integrity. Pure function — does not throw, returns a structured report.
 */
export function validateContent(
  bundle: ContentBundle = loadContent(),
): ValidationReport {
  const issues: ContentIssue[] = [];

  for (const p of bundle.provinces) {
    const r = ProvinceSchema.safeParse(p);
    if (!r.success) {
      issues.push({
        kind: 'province',
        entityId: p.id,
        message: r.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      });
    }
  }

  for (const n of bundle.nations) {
    const r = NationSchema.safeParse(n);
    if (!r.success) {
      issues.push({
        kind: 'nation',
        entityId: n.id,
        message: r.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      });
    }
  }

  for (const c of bundle.characters) {
    const r = CharacterSchema.safeParse(c);
    if (!r.success) {
      issues.push({
        kind: 'character',
        entityId: c.id,
        message: r.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      });
    }
  }

  for (const d of bundle.dynasties) {
    const r = DynastySchema.safeParse(d);
    if (!r.success) {
      issues.push({
        kind: 'dynasty',
        entityId: d.id,
        message: r.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      });
    }
  }

  // ── Cross-references ──────────────────────────────────────────────
  const nationIds = new Set(bundle.nations.map((n) => n.id));
  const provinceIds = new Set(bundle.provinces.map((p) => p.id));
  const characterIds = new Set(bundle.characters.map((c) => c.id));
  const dynastyIds = new Set(bundle.dynasties.map((d) => d.id));

  for (const p of bundle.provinces) {
    if (!nationIds.has(p.controllerId)) {
      issues.push({
        kind: 'cross',
        entityId: p.id,
        message: `controllerId ${p.controllerId} does not exist`,
      });
    }
    for (const claimId of p.claimNationIds) {
      if (!nationIds.has(claimId)) {
        issues.push({
          kind: 'cross',
          entityId: p.id,
          message: `claim references unknown nation ${claimId}`,
        });
      }
    }
    for (const adjId of p.adjacencies) {
      if (!provinceIds.has(adjId)) {
        issues.push({
          kind: 'cross',
          entityId: p.id,
          message: `adjacency ${adjId} unknown`,
        });
      }
    }
  }

  for (const n of bundle.nations) {
    if (!characterIds.has(n.rulerId)) {
      issues.push({
        kind: 'cross',
        entityId: n.id,
        message: `rulerId ${n.rulerId} does not exist`,
      });
    }
    if (!dynastyIds.has(n.dynastyId)) {
      issues.push({
        kind: 'cross',
        entityId: n.id,
        message: `dynastyId ${n.dynastyId} does not exist`,
      });
    }
    for (const r of n.rivals) {
      if (!nationIds.has(r)) {
        issues.push({
          kind: 'cross',
          entityId: n.id,
          message: `rival ${r} unknown`,
        });
      }
    }
    for (const a of n.ambitions) {
      for (const pid of a.targetProvinceIds ?? []) {
        if (!provinceIds.has(pid)) {
          issues.push({
            kind: 'cross',
            entityId: n.id,
            message: `ambition ${a.id} targets unknown province ${pid}`,
          });
        }
      }
    }
  }

  for (const c of bundle.characters) {
    if (!dynastyIds.has(c.dynastyId)) {
      issues.push({
        kind: 'cross',
        entityId: c.id,
        message: `dynastyId ${c.dynastyId} unknown`,
      });
    }
    if (!provinceIds.has(c.position.locationProvinceId)) {
      issues.push({
        kind: 'cross',
        entityId: c.id,
        message: `location province ${c.position.locationProvinceId} unknown`,
      });
    }
    if (
      c.position.nationId !== null &&
      !nationIds.has(c.position.nationId)
    ) {
      issues.push({
        kind: 'cross',
        entityId: c.id,
        message: `nation ${c.position.nationId} unknown`,
      });
    }
    const familyRefs = [
      c.family.fatherId,
      c.family.motherId,
      c.family.spouseId,
      ...c.family.exSpouseIds,
      ...c.family.childIds,
      ...c.family.legitimateChildIds,
      ...c.family.bastardIds,
      ...c.family.siblingIds,
    ].filter((id): id is string => id !== null);
    for (const refId of familyRefs) {
      if (!characterIds.has(refId)) {
        issues.push({
          kind: 'cross',
          entityId: c.id,
          message: `family reference ${refId} unknown`,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Load (don't validate) all authored content. Today this just exposes
 * the typed exports from /src/data; in future versions it might pull
 * from per-entity JSON files or a remote bundle.
 */
export function loadContent(): ContentBundle {
  return {
    provinces: PROVINCES,
    nations: NATIONS,
    characters: CHARACTERS,
    dynasties: DYNASTIES,
  };
}
