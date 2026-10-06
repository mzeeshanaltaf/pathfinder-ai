import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { gemsForPhase, type PhaseId } from '@/data/roadmap';
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

/** Seeded scenery obstacles (fresh points each call; Scenery consumes their rng for sizes). */
export function sceneryObstacles(def: IslandDef) {
  const trees = scatterOnIsland(def, Math.round(def.radius * 0.5), 'trees', 3);
  const rocks = scatterOnIsland(def, 4, 'rocks', 2.5, { avoid: trees, avoidDist: 2 });
  return { trees, rocks };
}

// ---------------------------------------------------------------------------
// Landmarks, mentors, signs and gems (all derived from data/world.ts)

/** Landmarks on big islands (the Summit) are scaled up. */
export const landmarkScale = (def: IslandDef) => (def.landmark === 'summit-plaza' ? 1.5 : 1);

/** Radius of the landmark's solid collider. */
export const landmarkRadius = (def: IslandDef) => 1.3 * landmarkScale(def);

/** Landmark base position in world space (on the island top). */
export function landmarkPosition(def: IslandDef): [number, number, number] {
  const [ox, oz] = landmarkOffset(def);
  return [def.position[0] + ox, def.position[1], def.position[2] + oz];
}

/** Mentor stands between the island centre and the landmark, a little to one side. */
export function mentorPosition(def: IslandDef): [number, number, number] {
  const [ox, oz] = landmarkOffset(def);
  const len = Math.hypot(ox, oz) || 1;
  // Direction from landmark back towards the centre, rotated ~35° so the mentor doesn't block the approach.
  const a = Math.atan2(-oz / len, -ox / len) + 0.6;
  const d = landmarkRadius(def) + 1.6;
  return [def.position[0] + ox + Math.cos(a) * d, def.position[1], def.position[2] + oz + Math.sin(a) * d];
}

export interface SignLayout {
  key: string;
  /** Island the sign stands on, and the island the bridge leads to. */
  on: PhaseId;
  to: PhaseId;
  position: [number, number, number];
  /** Y rotation so the sign's front faces players walking towards the bridge. */
  rotationY: number;
}

function signAt(on: IslandDef, to: IslandDef, rim: Vector3, dx: number, dz: number): SignLayout {
  // (dx, dz) = walking direction onto the bridge. Stand back from the rim, off to the walker's right.
  const side = BRIDGE_HALF_WIDTH + 1;
  return {
    key: `${on.id}->${to.id}`,
    on: on.id,
    to: to.id,
    position: [rim.x - dx * 0.9 - dz * side, on.position[1], rim.z - dz * 0.9 + dx * side],
    rotationY: Math.atan2(-dx, -dz),
  };
}

/** Two signs per bridge, one at each end, naming the island across it. */
export const SIGN_LAYOUTS: SignLayout[] = BRIDGE_LAYOUTS.flatMap((b) => {
  const f = new Vector3(b.end.x - b.start.x, 0, b.end.z - b.start.z).normalize();
  return [signAt(b.from, b.to, b.start, f.x, f.z), signAt(b.to, b.from, b.end, -f.x, -f.z)];
});

export interface GemSpawn {
  id: string;
  phaseId: PhaseId;
  x: number;
  y: number;
  z: number;
}

const GEM_CENTRE_CLEARANCE = 2.4;

/**
 * Seeded gem placement: one gem per topic, scattered over the island top. Gems may sit on
 * walkways (they're not obstacles) but avoid the spawn point, landmark, mentor, signs, trees
 * and rocks. Spacing relaxes until every gem fits.
 */
function placeGems(def: IslandDef): GemSpawn[] {
  const ids = gemsForPhase(def.id);
  const rng = mulberry32(hashString(`${def.id}:gems`));
  const [lx, , lz] = landmarkPosition(def);
  const [mx, , mz] = mentorPosition(def);
  const { trees, rocks } = sceneryObstacles(def);
  const obstacles: { x: number; z: number; r: number }[] = [
    { x: lx, z: lz, r: landmarkRadius(def) + 1.1 },
    { x: mx, z: mz, r: 1.4 },
    ...trees.map((p) => ({ x: p.x, z: p.z, r: 1.1 })),
    ...rocks.map((p) => ({ x: p.x, z: p.z, r: 1 })),
    ...SIGN_LAYOUTS.filter((s) => s.on === def.id).map((s) => ({ x: s.position[0], z: s.position[2], r: 1 })),
  ];
  const maxR = islandWalkRadius(def.radius) - 1;
  const out: GemSpawn[] = [];
  let spacing = 2.8;

  for (let tries = 1; out.length < ids.length && tries < 50000; tries++) {
    if (tries % 400 === 0) spacing = Math.max(0.7, spacing * 0.88);
    const ang = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * maxR;
    if (r < GEM_CENTRE_CLEARANCE) continue;
    const x = def.position[0] + Math.cos(ang) * r;
    const z = def.position[2] + Math.sin(ang) * r;
    if (obstacles.some((o) => Math.hypot(o.x - x, o.z - z) < o.r)) continue;
    if (out.some((p) => Math.hypot(p.x - x, p.z - z) < spacing)) continue;
    out.push({ id: ids[out.length], phaseId: def.id, x, y: def.position[1], z });
  }
  if (out.length < ids.length) throw new Error(`gems: could not place all gems on ${def.id}`);
  return out;
}

let gemSpawns: GemSpawn[] | null = null;

/** Every gem in the world (computed once, identical on every load). */
export function getGemSpawns(): GemSpawn[] {
  gemSpawns ??= ISLANDS.flatMap(placeGems);
  return gemSpawns;
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
