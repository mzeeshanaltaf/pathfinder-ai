'use client';

import { useMemo } from 'react';
import { QuadraticBezierCurve3, TubeGeometry, Vector3, type MeshBasicMaterial } from 'three';
import { box, cone, cyl, part, sphere, transformParts, type Part } from '@/lib/landmarkKit';
import { animatedGlow } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { hashString, mulberry32 } from '@/lib/random';
import { Near, Static, StaticGlow, useGeo, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
const FLOORS = 6;
const FLOOR_H = 1.05;
const HALF = 1.15;
const twist = (i: number) => (i % 2 ? 0.14 : -0.06);
const floorY = (i: number) => 0.3 + i * FLOOR_H;

/** Face normals (x, z): front (+Z, towards the island centre), right, back, left. */
const FACES: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

/** Window centre for floor i, face f, slot s (−1 / +1), in landmark space. */
function windowPos(i: number, f: number, s: number): Vector3 {
  const [nx, nz] = FACES[f];
  const along = s * 0.5;
  const v = new Vector3(nx * (HALF + 0.02) + nz * along, floorY(i) + 0.45, nz * (HALF + 0.02) - nx * along);
  return v.applyAxisAngle(new Vector3(0, 1, 0), twist(i));
}

function buildTower(): Part[] {
  const parts: Part[] = [part(box(2.9, 0.3, 2.9), COLORS.rock, [0, 0.15, 0])];
  for (let i = 0; i < FLOORS; i++) {
    const y = floorY(i);
    parts.push(...transformParts([part(box(HALF * 2, 0.9, HALF * 2), i % 2 ? E.light : '#e8f2fd', [0, 0.45, 0]), part(box(2.6, 0.15, 2.6), E.dark, [0, 0.97, 0])], [0, y, 0], [0, twist(i), 0]));
  }
  const top = floorY(FLOORS);
  parts.push(part(cone(1.75, 1.3, 4), E.dark, [0, top + 0.6, 0], [0, Math.PI / 4, 0]));
  parts.push(part(cyl(0.05, 0.05, 1.3, 5), COLORS.outline, [0, top + 1.7, 0]));
  parts.push(part(sphere(0.14, 8, 6), '#ffc93c', [0, top + 2.4, 0]));
  return parts;
}

function buildWindows(): Part[] {
  const parts: Part[] = [];
  for (let i = 0; i < FLOORS; i++)
    FACES.forEach(([nx], f) => {
      for (const s of [-1, 1]) {
        const p = windowPos(i, f, s);
        parts.push(part(box(nx ? 0.05 : 0.38, 0.42, nx ? 0.38 : 0.05), '#fff1b0', [p.x, p.y, p.z], [0, twist(i), 0]));
      }
    });
  return parts;
}

const BEAM_COLORS = ['#3f86d6', '#e0559a', '#8b6fe0', '#14a9c4'];

interface Beam {
  geo: TubeGeometry;
  mat: MeshBasicMaterial;
}

/** Transformer Tower: stacked layer floors, with attention beams flickering between windows on different floors. */
export default function Tower() {
  const beams = useGeo(() => {
    const rng = mulberry32(hashString('attention'));
    const list: Beam[] = [];
    for (let f = 0; f < 4; f++) {
      for (let k = 0; k < 3; k++) {
        const i = Math.floor(rng() * (FLOORS - 2));
        const j = i + 1 + Math.floor(rng() * (FLOORS - 1 - i));
        const a = windowPos(i, f, rng() < 0.5 ? -1 : 1);
        const b = windowPos(j, f, rng() < 0.5 ? -1 : 1);
        const [nx, nz] = FACES[f];
        const mid = a.clone().add(b).multiplyScalar(0.5).add(new Vector3(nx, 0, nz).multiplyScalar(0.5 + (j - i) * 0.25));
        list.push({
          geo: new TubeGeometry(new QuadraticBezierCurve3(a, mid, b), 16, 0.05, 5, false),
          mat: animatedGlow(BEAM_COLORS[(f + k) % BEAM_COLORS.length], 0, false),
        });
      }
    }
    return Object.assign(list, {
      dispose: () =>
        list.forEach((b) => {
          b.geo.dispose();
          b.mat.dispose();
        }),
    });
  });
  const order = useMemo(() => beams.map((_, i) => (i * 5) % beams.length), [beams]);

  useLandmarkFrame((t) => {
    beams.forEach((b, i) => {
      const phase = (t * 0.45 + order[i] / beams.length) % 1;
      b.mat.opacity = Math.pow(Math.sin(phase * Math.PI), 4) * 0.95;
    });
  });

  return (
    <group>
      <Static build={buildTower} />
      <StaticGlow build={buildWindows} />
      <Near>{beams.map((b, i) => (
        <mesh key={i} geometry={b.geo} material={b.mat} />
      ))}</Near>
    </group>
  );
}
