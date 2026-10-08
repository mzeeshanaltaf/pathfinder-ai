'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { beam, box, cone, cyl, part, sphere, type Part, type Vec3 } from '@/lib/landmarkKit';
import { glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, useGeo, useLandmarkFrame } from './kit';

const D = TRACK_COLORS.developer;
const CZ = -0.3;
const BASE_H = 0.25;
const DECK_Y = 3.45;
const FOOT = 0.85;
const TOP = 0.6;
const ROOF_Y = DECK_Y + 1.05;
const LAMP_Y = ROOF_Y + 1.25;
const BOARD: Vec3 = [1.95, 2.0, 0.6];
/** Spans of one request in the floating trace (start and width, as fractions of the request). */
const SPANS = [
  { x: 0, w: 1, color: D.dark },
  { x: 0.05, w: 0.22, color: '#82bdf2' },
  { x: 0.3, w: 0.5, color: '#ffc078' },
  { x: 0.82, w: 0.16, color: '#b9a3ee' },
];
const TRACE_W = 1.0;

function buildTower(): Part[] {
  const parts: Part[] = [part(cyl(1.3, 1.45, BASE_H, 8), COLORS.rock, [0, BASE_H / 2, CZ])];
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  // Four splayed legs, X-braced on every side.
  for (const [sx, sz] of corners) {
    parts.push(beam([sx * FOOT, BASE_H, CZ + sz * FOOT], [sx * TOP, DECK_Y, CZ + sz * TOP], 0.16, COLORS.woodDark));
  }
  const at = (sx: number, sz: number, y: number): Vec3 => {
    const k = (y - BASE_H) / (DECK_Y - BASE_H);
    const r = FOOT + (TOP - FOOT) * k;
    return [sx * r, y, CZ + sz * r];
  };
  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[i];
    const [bx, bz] = corners[(i + 1) % 4];
    // The front (+Z) side stays open for the ladder.
    if (az === 1 && bz === 1) continue;
    parts.push(beam(at(ax, az, 0.6), at(bx, bz, 2.9), 0.08, COLORS.wood));
    parts.push(beam(at(bx, bz, 0.6), at(ax, az, 2.9), 0.08, COLORS.wood));
  }
  // Deck, railing and roof posts.
  parts.push(part(box(1.75, 0.16, 1.75), COLORS.wood, [0, DECK_Y, CZ]));
  for (const [sx, sz] of corners) parts.push(part(box(0.09, 1.0, 0.09), COLORS.woodDark, [sx * 0.8, DECK_Y + 0.55, CZ + sz * 0.8]));
  for (const s of [-1, 1]) {
    parts.push(part(box(1.68, 0.07, 0.07), COLORS.wood, [0, DECK_Y + 0.45, CZ + s * 0.8]));
    parts.push(part(box(0.07, 0.07, 1.68), COLORS.wood, [s * 0.8, DECK_Y + 0.45, CZ]));
  }
  // Pyramid roof with a green band, topped by the lamp housing.
  parts.push(part(cone(1.4, 0.9, 4), D.base, [0, ROOF_Y + 0.45, CZ], [0, Math.PI / 4, 0]));
  parts.push(part(box(1.95, 0.1, 1.95), D.dark, [0, ROOF_Y + 0.02, CZ]));
  parts.push(part(cyl(0.12, 0.16, 0.25, 6), COLORS.rockDark, [0, ROOF_Y + 0.95, CZ]));
  // Ladder up the open front.
  const lz0 = CZ + FOOT + 0.2;
  const lz1 = CZ + TOP + 0.15;
  for (const x of [-0.24, 0.24]) parts.push(beam([x, BASE_H, lz0], [x, DECK_Y, lz1], 0.07, COLORS.woodDark));
  for (let y = 0.6; y < DECK_Y; y += 0.42) {
    const z = lz0 + ((lz1 - lz0) * (y - BASE_H)) / (DECK_Y - BASE_H);
    parts.push(part(box(0.5, 0.05, 0.05), COLORS.wood, [0, y, z]));
  }
  return parts;
}

/** The spyglass on the deck (local +Z), on a little stand; it sweeps the horizon. */
function buildScope(): Part[] {
  return [
    part(cyl(0.05, 0.08, 0.5, 6), COLORS.rockDark, [0, -0.25, 0]),
    part(cyl(0.1, 0.14, 0.9, 8), '#fffaf2', [0, 0, 0.3], [Math.PI / 2, 0, 0]),
    part(cyl(0.15, 0.15, 0.1, 8), D.dark, [0, 0, 0.76], [Math.PI / 2, 0, 0]),
    part(cyl(0.12, 0.12, 0.12, 8), D.dark, [0, 0, -0.1], [Math.PI / 2, 0, 0]),
  ];
}

function buildBoard(): Part[] {
  return [part(box(1.3, 0.95, 0.08), '#fffaf2', [0, 0, 0]), part(box(1.4, 0.08, 0.1), D.dark, [0, -0.5, 0]), part(box(1.4, 0.08, 0.1), D.dark, [0, 0.5, 0])];
}

/** Watchtower (AI Observability): a lookout tower whose spyglass sweeps the sky, beside a floating live trace. */
export default function Watchtower() {
  const scope = useRef<Group>(null);
  const lamp = useRef<Mesh>(null);
  const board = useRef<Group>(null);
  const spans = useRef<Mesh[]>([]);
  const lampGeo = useGeo(() => sphere(0.2, 10, 8));
  const barGeo = useGeo(() => {
    const g = box(1, 0.11, 0.05);
    g.translate(0.5, 0, 0);
    return g;
  });

  useLandmarkFrame((t) => {
    if (scope.current) scope.current.rotation.y = Math.sin(t * 0.3) * 1.3;
    if (lamp.current) lamp.current.scale.setScalar(1 + Math.max(0, Math.sin(t * 2.4)) * 0.4);
    if (board.current) {
      board.current.position.y = BOARD[1] + Math.sin(t * 1.5) * 0.1;
      board.current.rotation.y = -0.4 + Math.sin(t * 0.6) * 0.08;
    }
    // One request plays out: each span fills in as the clock passes its start, then the trace resets.
    const u = (t * 0.3) % 1.25; // the last quarter holds the finished trace
    spans.current.forEach((m, i) => {
      if (!m) return;
      const s = SPANS[i];
      const fill = Math.min(1, Math.max(0, (u - s.x) / s.w));
      m.scale.x = Math.max(0.001, s.w * TRACE_W * fill);
    });
  });

  return (
    <group>
      <Static build={buildTower} />
      <group ref={scope} position={[0, DECK_Y + 0.65, CZ]}>
        <Static build={buildScope} outline={0.03} />
      </group>
      <mesh ref={lamp} geometry={lampGeo} material={glow('#fff1b0', 1, false)} position={[0, LAMP_Y, CZ]} />
      <Near>
        <group ref={board} position={BOARD}>
          <Static build={buildBoard} outline={0.03} />
          {SPANS.map((s, i) => (
            <mesh
              key={i}
              ref={(m) => {
                if (m) spans.current[i] = m;
              }}
              geometry={barGeo}
              material={toon(s.color)}
              position={[-TRACE_W / 2 + s.x * TRACE_W, 0.12 - i * 0.16, 0.06]}
              scale={[s.w * TRACE_W, 1, 1]}
            />
          ))}
          <Caption position={[0, 0.34, 0.06]} size={0.15} outline="">
            Live trace
          </Caption>
        </group>
      </Near>
    </group>
  );
}
