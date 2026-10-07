'use client';

import { useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { SphereGeometry, type Group, type Mesh } from 'three';
import { box, cone, cyl, part, prism, type Part } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, StaticGlow, useGeo, useLandmarkFrame } from './kit';

const D = TRACK_COLORS.developer;

function buildShop(): Part[] {
  const w = 2.9;
  const d = 2.3;
  const parts: Part[] = [
    part(box(w, 2.0, d), '#fff1d6', [0, 1.0, 0]),
    part(prism(w + 0.5, 1.15, d + 0.4), D.dark, [0, 2.0, 0]),
    part(box(w + 0.12, 0.18, d + 0.12), COLORS.woodDark, [0, 0.09, 0]),
    // Shop window counter + door.
    part(box(1.3, 0.7, 0.45), COLORS.wood, [-0.55, 0.35, d / 2 + 0.2]),
    part(box(0.72, 1.4, 0.08), COLORS.woodDark, [0.85, 0.7, d / 2 + 0.03]),
    part(box(1.9, 0.5, 0.1), COLORS.signBoard, [0, 2.32, d / 2 + 0.28]),
    // Workbench with a pot of brushes.
    part(box(1.0, 0.08, 0.6), COLORS.wood, [-1.95, 0.75, -0.2]),
    part(box(0.08, 0.75, 0.08), COLORS.woodDark, [-2.35, 0.37, -0.42]),
    part(box(0.08, 0.75, 0.08), COLORS.woodDark, [-1.55, 0.37, -0.42]),
    part(box(0.08, 0.75, 0.08), COLORS.woodDark, [-2.35, 0.37, 0.02]),
    part(box(0.08, 0.75, 0.08), COLORS.woodDark, [-1.55, 0.37, 0.02]),
    part(cyl(0.12, 0.1, 0.22, 7), '#ff9eb8', [-1.8, 0.9, -0.2]),
  ];
  // Striped awning sloping out over the counter.
  for (let i = 0; i < 6; i++) {
    parts.push(part(box(w / 6, 0.07, 0.8), i % 2 ? '#ffffff' : D.base, [-w / 2 + (i + 0.5) * (w / 6), 1.82, d / 2 + 0.36], [0.38, 0, 0]));
  }
  return parts;
}

function buildWindows(): Part[] {
  return [part(box(1.2, 0.75, 0.06), '#ffe9a8', [-0.55, 1.15, 1.18]), part(box(0.06, 0.6, 0.8), '#ffe9a8', [1.48, 1.2, -0.2])];
}

const BUBBLES = [
  { r: 2.4, y: 3.6, speed: 0.35, color: '#ffffff', phase: 0 },
  { r: 2.1, y: 4.5, speed: -0.28, color: D.light, phase: 2.1 },
  { r: 2.6, y: 3.0, speed: 0.22, color: '#fff3c4', phase: 4.2 },
];

/** Prompt Workshop: a craft shop with speech bubbles floating around it, typing "…". */
export default function CraftShop() {
  const bubbles = useRef<Group[]>([]);
  const dots = useRef<Mesh[]>([]);
  const bodyGeo = useGeo(() => {
    const g = new SphereGeometry(0.6, 12, 8);
    g.scale(1, 0.68, 0.35);
    return g;
  });
  const tailGeo = useGeo(() => cone(0.16, 0.34, 5));
  const dotGeo = useGeo(() => new SphereGeometry(0.07, 8, 6));

  useLandmarkFrame((t) => {
    BUBBLES.forEach((b, i) => {
      const g = bubbles.current[i];
      if (!g) return;
      const a = b.phase + t * b.speed;
      g.position.set(Math.cos(a) * b.r, b.y + Math.sin(t * 1.4 + i) * 0.2, Math.sin(a) * b.r);
    });
    dots.current.forEach((m, i) => {
      if (!m) return;
      const k = i % 3;
      m.scale.setScalar(1 + Math.max(0, Math.sin(t * 5 - k * 0.9)) * 0.6);
    });
  });

  return (
    <group>
      <Static build={buildShop} />
      <StaticGlow build={buildWindows} />
      <Caption position={[0, 2.32, 1.42]} size={0.3}>
        PROMPTS
      </Caption>
      <Near>{BUBBLES.map((b, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) bubbles.current[i] = g;
          }}
        >
          <Billboard>
            <mesh geometry={bodyGeo} material={toon(b.color)} castShadow />
            <mesh geometry={tailGeo} material={toon(b.color)} position={[-0.32, -0.42, 0]} rotation={[0, 0, 2.6]} />
            {[0, 1, 2].map((k) => (
              <mesh
                key={k}
                ref={(m) => {
                  if (m) dots.current[i * 3 + k] = m;
                }}
                geometry={dotGeo}
                material={toon(COLORS.outline)}
                position={[(k - 1) * 0.22, 0, 0.22]}
              />
            ))}
          </Billboard>
        </group>
      ))}</Near>
    </group>
  );
}
