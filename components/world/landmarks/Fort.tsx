'use client';

import { useRef } from 'react';
import { SphereGeometry, type Group, type Mesh } from 'three';
import { box, cone, cyl, part, type Part } from '@/lib/landmarkKit';
import { animatedGlow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Static, useGeo, useLandmarkFrame } from './kit';

const D = TRACK_COLORS.developer;
const WALL_R = 1.85;
const SIDES = 8;
const WALL_H = 1.5;
const STONE = '#d9d3e6';

function buildFort(): Part[] {
  const parts: Part[] = [];
  const seg = 2 * WALL_R * Math.tan(Math.PI / SIDES);
  for (let i = 0; i < SIDES; i++) {
    // Segment i faces angle a; i = 2 faces +Z (the gate, towards the island centre).
    const a = (i / SIDES) * Math.PI * 2;
    const x = Math.cos(a) * WALL_R;
    const z = Math.sin(a) * WALL_R;
    const rotY = -a + Math.PI / 2;
    const gate = i === 2;
    if (gate) {
      for (const s of [-1, 1]) parts.push(part(box(0.32, WALL_H + 0.3, 0.42), STONE, [x + s * 0.55, (WALL_H + 0.3) / 2, z]));
      parts.push(part(box(1.4, 0.35, 0.42), STONE, [x, WALL_H + 0.12, z]));
      parts.push(part(box(0.78, 1.15, 0.1), COLORS.woodDark, [x, 0.58, z - 0.05]));
    } else {
      parts.push(part(box(seg + 0.06, WALL_H, 0.36), STONE, [x, WALL_H / 2, z], [0, rotY, 0]));
      for (const k of [-0.28, 0.28]) {
        const along = k * seg;
        parts.push(part(box(0.3, 0.26, 0.38), STONE, [x + Math.cos(rotY) * along, WALL_H + 0.13, z - Math.sin(rotY) * along], [0, rotY, 0]));
      }
    }
    if (i % 2 === 1) {
      const ca = a + Math.PI / SIDES;
      const cx = Math.cos(ca) * (WALL_R + 0.08);
      const cz = Math.sin(ca) * (WALL_R + 0.08);
      parts.push(part(cyl(0.3, 0.34, WALL_H + 0.7, 8), '#cbc4dc', [cx, (WALL_H + 0.7) / 2, cz]));
      parts.push(part(cone(0.42, 0.6, 8), D.dark, [cx, WALL_H + 1.0, cz]));
    }
  }
  // Keep + flagpole.
  parts.push(part(box(1.3, 2.6, 1.3), '#e6e1ef', [0, 1.3, -0.2]));
  for (const x of [-0.45, 0, 0.45]) for (const z of [-0.65, 0.65]) parts.push(part(box(0.26, 0.26, 0.26), '#e6e1ef', [x, 2.73, -0.2 + z]));
  parts.push(part(cyl(0.04, 0.04, 1.6, 5), COLORS.outline, [0, 3.4, -0.2]));
  return parts;
}

/** Shield materials (module scope: one fort, and frame callbacks animate their opacity). */
const DOME_MAT = animatedGlow('#7fd99a', 0.14, false);
const GRID_MAT = Object.assign(animatedGlow('#45b06a', 0.3, false), { wireframe: true });

/** Shield Fort: an octagonal wall with a gate, a keep and a shimmering shield dome. */
export default function Fort() {
  const dome = useRef<Mesh>(null);
  const grid = useRef<Mesh>(null);
  const flag = useRef<Group>(null);
  const domeGeo = useGeo(() => new SphereGeometry(2.75, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2));
  const gridGeo = useGeo(() => new SphereGeometry(2.78, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2));
  const flagGeo = useGeo(() => box(0.7, 0.42, 0.03));

  useLandmarkFrame((t) => {
    DOME_MAT.opacity = 0.1 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.1;
    GRID_MAT.opacity = 0.2 + (Math.sin(t * 3.1 + 1) * 0.5 + 0.5) * 0.25;
    if (dome.current) dome.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.012);
    if (grid.current) grid.current.rotation.y = t * 0.12;
    if (flag.current) flag.current.rotation.y = Math.sin(t * 2.5) * 0.35;
  });

  return (
    <group>
      <Static build={buildFort} />
      <group ref={flag} position={[0, 3.95, -0.2]}>
        <mesh geometry={flagGeo} material={toon(D.base)} position={[0.37, 0, 0]} castShadow />
      </group>
      <mesh ref={dome} geometry={domeGeo} material={DOME_MAT} />
      <mesh ref={grid} geometry={gridGeo} material={GRID_MAT} />
    </group>
  );
}
