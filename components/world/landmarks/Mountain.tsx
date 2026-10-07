'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { box, cone, cyl, extrude, part, sphere, strokeGlyph, type Part } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Static, useGeo, useLandmarkFrame } from './kit';

const TERRACES = [
  { r: 2.3, h: 1.2 },
  { r: 1.8, h: 1.15 },
  { r: 1.32, h: 1.1 },
  { r: 0.86, h: 1.0 },
];

/** Valley (half-pipe) placed behind-left of the mountain; y = BASE + K·x² across its length. */
const VALLEY = { x: -2.55, z: -1.9, rot: 0.75, half: 1.5, K: 0.36, base: 0.16, depth: 1.05 };
const BALL_R = 0.2;

function buildMountain(): Part[] {
  const parts: Part[] = [];
  let y = 0;
  TERRACES.forEach((t, i) => {
    parts.push(part(cyl(t.r * 0.92, t.r, t.h, 7), i % 2 ? COLORS.rock : '#b4abc4', [0, y + t.h / 2, 0], [0, i * 0.4, 0]));
    parts.push(part(cyl(t.r * 0.93, t.r * 0.93, 0.12, 7), '#9ed47a', [0, y + t.h + 0.03, 0], [0, i * 0.4, 0]));
    y += t.h;
  });
  parts.push(part(cone(0.86, 1.1, 7), '#ffffff', [0, y + 0.55, 0], [0, 1.6, 0]));
  // Valley trough: a block with a parabola scooped out of its top.
  const { half, K, base, depth } = VALLEY;
  const top = base + K * half * half + 0.12;
  const curve: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const x = half - (i / 16) * half * 2;
    curve.push([x, base + K * x * x]);
  }
  parts.push(
    part(extrude([[-half - 0.15, 0], [half + 0.15, 0], [half + 0.15, top], ...curve, [-half - 0.15, top]], depth, 0.03), '#c9b8f0', [VALLEY.x, 0, VALLEY.z], [0, VALLEY.rot, 0]),
  );
  return parts;
}

/** Σ from four bars. */
function sigmaParts(): Part[] {
  const c = TRACK_COLORS.common.dark;
  return [
    part(box(0.9, 0.16, 0.2), c, [0, 0.62, 0]),
    part(box(0.9, 0.16, 0.2), c, [0, -0.62, 0]),
    part(box(0.16, 0.72, 0.2), c, [-0.08, 0.3, 0], [0, 0, 0.72]),
    part(box(0.16, 0.72, 0.2), c, [-0.08, -0.3, 0], [0, 0, -0.72]),
  ];
}

const INTEGRAL: [number, number][] = [
  [0.38, 0.95],
  [0.22, 1.05],
  [0.08, 0.8],
  [0, 0],
  [-0.08, -0.8],
  [-0.22, -1.05],
  [-0.38, -0.95],
];

/** Math Mountain: stepped terraces, a ball rolling down a valley (gradient descent) and floating Σ ∫. */
export default function Mountain() {
  const ball = useRef<Mesh>(null);
  const glyphs = useRef<Group>(null);
  const ballGeo = useGeo(() => sphere(BALL_R, 10, 8));
  const integral = useGeo(() => strokeGlyph(INTEGRAL, 0.15, 0.2));

  useLandmarkFrame((t) => {
    const b = ball.current;
    if (b) {
      // Damped roll into the minimum, restarting from the rim every 8 s.
      const u = t % 8;
      const x = VALLEY.half * 0.92 * Math.cos(2.1 * u) * Math.exp(-0.42 * u);
      b.position.set(x, VALLEY.base + VALLEY.K * x * x + BALL_R, 0);
      b.rotation.z = -x / BALL_R;
    }
    const g = glyphs.current;
    if (g) {
      g.rotation.y = t * 0.35;
      g.position.y = 6.3 + Math.sin(t * 1.1) * 0.15;
    }
  });

  return (
    <group>
      <Static build={buildMountain} />
      <group position={[VALLEY.x, 0, VALLEY.z]} rotation={[0, VALLEY.rot, 0]}>
        <mesh ref={ball} geometry={ballGeo} material={toon('#ff6b6b')} castShadow />
      </group>
      <group ref={glyphs} position={[0, 6.3, 0]}>
        <group position={[2.1, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Static build={sigmaParts} outline={0.03} />
        </group>
        <mesh geometry={integral} material={toon(TRACK_COLORS.common.dark)} position={[-2.1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow />
      </group>
    </group>
  );
}
