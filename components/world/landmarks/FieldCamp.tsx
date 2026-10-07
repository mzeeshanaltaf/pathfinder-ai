'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { beam, box, cone, cyl, dodec, part, prism, ring, sphere, type Part, type Vec3 } from '@/lib/landmarkKit';
import { glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Near, Static, useGeo, useLandmarkFrame } from './kit';

const F = TRACK_COLORS.fde;
const TABLE: Vec3 = [1.45, 0, 1.0];
const TABLE_TOP = 0.9;
const FIRE: Vec3 = [-1.4, 0, 1.15];
const PAPER = '#fff6dc';

/** Map-table route: interviews → workflow → problem → metrics → MVP (local to the table top). */
const ROUTE: [number, number][] = [
  [-0.45, 0.22],
  [-0.15, -0.05],
  [0.08, 0.2],
  [0.3, -0.12],
  [0.48, -0.22],
];

function buildCamp(): Part[] {
  const [tx, , tz] = TABLE;
  const [fx, , fz] = FIRE;
  const parts: Part[] = [
    // Ground sheet + A-frame tent (ridge along z, opening facing the island centre).
    part(box(3.0, 0.06, 2.7), '#d9c3a0', [0, 0.03, -1.0]),
    part(prism(2.6, 2.0, 2.2), F.base, [0, 0.06, -1.0]),
    part(prism(2.0, 1.55, 2.22), F.light, [0, 0.06, -1.0]),
    part(prism(1.0, 1.2, 0.04), COLORS.outline, [0, 0.06, 0.12]),
    part(cyl(0.05, 0.05, 2.35, 5), COLORS.woodDark, [0, 1.18, 0.16]),
    part(cyl(0.05, 0.05, 2.35, 5), COLORS.woodDark, [0, 1.18, -2.16]),
    part(sphere(0.09, 6, 4), F.dark, [0, 2.4, 0.16]),
    // Guy ropes.
    beam([-1.3, 0.06, 0.1], [-1.75, 0.02, 0.55], 0.03, COLORS.rope),
    beam([1.3, 0.06, 0.1], [1.75, 0.02, 0.55], 0.03, COLORS.rope),
    // Map table: legs, top, map paper and the route drawn on it.
    part(box(1.3, 0.1, 0.85), COLORS.wood, [tx, TABLE_TOP - 0.05, tz]),
    part(box(1.14, 0.02, 0.7), PAPER, [tx, TABLE_TOP + 0.01, tz]),
    part(box(0.36, 0.02, 0.24), '#c6e0fa', [tx - 0.3, TABLE_TOP + 0.02, tz - 0.1]),
    part(box(0.3, 0.02, 0.2), '#c4f0cf', [tx + 0.25, TABLE_TOP + 0.02, tz + 0.15]),
  ];
  for (const sx of [-0.55, 0.55]) for (const sz of [-0.33, 0.33]) parts.push(part(box(0.08, TABLE_TOP - 0.1, 0.08), COLORS.woodDark, [tx + sx, (TABLE_TOP - 0.1) / 2, tz + sz]));
  for (let i = 1; i < ROUTE.length; i++) {
    const [ax, az] = ROUTE[i - 1];
    const [bx, bz] = ROUTE[i];
    parts.push(beam([tx + ax, TABLE_TOP + 0.035, tz + az], [tx + bx, TABLE_TOP + 0.035, tz + bz], 0.035, F.dark));
  }
  for (const [x, z] of ROUTE.slice(0, -1)) parts.push(part(cyl(0.04, 0.04, 0.03, 6), COLORS.outline, [tx + x, TABLE_TOP + 0.04, tz + z]));
  // Campfire: a ring of stones, crossed logs, and a stump to sit on.
  for (const p of ring(7, 0.42)) parts.push(part(dodec(0.13), COLORS.rock, [fx + p.x, 0.09, fz + p.z]));
  parts.push(part(cyl(0.07, 0.07, 0.75, 5), COLORS.woodDark, [fx, 0.1, fz], [0, 0.5, Math.PI / 2]));
  parts.push(part(cyl(0.07, 0.07, 0.75, 5), COLORS.wood, [fx, 0.16, fz], [0, -0.6, Math.PI / 2]));
  parts.push(part(cyl(0.22, 0.25, 0.42, 7), COLORS.wood, [fx + 0.25, 0.21, fz - 0.95]));
  // Flagpole by the tent.
  parts.push(part(cyl(0.04, 0.05, 2.9, 5), COLORS.outline, [-1.55, 1.45, -1.9]));
  return parts;
}

/** Discovery Camp: a scout's tent, a map table with the discovery route, and a flickering campfire. */
export default function FieldCamp() {
  const outer = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const pin = useRef<Group>(null);
  const flag = useRef<Group>(null);
  const flameGeo = useGeo(() => cone(0.24, 0.6, 6));
  const pinHead = useGeo(() => sphere(0.08, 8, 6));
  const pinNeedle = useGeo(() => cone(0.03, 0.18, 5));
  const flagGeo = useGeo(() => box(0.62, 0.38, 0.03));
  const [ex, ez] = ROUTE[ROUTE.length - 1];

  useLandmarkFrame((t) => {
    if (outer.current) {
      outer.current.scale.set(1 + Math.sin(t * 9) * 0.1, 1 + Math.sin(t * 7.3 + 1) * 0.22, 1 + Math.cos(t * 8.1) * 0.1);
      outer.current.rotation.y = t * 1.7;
    }
    if (inner.current) {
      inner.current.scale.set(0.6, 0.6 * (1 + Math.sin(t * 11 + 2) * 0.25), 0.6);
      inner.current.rotation.y = -t * 2.3;
    }
    // "You are here → MVP": the goal pin bobs above the end of the route.
    if (pin.current) pin.current.position.y = TABLE_TOP + 0.2 + Math.abs(Math.sin(t * 2.4)) * 0.16;
    if (flag.current) flag.current.rotation.y = Math.sin(t * 2.2) * 0.4;
  });

  return (
    <group>
      <Static build={buildCamp} />
      <mesh ref={outer} geometry={flameGeo} material={glow('#ff9b2f', 1, false)} position={[FIRE[0], 0.42, FIRE[2]]} />
      <mesh ref={inner} geometry={flameGeo} material={glow('#ffd66e', 1, false)} position={[FIRE[0], 0.36, FIRE[2]]} scale={0.6} />
      <Near>
        <group ref={pin} position={[TABLE[0] + ex, TABLE_TOP + 0.2, TABLE[2] + ez]}>
          <mesh geometry={pinHead} material={toon(F.dark)} position={[0, 0.1, 0]} castShadow />
          <mesh geometry={pinNeedle} material={toon(COLORS.outline)} rotation={[Math.PI, 0, 0]} position={[0, -0.04, 0]} />
        </group>
        <group ref={flag} position={[-1.55, 2.68, -1.9]}>
          <mesh geometry={flagGeo} material={toon(F.base)} position={[0.33, 0, 0]} castShadow />
        </group>
      </Near>
    </group>
  );
}
