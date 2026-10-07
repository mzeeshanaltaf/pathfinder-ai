'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { beam, box, cone, cyl, extrude, ico, part, slab, transformParts, type Part, type Vec3 } from '@/lib/landmarkKit';
import { animatedGlow, toon } from '@/lib/materials';
import { COLORS } from '@/lib/palette';
import { Near, Static, useGeo, useLandmarkFrame } from './kit';

const RED = '#e66a5c';
const ROOF = '#9b4f4a';
const HAY = '#f2c94c';

/** Barn cross-section (x, y), extruded along z. */
const BARN: [number, number][] = [
  [-1.5, 0],
  [1.5, 0],
  [1.5, 2.0],
  [1.05, 2.85],
  [0, 3.35],
  [-1.05, 2.85],
  [-1.5, 2.0],
];

function buildBarn(): Part[] {
  const d = 2.5;
  const parts: Part[] = [part(extrude(BARN, d, 0), RED, [0, 0, 0])];
  // Gambrel roof planks, overhanging the walls.
  for (const side of [-1, 1]) {
    parts.push(slab(side * 1.62, 1.95, side * 1.12, 2.92, d + 0.35, 0.16, ROOF));
    parts.push(slab(side * 1.12, 2.92, 0, 3.45, d + 0.35, 0.16, ROOF));
  }
  // Door with the white X brace, and a hay-loft window.
  parts.push(part(box(1.3, 1.5, 0.06), '#b5473d', [0, 0.75, d / 2 + 0.02]));
  parts.push(part(box(1.36, 0.1, 0.08), '#ffffff', [0, 1.5, d / 2 + 0.04]));
  parts.push(part(box(0.1, 1.98, 0.08), '#ffffff', [0, 0.75, d / 2 + 0.05], [0, 0, 0.71]));
  parts.push(part(box(0.1, 1.98, 0.08), '#ffffff', [0, 0.75, d / 2 + 0.05], [0, 0, -0.71]));
  parts.push(part(box(0.62, 0.5, 0.06), '#ffe9a8', [0, 2.45, d / 2 + 0.02]));
  parts.push(part(cyl(0.04, 0.04, 0.7, 5), COLORS.outline, [0, 3.75, 0]));
  return parts;
}

/** A small round pen of fence posts and rails. */
function pen(r: number): Part[] {
  const parts: Part[] = [];
  const n = 9;
  const pts: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    parts.push(part(box(0.1, 0.62, 0.1), COLORS.wood, [Math.cos(a) * r, 0.31, Math.sin(a) * r]));
  }
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % n];
    for (const y of [0.25, 0.5]) parts.push(beam([p[0], y, p[2]], [q[0], y, q[2]], 0.06, COLORS.woodDark));
  });
  return parts;
}

/** Hay-bale scatter plot: points roughly on a line, laid out on the ground (u = x axis, v = z axis). */
const PLOT = { at: [0.25, 0, -1.65] as Vec3, rot: 0, scale: 0.75, size: 2.6 };
const POINTS: [number, number][] = [
  [0.2, 0.45],
  [0.55, 0.5],
  [0.8, 0.95],
  [1.15, 0.85],
  [1.4, 1.35],
  [1.75, 1.3],
  [2.05, 1.8],
  [2.3, 1.75],
];
const FIT_ANGLE = Math.atan2(1.55, 2.2);
const CENTROID = [POINTS.reduce((n, p) => n + p[0], 0) / POINTS.length, POINTS.reduce((n, p) => n + p[1], 0) / POINTS.length];
/** The fit line's own material (its opacity animates). One Farm exists, so module scope is fine. */
const FIT_MAT = animatedGlow('#ff7a59', 0.9);

function buildPlot(): Part[] {
  const s = PLOT.size;
  const parts: Part[] = [
    part(box(s + 0.2, 0.1, 0.12), COLORS.woodDark, [s / 2 - 0.1, 0.05, 0]),
    part(box(0.12, 0.1, s + 0.2), COLORS.woodDark, [0, 0.05, -(s / 2 - 0.1)]),
    part(cone(0.12, 0.3, 4), COLORS.woodDark, [s + 0.05, 0.08, 0], [0, 0, -Math.PI / 2]),
    part(cone(0.12, 0.3, 4), COLORS.woodDark, [0, 0.08, -s - 0.05], [-Math.PI / 2, 0, 0]),
  ];
  for (const [u, v] of POINTS) parts.push(part(cyl(0.2, 0.2, 0.36, 7), HAY, [u, 0.2, -v], [Math.PI / 2, u * 3, 0]));
  return transformParts(parts, PLOT.at, [0, PLOT.rot, 0], PLOT.scale);
}

const SHEEP: { pen: Vec3; dark: boolean }[] = [
  { pen: [-2.55, 0, -0.3], dark: false },
  { pen: [-2.55, 0, -0.3], dark: false },
  { pen: [-1.55, 0, -2.35], dark: true },
  { pen: [-1.55, 0, -2.35], dark: true },
];

function buildPens(): Part[] {
  return [...transformParts(pen(0.85), [-2.55, 0, -0.3]), ...transformParts(pen(0.85), [-1.55, 0, -2.35])];
}

/** ML Meadow: a barn, two sorting pens (one class per pen) and a hay-bale scatter plot with a fitted line. */
export default function Farm() {
  const vane = useRef<Group>(null);
  const fit = useRef<Mesh>(null);
  const sheep = useRef<Group[]>([]);
  const fitGeo = useGeo(() => box(3.1, 0.06, 0.09));
  const woolGeo = useGeo(() => ico(0.26, 0));
  const headGeo = useGeo(() => box(0.16, 0.18, 0.2));
  const vaneGeo = useGeo(() => cone(0.12, 0.6, 4));

  useLandmarkFrame((t) => {
    if (vane.current) vane.current.rotation.y = Math.sin(t * 0.4) * 1.2 + t * 0.2;
    const f = fit.current;
    if (f) {
      // The fitted line wobbles in and settles on the trend, like a model training (repeats every 7 s).
      const u = t % 7;
      f.rotation.y = FIT_ANGLE + 0.7 * Math.exp(-0.7 * u) * Math.cos(3 * u);
      FIT_MAT.opacity = 0.55 + 0.4 * Math.min(1, u / 2);
    }
    sheep.current.forEach((g, i) => {
      if (!g) return;
      const hop = Math.max(0, Math.sin(t * 3 + i * 1.9));
      g.position.y = hop * 0.18;
      g.rotation.y = i * 1.4 + Math.sin(t * 0.5 + i) * 0.6;
    });
  });

  return (
    <group>
      <Static build={buildBarn} />
      <Static build={buildPens} outline={0.03} />
      <Static build={buildPlot} outline={0.03} />
      {/* The fit line pivots on the data's centroid, like a regression line. */}
      <group position={PLOT.at} rotation={[0, PLOT.rot, 0]} scale={PLOT.scale}>
        <mesh ref={fit} geometry={fitGeo} material={FIT_MAT} position={[CENTROID[0], 0.44, -CENTROID[1]]} />
      </group>
      <group ref={vane} position={[0, 4.1, 0]}>
        <mesh geometry={vaneGeo} material={toon('#ffc93c')} rotation={[0, 0, -Math.PI / 2]} position={[0.2, 0, 0]} />
      </group>
      <Near>{SHEEP.map((s, i) => (
        <group key={i} position={[s.pen[0] + (i % 2 ? 0.3 : -0.3), 0, s.pen[2] + (i % 2 ? -0.2 : 0.25)]}>
          <group
            ref={(g) => {
              if (g) sheep.current[i] = g;
            }}
          >
            <mesh geometry={woolGeo} material={toon(s.dark ? '#6b6378' : '#ffffff')} position={[0, 0.34, 0]} castShadow />
            <mesh geometry={headGeo} material={toon(s.dark ? '#3d3452' : '#5a5168')} position={[0, 0.42, 0.27]} />
          </group>
        </group>
      ))}</Near>
    </group>
  );
}
