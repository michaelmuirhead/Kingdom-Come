/**
 * Simple SVG path helpers for hand-drawn province polygons.
 *
 * Supports a deliberately tiny subset of the SVG path mini-language —
 * absolute moveto (M) and lineto (L), plus close (Z). That's all v0.1
 * hand-drawn province paths need. Curves and relative commands can be
 * added later if our authoring pipeline ever produces them.
 *
 * Used for centroid placement, hit-testing tap → province, and viewport
 * culling in later versions.
 */

import type { Position } from '@/types';

export interface BoundingBox {
  min: Position;
  max: Position;
}

/**
 * Parse an absolute M/L/Z SVG path into a flat list of vertices. Throws
 * on unsupported commands so we don't silently miss curves.
 */
export function parsePath(pathD: string): Position[] {
  // Match any letter (so unsupported commands are surfaced and rejected
  // explicitly rather than silently dropped) or a signed decimal.
  const tokenRegex = /([A-Za-z])|(-?\d+(?:\.\d+)?)/g;
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(pathD)) !== null) {
    tokens.push(match[0]);
  }

  const verts: Position[] = [];
  let i = 0;
  let lastCmd: 'M' | 'L' | '' = '';

  while (i < tokens.length) {
    const t = tokens[i];
    if (t === undefined) break;

    if (/^[A-Za-z]$/.test(t)) {
      const upper = t.toUpperCase();
      if (upper === 'Z') {
        i += 1;
        lastCmd = '';
        continue;
      }
      if (upper !== 'M' && upper !== 'L') {
        throw new Error(
          `parsePath: unsupported SVG path command "${t}" — only M, L, Z are handled`,
        );
      }
      if (t !== upper) {
        throw new Error(
          `parsePath: relative command "${t}" not supported — use absolute M/L`,
        );
      }
      lastCmd = upper;
      i += 1;
      continue;
    }

    // Numeric token — pair with the next as (x, y). Use the most recently
    // seen command; SVG allows implicit repeats (M x y x y ≡ M x y L x y).
    const xRaw = tokens[i];
    const yRaw = tokens[i + 1];
    if (xRaw === undefined || yRaw === undefined) {
      throw new Error('parsePath: dangling coordinate without a pair');
    }
    if (!lastCmd) {
      throw new Error('parsePath: coordinate before any M/L command');
    }
    verts.push({ x: parseFloat(xRaw), y: parseFloat(yRaw) });
    i += 2;
    // After the first M's pair, implicit pairs behave as L.
    if (lastCmd === 'M') lastCmd = 'L';
  }

  return verts;
}

export function boundingBox(pathD: string): BoundingBox {
  const verts = parsePath(pathD);
  if (verts.length === 0) {
    throw new Error('boundingBox: empty path');
  }
  // We just validated length > 0; the first vertex is defined.
  const first = verts[0] as Position;
  let minX = first.x;
  let minY = first.y;
  let maxX = first.x;
  let maxY = first.y;
  for (let i = 1; i < verts.length; i++) {
    const v = verts[i] as Position;
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

/**
 * Centroid of the path's vertices (simple average — not the geometric
 * polygon centroid). Good enough for placing province labels and army
 * markers on hand-drawn polygons.
 */
export function centerOfPath(pathD: string): Position {
  const verts = parsePath(pathD);
  if (verts.length === 0) {
    throw new Error('centerOfPath: empty path');
  }
  let sx = 0;
  let sy = 0;
  for (const v of verts) {
    sx += v.x;
    sy += v.y;
  }
  return { x: sx / verts.length, y: sy / verts.length };
}

/**
 * Euclidean distance between two screen points. Used by the pinch-zoom
 * gesture handler to detect zoom factor between two touches.
 */
export function touchDistance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function midpoint(a: Position, b: Position): Position {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Ray-cast point-in-polygon. Treats the parsed vertices as a closed
 * polygon (Z is implied even if the path didn't include it).
 */
export function pointInPath(point: Position, pathD: string): boolean {
  const poly = parsePath(pathD);
  if (poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i++) {
    const a = poly[i] as Position;
    const b = poly[j] as Position;
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}
