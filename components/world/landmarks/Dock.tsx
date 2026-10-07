'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { beam, box, cyl, extrude, part, sphere, type Part } from '@/lib/landmarkKit';
import { glow } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Static, useGeo, useLandmarkFrame } from './kit';

/** Pier: from just in front of the landmark spot, out past the island rim into the sky. */
export const PIER = { front: 1.5, back: -12, half: 1.3, deck: 0.35 };

const WOOD = COLORS.wood;
const DARK = COLORS.woodDark;

function buildPier(): Part[] {
  const parts: Part[] = [];
  const { front, back, half, deck } = PIER;
  // Planks across the pier.
  for (let z = front - 0.3; z > back; z -= 0.62) {
    parts.push(part(box(half * 2 + 0.2, 0.14, 0.52), (Math.round(z * 10) & 1) === 0 ? WOOD : '#d29e6e', [0, deck - 0.07, z], [0, ((z * 37) % 5) * 0.01, 0]));
  }
  // Stilts (long beyond the rim) + rope rails along both sides.
  for (const side of [-1, 1]) {
    const tops: [number, number, number][] = [];
    for (let z = back + 0.3; z <= front; z += 2.15) {
      const outside = z < -7.5;
      parts.push(part(cyl(0.12, 0.14, outside ? 4.2 : 1.6, 6), DARK, [side * half, deck + 0.6 - (outside ? 4.2 : 1.6) / 2 + 0.25, z]));
      tops.push([side * half, deck + 0.85, z]);
    }
    tops.slice(1).forEach((t, i) => parts.push(beam(tops[i], t, 0.07, COLORS.rope, true)));
  }
  // End rail.
  parts.push(beam([-half, deck + 0.85, back + 0.3], [half, deck + 0.85, back + 0.3], 0.07, COLORS.rope, true));
  // Crates + barrels by the pier entrance.
  parts.push(part(box(0.8, 0.8, 0.8), '#d9a066', [2.15, 0.4, 0.1], [0, 0.3, 0]));
  parts.push(part(box(0.55, 0.55, 0.55), '#e8b67c', [2.2, 1.07, 0.1], [0, -0.2, 0]));
  parts.push(part(cyl(0.32, 0.32, 0.8, 8), '#b8754a', [2.6, 0.4, -1.0]));
  parts.push(part(cyl(0.34, 0.34, 0.06, 8), DARK, [2.6, 0.82, -1.0]));
  // Welcome signpost.
  parts.push(part(cyl(0.1, 0.12, 2.6, 6), DARK, [-2.2, 1.3, 0.6]));
  parts.push(part(box(2.2, 0.95, 0.12), COLORS.signBoard, [-2.2, 2.15, 0.6]));
  // Lantern posts at the pier end.
  for (const side of [-1, 1]) {
    parts.push(part(cyl(0.08, 0.1, 1.9, 6), DARK, [side * (PIER.half - 0.1), PIER.deck + 0.95, PIER.back + 0.6]));
    parts.push(part(cyl(0.2, 0.16, 0.12, 6), COLORS.outline, [side * (PIER.half - 0.1), PIER.deck + 2.15, PIER.back + 0.6]));
  }
  return parts;
}

/** Boat hull side profile (z, y), extruded across x. */
const HULL: [number, number][] = [
  [-1.7, 0.7],
  [1.9, 0.75],
  [1.3, 0],
  [-1.25, 0],
];

function buildBoat(): Part[] {
  return [
    part(extrude(HULL, 1.3, 0.04), '#e2725b', [0, 0, 0], [0, -Math.PI / 2, 0]),
    part(box(1.15, 0.12, 2.9), WOOD, [0, 0.6, 0.1]),
    part(box(1.45, 0.14, 0.2), '#fff6e0', [0, 0.45, 0.2]),
    part(cyl(0.07, 0.08, 3.2, 6), DARK, [0, 2.1, 0.1]),
    part(
      extrude(
        [
          [0, 0],
          [0, 2.2],
          [1.5, 0],
        ],
        0.05,
        0,
      ),
      '#fffaf0',
      [0.06, 1.05, 0.2],
      [0, -Math.PI / 2, 0],
    ),
    part(box(0.5, 0.3, 0.04), TRACK_COLORS.meta.base, [0, 3.55, 0.35]),
  ];
}

/** Harbor: a pier out into the sky, a moored sky-boat and the welcome sign. */
export default function Dock() {
  const boat = useRef<Group>(null);
  const lamps = useRef<Mesh[]>([]);
  const lampGeo = useGeo(() => sphere(0.17, 8, 6));

  useLandmarkFrame((t) => {
    if (boat.current) {
      boat.current.position.y = -0.25 + Math.sin(t * 1.1) * 0.18;
      boat.current.rotation.z = Math.sin(t * 0.9) * 0.06;
      boat.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.03;
    }
    lamps.current.forEach((m, i) => m.scale.setScalar(1 + Math.sin(t * 3 + i * 1.7) * 0.12));
  });

  return (
    <group>
      <Static build={buildPier} outline={0.04} />
      <group ref={boat} position={[PIER.half + 1.6, -0.25, PIER.back + 2]}>
        <Static build={buildBoat} outline={0.04} />
      </group>
      {[-1, 1].map((side, i) => (
        <mesh
          key={side}
          ref={(m) => {
            if (m) lamps.current[i] = m;
          }}
          geometry={lampGeo}
          material={glow('#ffe39a', 1, false)}
          position={[side * (PIER.half - 0.1), PIER.deck + 1.95, PIER.back + 0.6]}
        />
      ))}
      <Caption position={[-2.2, 2.32, 0.67]} size={0.28}>
        Pathfinder AI
      </Caption>
      <Caption position={[-2.2, 1.98, 0.67]} size={0.17}>
        Find your path into AI.
      </Caption>
    </group>
  );
}
