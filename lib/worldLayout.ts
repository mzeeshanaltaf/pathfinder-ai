import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { PhaseId } from '@/data/roadmap';
import { BRIDGES, ISLAND_BY_ID, ISLANDS, type IslandDef } from '@/data/world';
import { hashString, mulberry32 } from '@/lib/random';

/** How far a bridge deck reaches into each island, so there is no gap at the rim. */
export const BRIDGE_OVERLAP = 1;
/** Half the walkable deck width. */
export const BRIDGE_HALF_WIDTH = 1.5;

/** Radial segments of the island top; low enough to read as low-poly. */
export const islandSegments = (radius: number) => (radius >= 18 ? 14 : radius >= 14 ? 12 : 10);

/** Inscribed radius of the polygonal top, so the collider never extends past the visible edge. */
export const islandWalkRadius = (radius: number) => radius * Math.cos(Math.PI / islandSegments(radius));

export interface BridgeLayout {
  key: string;
  from: IslandDef;
  to: IslandDef;
  /** Deck start (inside `from`) and end (inside `to`), at deck-top height. */
  start: Vector3;
  end: Vector3;
  length: number;
  /** Local frame: +Z along the deck towards `to`, +Y deck normal. */
  quaternion: Quaternion;
  rotation: [number, number, number];
}

export function computeBridge(from: IslandDef, to: IslandDef): BridgeLayout {
  const a = new Vector3(...from.position);
  const b = new Vector3(...to.position);
  const flatDir = new Vector3(b.x - a.x, 0, b.z - a.z).normalize();
  const start = a.clone().addScaledVector(flatDir, from.radius - BRIDGE_OVERLAP);
  const end = b.clone().addScaledVector(flatDir, -(to.radius - BRIDGE_OVERLAP));

  const forward = end.clone().sub(start);
  const length = forward.length();
  forward.normalize();
  const right = new Vector3(0, 1, 0).cross(forward).normalize();
  const up = forward.clone().cross(right).normalize();
  const quaternion = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, up, forward));
  const e = new Euler().setFromQuaternion(quaternion);

  return { key: `${from.id}->${to.id}`, from, to, start, end, length, quaternion, rotation: [e.x, e.y, e.z] };
}

export const BRIDGE_LAYOUTS: BridgeLayout[] = BRIDGES.map((b) => computeBridge(ISLAND_BY_ID[b.from], ISLAND_BY_ID[b.to]));

/** World-space XZ directions (unit vectors) from an island's centre towards each of its bridges. */
export function bridgeDirections(id: PhaseId): [number, number][] {
  const self = ISLAND_BY_ID[id];
  return BRIDGES.filter((b) => b.from === id || b.to === id).map((b) => {
    const other = ISLAND_BY_ID[b.from === id ? b.to : b.from];
    const dx = other.position[0] - self.position[0];
    const dz = other.position[2] - self.position[2];
    const len = Math.hypot(dx, dz);
    return [dx / len, dz / len];
  });
}

/** Offset (from the island centre) for the landmark: the direction furthest from every bridge. */
export function landmarkOffset(def: IslandDef): [number, number] {
  const dirs = bridgeDirections(def.id);
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const cx = Math.cos(ang);
    const cz = Math.sin(ang);
    // Alignment with the closest bridge (lower is better); prefer facing −Z slightly on ties.
    const closest = dirs.reduce((m, [dx, dz]) => Math.max(m, cx * dx + cz * dz), -1);
    const score = -closest - cz * 0.05;
    if (score > bestScore) {
      bestScore = score;
      best = ang;
    }
  }
  const d = def.radius * 0.45;
  return [Math.cos(best) * d, Math.sin(best) * d];
}

/** Clear radius around the island centre (the spawn / checkpoint spot). */
const CENTRE_CLEARANCE = 3.5;
/** Half-width of the clear walkway from the centre towards each bridge. */
const PATH_CLEARANCE = 2.6;

export interface ScatterPoint {
  island: PhaseId;
  x: number;
  y: number;
  z: number;
  rng: () => number;
}

/**
 * Seeded rejection sampling of points on an island's top, avoiding the centre,
 * the landmark and the walkways to bridges. Deterministic per (island, salt).
 */
export function scatterOnIsland(
  def: IslandDef,
  count: number,
  salt: string,
  minSpacing: number,
  { edgeMargin = 1.6, avoid = [], avoidDist = 0 }: { edgeMargin?: number; avoid?: ScatterPoint[]; avoidDist?: number } = {},
): ScatterPoint[] {
  const rng = mulberry32(hashString(`${def.id}:${salt}`));
  const dirs = bridgeDirections(def.id);
  const [lx, lz] = landmarkOffset(def);
  const maxR = islandWalkRadius(def.radius) - edgeMargin;
  const out: ScatterPoint[] = [];

  for (let tries = 0; tries < count * 40 && out.length < count; tries++) {
    const ang = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * maxR;
    const px = Math.cos(ang) * r;
    const pz = Math.sin(ang) * r;
    if (r < CENTRE_CLEARANCE) continue;
    if (Math.hypot(px - lx, pz - lz) < 3) continue;
    const onPath = dirs.some(([dx, dz]) => {
      const t = px * dx + pz * dz;
      return t > 0 && Math.abs(px * dz - pz * dx) < PATH_CLEARANCE;
    });
    if (onPath) continue;
    const wx = def.position[0] + px;
    const wz = def.position[2] + pz;
    if (out.some((p) => Math.hypot(p.x - wx, p.z - wz) < minSpacing)) continue;
    if (avoid.some((p) => Math.hypot(p.x - wx, p.z - wz) < avoidDist)) continue;
    out.push({ island: def.id, x: wx, y: def.position[1], z: wz, rng });
  }
  return out;
}

/** Island under a point, if the point (feet height) is standing on/just above its top. */
export function islandAt(x: number, feetY: number, z: number): IslandDef | null {
  for (const isl of ISLANDS) {
    const [ix, iy, iz] = isl.position;
    const r = islandWalkRadius(isl.radius) - 0.3;
    const dx = x - ix;
    const dz = z - iz;
    if (dx * dx + dz * dz < r * r && feetY > iy - 0.6 && feetY < iy + 3) return isl;
  }
  return null;
}
