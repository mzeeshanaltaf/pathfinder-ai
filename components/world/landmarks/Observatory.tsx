'use client';

import { useRef } from 'react';
import { SphereGeometry, type Group, type Mesh } from 'three';
import { box, cyl, part, torus, type Part, type Vec3 } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, useGeo, useLandmarkFrame } from './kit';

const F = TRACK_COLORS.fde;
const CENTRE: Vec3 = [0, 0, -0.45];
const DRUM_H = 1.45;
const DOME_Y = 0.15 + DRUM_H;
const DOME_R = 1.48;
const BOARD: Vec3 = [1.95, 2.1, 0.55];
/** Scorecard bars: accuracy, faithfulness, latency budget (illustrative, they wobble as runs come in). */
const BARS = [
  { color: '#7fd99a', h: 0.62 },
  { color: '#82bdf2', h: 0.5 },
  { color: F.base, h: 0.38 },
];

function buildBuilding(): Part[] {
  const [cx, , cz] = CENTRE;
  return [
    part(cyl(1.85, 1.95, 0.15, 12), COLORS.rock, [cx, 0.075, cz]),
    part(cyl(1.5, 1.58, DRUM_H, 12), '#f4f1fb', [cx, 0.15 + DRUM_H / 2, cz]),
    part(cyl(1.53, 1.53, 0.2, 12), F.base, [cx, 0.15 + DRUM_H - 0.18, cz]),
    part(box(0.6, 1.0, 0.12), COLORS.woodDark, [cx, 0.65, cz + 1.53]),
    part(box(0.75, 0.12, 0.2), F.dark, [cx, 1.2, cz + 1.53]),
    // Little steps up to the door.
    part(box(0.9, 0.12, 0.35), '#d9d3e6', [cx, 0.06, cz + 1.95]),
  ];
}

/** The dome with its observing slit (local +Z), built to rotate as one piece. */
function buildDome(): Part[] {
  const parts: Part[] = [part(new SphereGeometry(DOME_R, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#e6e1ef')];
  for (let phi = 0.08; phi < 1.45; phi += 0.19) {
    parts.push(part(box(0.46, 0.06, 0.3), COLORS.outline, [0, Math.sin(phi) * (DOME_R + 0.01), Math.cos(phi) * (DOME_R + 0.01)], [Math.PI / 2 - phi, 0, 0]));
  }
  parts.push(part(torus(DOME_R, 0.05, 4, 24), F.dark, [0, 0.02, 0], [Math.PI / 2, 0, 0]));
  return parts;
}

/** Telescope tube along local +Z, pivoting at the dome centre. */
function buildScope(): Part[] {
  return [
    part(cyl(0.2, 0.26, 1.7, 10), '#fffaf2', [0, 0, 1.15], [Math.PI / 2, 0, 0]),
    part(cyl(0.27, 0.27, 0.16, 10), F.dark, [0, 0, 1.95], [Math.PI / 2, 0, 0]),
    part(cyl(0.28, 0.28, 0.2, 10), F.base, [0, 0, 0.55], [Math.PI / 2, 0, 0]),
    part(box(0.5, 0.5, 0.4), COLORS.rockDark, [0, -0.15, 0]),
  ];
}

function buildBoard(): Part[] {
  return [part(box(1.25, 0.95, 0.08), '#fffaf2', [0, 0, 0]), part(box(1.35, 0.08, 0.1), F.dark, [0, -0.5, 0]), part(box(1.35, 0.08, 0.1), F.dark, [0, 0.5, 0])];
}

/** Proving Grounds: an observatory whose telescope sweeps the sky, beside a floating eval scorecard. */
export default function Observatory() {
  const dome = useRef<Group>(null);
  const scope = useRef<Group>(null);
  const board = useRef<Group>(null);
  const bars = useRef<Mesh[]>([]);
  const barGeo = useGeo(() => {
    const g = box(0.24, 1, 0.06);
    g.translate(0, 0.5, 0);
    return g;
  });

  useLandmarkFrame((t) => {
    if (dome.current) dome.current.rotation.y = Math.sin(t * 0.22) * 1.1;
    if (scope.current) scope.current.rotation.x = -(0.65 + Math.sin(t * 0.37) * 0.2);
    if (board.current) {
      board.current.position.y = BOARD[1] + Math.sin(t * 1.6) * 0.12;
      board.current.rotation.y = -0.35 + Math.sin(t * 0.7) * 0.08;
    }
    bars.current.forEach((b, i) => {
      if (b) b.scale.y = Math.max(0.001, BARS[i].h * (0.85 + 0.15 * Math.sin(t * 1.3 + i * 1.7)));
    });
  });

  return (
    <group>
      <Static build={buildBuilding} />
      <group ref={dome} position={[CENTRE[0], DOME_Y, CENTRE[2]]}>
        <Static build={buildDome} />
        <group ref={scope} position={[0, 0.45, 0]}>
          <Static build={buildScope} outline={0.035} />
        </group>
      </group>
      <Near>
        <group ref={board} position={BOARD}>
          <Static build={buildBoard} outline={0.03} />
          {BARS.map((b, i) => (
            <mesh
              key={i}
              ref={(m) => {
                if (m) bars.current[i] = m;
              }}
              geometry={barGeo}
              material={toon(b.color)}
              position={[(i - 1) * 0.36, -0.38, 0.06]}
              scale={[1, b.h, 1]}
            />
          ))}
          <Caption position={[0, 0.34, 0.06]} size={0.15} outline="">
            Eval scorecard
          </Caption>
        </group>
      </Near>
    </group>
  );
}
