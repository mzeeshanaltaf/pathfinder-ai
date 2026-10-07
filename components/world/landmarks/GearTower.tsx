'use client';

import { useRef } from 'react';
import type { Mesh } from 'three';
import { getPhase } from '@/data/roadmap';
import { box, cone, cyl, gearGeometry, oct, part, type Part } from '@/lib/landmarkKit';
import { glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Static, useGeo, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
const W = 2.6;
const H = 4.6;
const FACE_Z = 1.0;
const TEETH = 10;

/** The doc's agent loop (Planner → Executor → Tools → State → back), one gear per stage, clockwise. */
const LOOP = getPhase('eng-clockwork-keep').diagrams![0].steps.filter((s) => !s.startsWith('↻'));
const GEARS = [
  { x: -0.58, y: 2.95, color: '#e0b04a' },
  { x: 0.58, y: 2.95, color: '#d98a4e' },
  { x: 0.58, y: 1.8, color: '#e0b04a' },
  { x: -0.58, y: 1.8, color: '#d98a4e' },
];
const CLOCK_Y = 4.15;

function buildKeep(): Part[] {
  const parts: Part[] = [
    part(box(W + 0.3, 0.3, 2.3), COLORS.rock, [0, 0.15, 0]),
    part(box(W, H, 2.0), '#d4cde3', [0, H / 2, 0]),
    part(box(0.8, 1.05, 0.1), COLORS.woodDark, [0, 0.52, FACE_Z + 0.02]),
    part(cone(1.95, 1.5, 4), E.dark, [0, H + 0.95, 0], [0, Math.PI / 4, 0]),
    part(cyl(0.4, 0.4, 0.06, 16), '#fffaf0', [0, CLOCK_Y, FACE_Z + 0.03], [Math.PI / 2, 0, 0]),
    part(cyl(0.45, 0.45, 0.04, 16), COLORS.outline, [0, CLOCK_Y, FACE_Z + 0.01], [Math.PI / 2, 0, 0]),
  ];
  for (const x of [-1.05, -0.35, 0.35, 1.05]) {
    parts.push(part(box(0.32, 0.3, 0.32), '#d4cde3', [x, H + 0.15, 0.85]));
    parts.push(part(box(0.32, 0.3, 0.32), '#d4cde3', [x, H + 0.15, -0.85]));
  }
  // Axles.
  for (const g of GEARS) parts.push(part(cyl(0.1, 0.1, 0.3, 8), COLORS.outline, [g.x, g.y, FACE_Z + 0.1], [Math.PI / 2, 0, 0]));
  return parts;
}

/** Clockwork Keep: four interlocking gears turning as one loop (the agent loop), and a clock. */
export default function GearTower() {
  const gears = useRef<Mesh[]>([]);
  const token = useRef<Mesh>(null);
  const minute = useRef<Mesh>(null);
  const hour = useRef<Mesh>(null);
  const gearGeo = useGeo(() => gearGeometry(TEETH, 0.6, 0.49, 0.14, 0.12));
  const tokenGeo = useGeo(() => oct(0.13));
  const minuteGeo = useGeo(() => {
    const g = box(0.04, 0.32, 0.03);
    g.translate(0, 0.14, 0);
    return g;
  });
  const hourGeo = useGeo(() => {
    const g = box(0.06, 0.26, 0.03);
    g.translate(0, 0.11, 0);
    return g;
  });

  useLandmarkFrame((t) => {
    gears.current.forEach((m, i) => {
      // Neighbours turn opposite ways, offset by half a tooth so the teeth mesh.
      if (m) m.rotation.z = (i % 2 ? -1 : 1) * t * 0.7 + (i % 2 ? Math.PI / TEETH : 0);
    });
    const tk = token.current;
    if (tk) {
      // The state token hops stage to stage around the loop, pausing at each gear.
      const u = (t * 0.5) % GEARS.length;
      const k = Math.floor(u);
      const f = Math.min(1, (u - k) * 2.5);
      const ease = f * f * (3 - 2 * f);
      const a = GEARS[k];
      const b = GEARS[(k + 1) % GEARS.length];
      tk.position.set(a.x + (b.x - a.x) * ease, a.y + (b.y - a.y) * ease, FACE_Z + 0.32);
      tk.rotation.y = t * 3;
    }
    if (minute.current) minute.current.rotation.z = -t * 0.6;
    if (hour.current) hour.current.rotation.z = -t * 0.05;
  });

  return (
    <group>
      <Static build={buildKeep} />
      {GEARS.map((g, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) gears.current[i] = m;
          }}
          geometry={gearGeo}
          material={toon(g.color)}
          position={[g.x, g.y, FACE_Z + 0.12]}
          castShadow
        />
      ))}
      {GEARS.map((g, i) => (
        <Caption key={LOOP[i]} position={[g.x * 1.28, g.y + (i < 2 ? 0.72 : -0.74), FACE_Z + 0.08]} size={0.2}>
          {LOOP[i]}
        </Caption>
      ))}
      <mesh ref={token} geometry={tokenGeo} material={glow('#7ff3ff', 1, false)} />
      <mesh ref={minute} geometry={minuteGeo} material={toon(COLORS.outline)} position={[0, CLOCK_Y, FACE_Z + 0.08]} />
      <mesh ref={hour} geometry={hourGeo} material={toon(COLORS.outline)} position={[0, CLOCK_Y, FACE_Z + 0.08]} />
    </group>
  );
}
