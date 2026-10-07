// Helpers for building procedural low-poly landmarks: static parts are painted with
// vertex colours and merged into ONE mesh per landmark (one draw call + one outline).

import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Euler,
  ExtrudeGeometry,
  IcosahedronGeometry,
  Matrix4,
  OctahedronGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Vec3 = [number, number, number];

export interface Part {
  geo: BufferGeometry;
  color: string;
  at?: Vec3;
  rot?: Vec3;
  scale?: number | Vec3;
}

// Primitive shorthands (fresh geometry each call; mergeParts disposes them).
export const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
export const cyl = (rt: number, rb: number, h: number, seg = 8, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open);
export const cone = (r: number, h: number, seg = 8) => new ConeGeometry(r, h, seg);
export const sphere = (r: number, w = 10, h = 8) => new SphereGeometry(r, w, h);
export const ico = (r: number, detail = 0) => new IcosahedronGeometry(r, detail);
export const dodec = (r: number) => new DodecahedronGeometry(r, 0);
export const oct = (r: number) => new OctahedronGeometry(r, 0);
export const torus = (r: number, tube: number, rs = 6, ts = 16, arc = Math.PI * 2) => new TorusGeometry(r, tube, rs, ts, arc);

export const part = (geo: BufferGeometry, color: string, at: Vec3 = [0, 0, 0], rot: Vec3 = [0, 0, 0], scale: number | Vec3 = 1): Part => ({
  geo,
  color,
  at,
  rot,
  scale,
});

const m4 = new Matrix4();
const q = new Quaternion();
const e = new Euler();
const v = new Vector3();
const s = new Vector3();

/** Transform matrix for a part placement. */
export function placement(at: Vec3 = [0, 0, 0], rot: Vec3 = [0, 0, 0], scale: number | Vec3 = 1): Matrix4 {
  const sc = typeof scale === 'number' ? s.set(scale, scale, scale) : s.set(...scale);
  return m4.compose(v.set(...at), q.setFromEuler(e.set(...rot)), sc).clone();
}

/** Paint, place and merge parts into one non-indexed geometry with position / normal / color. */
export function mergeParts(parts: Part[]): BufferGeometry {
  const c = new Color();
  const prepared = parts.map((p) => {
    const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone();
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    g.applyMatrix4(placement(p.at, p.rot, p.scale));
    c.set(p.color);
    const n = g.getAttribute('position').count;
    const cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) cols.set([c.r, c.g, c.b], i * 3);
    g.setAttribute('color', new BufferAttribute(cols, 3));
    p.geo.dispose();
    return g;
  });
  const merged = mergeGeometries(prepared);
  prepared.forEach((g) => g.dispose());
  merged.computeBoundingSphere();
  return merged;
}

/** Extrude a closed outline (x, y points) into a slab of `depth`, centred on z. */
export function extrude(points: [number, number][], depth: number, bevel = 0.02): BufferGeometry {
  const shape = new Shape(points.map(([x, y]) => new Vector2(x, y)));
  const g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    curveSegments: 6,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * A thick 2D stroke along a centre line (x, y points), extruded to a slab. Used for glyphs
 * such as `{ }` and `∫` (no font files needed).
 */
export function strokeGlyph(centre: [number, number][], width: number, depth: number, samples = 48): BufferGeometry {
  // Catmull-Rom resample of the centre line for smooth curves.
  const pts: Vector2[] = [];
  const P = centre.map(([x, y]) => new Vector2(x, y));
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * (P.length - 1);
    const k = Math.min(P.length - 2, Math.floor(t));
    const u = t - k;
    const p0 = P[Math.max(0, k - 1)];
    const p1 = P[k];
    const p2 = P[k + 1];
    const p3 = P[Math.min(P.length - 1, k + 2)];
    const u2 = u * u;
    const u3 = u2 * u;
    pts.push(
      new Vector2(
        0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
        0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
      ),
    );
  }
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * (width / 2);
    const ny = (dx / len) * (width / 2);
    left.push([p.x + nx, p.y + ny]);
    right.push([p.x - nx, p.y - ny]);
  });
  return extrude([...left, ...right.reverse()], depth, Math.min(0.03, width * 0.15));
}

/** Toothed gear slab (axis = z). */
export function gearGeometry(teeth: number, outer: number, inner: number, depth: number, hole = 0): BufferGeometry {
  const shape = new Shape();
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = i % 4 === 1 || i % 4 === 2 ? outer : inner;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  if (hole > 0) {
    const h = new Shape();
    h.absarc(0, 0, hole, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Bake a group transform into parts (e.g. a whole house placed and turned as one). */
export function transformParts(parts: Part[], at: Vec3, rot: Vec3 = [0, 0, 0], scale: number | Vec3 = 1): Part[] {
  const parent = placement(at, rot, scale);
  return parts.map((p) => {
    p.geo.applyMatrix4(placement(p.at, p.rot, p.scale));
    p.geo.applyMatrix4(parent);
    return { geo: p.geo, color: p.color };
  });
}

const Y = new Vector3(0, 1, 0);

/** A square bar (or a round rod) spanning from `a` to `b`. */
export function beam(a: Vec3, b: Vec3, thick: number, color: string, round = false): Part {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const quat = new Quaternion().setFromUnitVectors(Y, dir.normalize());
  const rot = new Euler().setFromQuaternion(quat);
  const mid = va.add(vb).multiplyScalar(0.5);
  return part(round ? cyl(thick / 2, thick / 2, len, 6) : box(thick, len, thick), color, [mid.x, mid.y, mid.z], [rot.x, rot.y, rot.z]);
}

/** A sloped roof plank in the XY plane from (x1, y1) to (x2, y2), `depth` deep along z. */
export function slab(x1: number, y1: number, x2: number, y2: number, depth: number, thick: number, color: string, z = 0): Part {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return part(box(len, thick, depth), color, [(x1 + x2) / 2, (y1 + y2) / 2, z], [0, 0, Math.atan2(y2 - y1, x2 - x1)]);
}

/** Triangular prism roof: ridge along z, `w` wide at the eaves, `h` tall, `d` deep. Base at y = 0. */
export function prism(w: number, h: number, d: number): BufferGeometry {
  return extrude(
    [
      [-w / 2, 0],
      [w / 2, 0],
      [0, h],
    ],
    d,
    0,
  );
}

/** Ring of `n` placements around the y axis. */
export const ring = (n: number, r: number, phase = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, a };
  });
