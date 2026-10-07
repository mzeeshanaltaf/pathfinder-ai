'use client';

import { useRef } from 'react';
import { SphereGeometry, type Group, type Mesh } from 'three';
import { box, cyl, ico, part, ring, torus, transformParts, type Part } from '@/lib/landmarkKit';
import { glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Near, Static, StaticGlow, useGeo, useLandmarkFrame } from './kit';

const D = TRACK_COLORS.developer;
const CAB_Y = 4.9;

function buildTower(): Part[] {
  const parts: Part[] = [
    part(box(2.8, 0.5, 2.8), COLORS.rock, [0, 0.25, 0]),
    part(cyl(0.78, 1.02, 4.3, 8), '#f4f1fb', [0, 2.65, 0]),
    part(cyl(0.84, 0.84, 0.3, 8), D.base, [0, 2.2, 0]),
    part(box(0.65, 1.1, 0.12), COLORS.woodDark, [0, 1.05, 0.95]),
    part(cyl(1.5, 1.05, 0.38, 8), '#e3dff0', [0, CAB_Y - 0.25, 0]),
    part(cyl(1.75, 1.55, 0.26, 8), D.dark, [0, CAB_Y + 1.06, 0]),
    part(cyl(0.05, 0.05, 1.5, 5), COLORS.outline, [0.3, CAB_Y + 1.9, 0.2]),
  ];
  for (const p of ring(8, 1.47, Math.PI / 8)) parts.push(part(box(0.1, 0.92, 0.1), COLORS.outline, [p.x, CAB_Y + 0.47, p.z]));
  return parts;
}

function buildGlass(): Part[] {
  return [part(cyl(1.42, 1.42, 0.9, 8), '#9fe7f5', [0, CAB_Y + 0.47, 0])];
}

/** Tool icons orbiting the cab, each built from a few primitives. */
const TOOLS: { name: string; build: () => Part[]; r: number; y: number; speed: number; phase: number }[] = [
  {
    name: 'wrench',
    build: () => [part(box(0.14, 0.75, 0.1), '#c6c1d6', [0, -0.15, 0]), part(torus(0.2, 0.07, 5, 10, Math.PI * 1.5), '#c6c1d6', [0, 0.32, 0], [0, 0, -Math.PI * 0.25])],
    r: 2.7,
    y: CAB_Y + 0.6,
    speed: 0.5,
    phase: 0,
  },
  {
    name: 'search',
    build: () => [part(torus(0.24, 0.07, 6, 14), D.base, [0, 0.12, 0]), part(cyl(0.06, 0.07, 0.45, 5), COLORS.woodDark, [0.24, -0.26, 0], [0, 0, 0.6])],
    r: 2.9,
    y: CAB_Y - 0.1,
    speed: 0.5,
    phase: Math.PI / 2,
  },
  {
    name: 'database',
    build: () => [0, 1, 2].map((i) => part(cyl(0.26, 0.26, 0.17, 10), i === 1 ? '#82bdf2' : '#c6e0fa', [0, -0.2 + i * 0.2, 0])),
    r: 2.7,
    y: CAB_Y + 0.9,
    speed: 0.5,
    phase: Math.PI,
  },
  {
    name: 'globe',
    build: () => [part(ico(0.27, 1), '#7fd99a'), part(torus(0.36, 0.035, 4, 16), '#ffc93c', [0, 0, 0], [1.2, 0, 0.3])],
    r: 2.9,
    y: CAB_Y + 0.2,
    speed: 0.5,
    phase: Math.PI * 1.5,
  },
];

/** Agent HQ: a control tower with a sweeping radar and tool icons orbiting the cab. */
export default function ControlTower() {
  const tools = useRef<Group[]>([]);
  const radar = useRef<Group>(null);
  const beacon = useRef<Mesh>(null);
  const dishGeo = useGeo(() => {
    const g = new SphereGeometry(0.45, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.6);
    g.rotateX(Math.PI / 2);
    return g;
  });
  const beaconGeo = useGeo(() => new SphereGeometry(0.11, 8, 6));

  useLandmarkFrame((t) => {
    TOOLS.forEach((tool, i) => {
      const g = tools.current[i];
      if (!g) return;
      const a = tool.phase + t * tool.speed;
      g.position.set(Math.cos(a) * tool.r, tool.y + Math.sin(t * 1.7 + i) * 0.15, Math.sin(a) * tool.r);
      g.rotation.y = -a + t;
    });
    if (radar.current) radar.current.rotation.y = t * 1.6;
    if (beacon.current) beacon.current.visible = Math.sin(t * 5) > 0;
  });

  return (
    <group>
      <Static build={buildTower} />
      <StaticGlow build={buildGlass} />
      <group ref={radar} position={[-0.55, CAB_Y + 1.3, -0.4]}>
        <mesh geometry={dishGeo} material={toon('#f4f1fb')} rotation={[0.35, 0, 0]} castShadow />
      </group>
      <mesh ref={beacon} geometry={beaconGeo} material={glow('#ff5d5d', 1, false)} position={[0.3, CAB_Y + 2.7, 0.2]} />
      <Near>{TOOLS.map((tool, i) => (
        <group
          key={tool.name}
          ref={(g) => {
            if (g) tools.current[i] = g;
          }}
        >
          <Static build={() => transformParts(tool.build(), [0, 0, 0])} outline={0.025} />
        </group>
      ))}</Near>
    </group>
  );
}
