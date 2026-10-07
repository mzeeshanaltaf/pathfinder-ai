'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { box, cyl, part, type Part } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, useGeo, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
/** Cabinet rows recede and grow taller: the "deep stacks". */
const ROWS = [
  { z: -0.55, h: 1.6, color: '#c6d6ea' },
  { z: -1.45, h: 2.4, color: '#a9c1df' },
  { z: -2.35, h: 3.3, color: '#8daad2' },
];
const COLS = [-1.35, -0.45, 0.45, 1.35];
const DRAWER_H = 0.4;
const PODIUM = { z: 1.15 };

function buildArchive(): Part[] {
  const parts: Part[] = [];
  ROWS.forEach((row) => {
    COLS.forEach((x) => {
      parts.push(part(box(0.84, row.h, 0.8), row.color, [x, row.h / 2, row.z]));
      for (let y = 0.25; y + DRAWER_H < row.h; y += DRAWER_H + 0.06) {
        parts.push(part(box(0.7, DRAWER_H, 0.04), '#e8f2fd', [x, y + DRAWER_H / 2, row.z + 0.41]));
        parts.push(part(box(0.22, 0.05, 0.05), COLORS.outline, [x, y + DRAWER_H * 0.6, row.z + 0.44]));
      }
    });
  });
  parts.push(part(cyl(0.95, 1.05, 0.12, 12), COLORS.rock, [0, 0.06, PODIUM.z]));
  return parts;
}

/** Podium steps for 1st, 2nd and 3rd place (height, x). */
const STEPS = [
  { place: 1, h: 0.62, x: 0, color: '#ffc93c' },
  { place: 2, h: 0.42, x: -0.5, color: '#d6d3e0' },
  { place: 3, h: 0.28, x: 0.5, color: '#e59b62' },
];

function buildPodium(): Part[] {
  const parts: Part[] = [];
  for (const s of STEPS) {
    parts.push(part(box(0.48, s.h, 0.5), s.color, [s.x, s.h / 2, 0]));
    // A ranked "passage" card standing on each step.
    parts.push(part(box(0.3, 0.38, 0.04), '#ffffff', [s.x, s.h + 0.2, 0], [-0.1, 0, 0]));
  }
  return parts;
}

/** Drawers that slide out and back (row, column, drawer level). */
const SLIDERS = [
  { row: 0, col: 1, level: 1 },
  { row: 1, col: 3, level: 2 },
  { row: 2, col: 0, level: 4 },
  { row: 1, col: 0, level: 0 },
];

/** Deep Archive: deep stacks of filing cabinets with drawers sliding open, and a rotating ranking podium. */
export default function Archive() {
  const podium = useRef<Group>(null);
  const drawers = useRef<Mesh[]>([]);
  const drawerGeo = useGeo(() => box(0.7, DRAWER_H, 0.36));

  useLandmarkFrame((t) => {
    if (podium.current) podium.current.rotation.y = t * 0.4;
    drawers.current.forEach((d, i) => {
      if (!d) return;
      const open = Math.max(0, Math.sin(t * 0.9 + i * 1.7));
      d.position.z = ROWS[SLIDERS[i].row].z + 0.25 + open * 0.38;
    });
  });

  return (
    <group>
      <Static build={buildArchive} />
      <Near>{SLIDERS.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) drawers.current[i] = m;
          }}
          geometry={drawerGeo}
          material={toon(E.light)}
          position={[COLS[s.col], 0.25 + s.level * (DRAWER_H + 0.06) + DRAWER_H / 2, ROWS[s.row].z + 0.25]}
          castShadow
        />
      ))}</Near>
      <group ref={podium} position={[0, 0.12, PODIUM.z]}>
        <Static build={buildPodium} outline={0.03} />
        {STEPS.map((s) => (
          <Caption key={s.place} position={[s.x, s.h + 0.2, 0.04]} size={0.2} rotation={[-0.1, 0, 0]}>
            {String(s.place)}
          </Caption>
        ))}
        {STEPS.map((s) => (
          <Caption key={`b${s.place}`} position={[s.x, s.h + 0.2, -0.04]} size={0.2} rotation={[0.1, Math.PI, 0]}>
            {String(s.place)}
          </Caption>
        ))}
      </group>
    </group>
  );
}
