'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import { box, part, prism, strokeGlyph, transformParts, type Part, type Vec3 } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Smoke } from './fx';
import { Caption, Static, StaticGlow, useGeo, useLandmarkFrame } from './kit';

const C = TRACK_COLORS.common;
const WINDOW = '#ffe9a8';

/** A little workshop house (origin = floor centre, door facing +Z). */
function house(w: number, h: number, d: number, wall: string, roof: string, door = true): Part[] {
  const parts: Part[] = [
    part(box(w, h, d), wall, [0, h / 2, 0]),
    part(prism(w + 0.45, h * 0.62, d + 0.4), roof, [0, h, 0]),
    part(box(w + 0.1, 0.16, d + 0.1), COLORS.woodDark, [0, 0.08, 0]),
  ];
  for (const x of [-1, 1]) for (const z of [-1, 1]) parts.push(part(box(0.14, h, 0.14), COLORS.woodDark, [(x * w) / 2, h / 2, (z * d) / 2]));
  if (door) parts.push(part(box(0.75, 1.35, 0.08), COLORS.woodDark, [w * 0.18, 0.68, d / 2 + 0.03]));
  return parts;
}

function windows(w: number, d: number, y: number): Part[] {
  return [
    part(box(0.55, 0.45, 0.06), WINDOW, [-w * 0.25, y, d / 2 + 0.03]),
    part(box(0.06, 0.45, 0.55), WINDOW, [w / 2 + 0.03, y, 0]),
    part(box(0.06, 0.45, 0.55), WINDOW, [-w / 2 - 0.03, y, 0]),
  ];
}

const SIDE_A: { at: Vec3; rot: number } = { at: [-2.3, 0, -2.0], rot: 0.5 };
const SIDE_B: { at: Vec3; rot: number } = { at: [2.35, 0, -2.0], rot: -0.45 };

function buildVillage(): Part[] {
  return [
    ...house(3.0, 2.2, 2.6, '#fbe3c0', C.dark),
    part(box(0.5, 1.7, 0.5), '#c97b63', [0.85, 3.05, -0.6]),
    part(box(0.62, 0.14, 0.62), COLORS.outline, [0.85, 3.95, -0.6]),
    part(box(1.0, 0.4, 0.08), COLORS.signBoard, [0.54, 1.72, 1.36]),
    part(box(1.1, 0.75, 0.6), COLORS.wood, [-0.95, 0.38, 1.75]),
    ...transformParts(house(1.8, 1.5, 1.6, '#ffe0b5', C.base), SIDE_A.at, [0, SIDE_A.rot, 0]),
    ...transformParts(house(1.4, 1.2, 1.2, '#fff1d6', '#d98a4e', false), SIDE_B.at, [0, SIDE_B.rot, 0]),
  ];
}

function buildWindows(): Part[] {
  return [
    ...windows(3.0, 2.6, 1.35),
    ...transformParts(windows(1.8, 1.6, 0.95), SIDE_A.at, [0, SIDE_A.rot, 0]),
    ...transformParts(windows(1.4, 1.2, 0.75), SIDE_B.at, [0, SIDE_B.rot, 0]),
  ];
}

/** Centre line of a `{` (a `}` mirrors it). */
const BRACE: [number, number][] = [
  [0.35, 1.0],
  [0.12, 0.93],
  [0.05, 0.62],
  [0.05, 0.22],
  [-0.22, 0],
  [0.05, -0.22],
  [0.05, -0.62],
  [0.12, -0.93],
  [0.35, -1.0],
];

/** Code Village: workshop houses, a smoking chimney and a giant floating `{ }`. */
export default function Workshop() {
  const braces = useRef<Group>(null);
  const left = useGeo(() => strokeGlyph(BRACE, 0.17, 0.24));
  const right = useGeo(() => strokeGlyph(BRACE.map(([x, y]) => [-x, y]), 0.17, 0.24));

  useLandmarkFrame((t) => {
    const b = braces.current;
    if (!b) return;
    b.rotation.y = t * 0.45;
    b.position.y = 5.7 + Math.sin(t * 1.3) * 0.2;
  });

  const mat = toon('#ffa940', '#ff9b2f', 0.35);
  return (
    <group>
      <Static build={buildVillage} />
      <StaticGlow build={buildWindows} />
      <Caption position={[0.54, 1.72, 1.42]} size={0.26}>
        {'</>'}
      </Caption>
      <Smoke vents={[[0.85, 4.05, -0.6]]} />
      <group ref={braces} position={[0, 5.7, 0]}>
        <mesh geometry={left} material={mat} position={[-0.7, 0, 0]} castShadow />
        <mesh geometry={right} material={mat} position={[0.7, 0, 0]} castShadow />
      </group>
    </group>
  );
}
