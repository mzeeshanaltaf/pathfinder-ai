'use client';

import { useRef } from 'react';
import { ConeGeometry, SphereGeometry, type Group, type Mesh } from 'three';
import { box, cone, cyl, extrude, part, type Part } from '@/lib/landmarkKit';
import { animatedGlow, glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Near, Static, useGeo, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
const HALF = 1.65;
const WALL_H = 2.9;
const STONE = '#cfd6e6';

/** Keyhole outline (x, y): a round head over a tapered slot. */
const KEYHOLE: [number, number][] = (() => {
  const pts: [number, number][] = [
    [-0.32, 0],
    [0.32, 0],
    [0.17, 1.15],
  ];
  for (let i = 0; i <= 14; i++) {
    const a = -0.95 + (i / 14) * (Math.PI + 1.9);
    pts.push([Math.cos(a) * 0.42, 1.55 + Math.sin(a) * 0.42]);
  }
  pts.push([-0.17, 1.15]);
  return pts;
})();

function buildCitadel(): Part[] {
  const parts: Part[] = [part(box(HALF * 2 + 0.6, 0.25, HALF * 2 + 0.6), COLORS.rock, [0, 0.12, 0])];
  const walls: { x: number; z: number; rot: number }[] = [
    { x: 0, z: HALF, rot: 0 },
    { x: 0, z: -HALF, rot: 0 },
    { x: HALF, z: 0, rot: Math.PI / 2 },
    { x: -HALF, z: 0, rot: Math.PI / 2 },
  ];
  for (const w of walls) {
    parts.push(part(box(HALF * 2, WALL_H, 0.38), STONE, [w.x, WALL_H / 2, w.z], [0, w.rot, 0]));
    for (const k of [-1.05, -0.35, 0.35, 1.05]) {
      const dx = w.rot ? 0 : k;
      const dz = w.rot ? k : 0;
      parts.push(part(box(0.32, 0.3, 0.42), STONE, [w.x + dx, WALL_H + 0.15, w.z + dz], [0, w.rot, 0]));
    }
  }
  for (const x of [-HALF, HALF])
    for (const z of [-HALF, HALF]) {
      parts.push(part(cyl(0.44, 0.5, WALL_H + 0.9, 8), '#bcc6dc', [x, (WALL_H + 0.9) / 2, z]));
      parts.push(part(cone(0.6, 0.85, 8), E.dark, [x, WALL_H + 1.32, z]));
    }
  // Inner keep with a beacon cap.
  parts.push(part(box(1.3, 4.6, 1.3), '#dfe5f1', [0, 2.3, -0.2]));
  parts.push(part(cone(1.05, 1.0, 4), E.dark, [0, 5.1, -0.2], [0, Math.PI / 4, 0]));
  // Keyhole gate frame on the front wall.
  parts.push(part(extrude(KEYHOLE, 0.08, 0.02), COLORS.outline, [0, 0.12, HALF + 0.2], [0, 0, 0], 1.12));
  return parts;
}

const DRONES = [
  { r: 3.3, y: 4.3, speed: 0.45, phase: 0 },
  { r: 3.6, y: 5.0, speed: -0.35, phase: 2.1 },
  { r: 3.1, y: 3.7, speed: 0.3, phase: 4.2 },
];

/** Keyhole glow + drone scan beams (module scope: one citadel, animated in the frame loop). */
const KEY_MAT = animatedGlow('#7ff3ff', 0.9);
const SCAN_MAT = animatedGlow('#ff7a7a', 0.1);

/** Security Citadel: tall walls, a glowing keyhole gate and patrol drones circling with scan beams. */
export default function Citadel() {
  const drones = useRef<Group[]>([]);
  const rotors = useRef<Mesh[]>([]);
  const keyhole = useRef<Mesh>(null);
  const keyGeo = useGeo(() => extrude(KEYHOLE, 0.06, 0));
  const bodyGeo = useGeo(() => {
    const g = new SphereGeometry(0.28, 10, 6);
    g.scale(1, 0.55, 1);
    return g;
  });
  const armGeo = useGeo(() => box(0.95, 0.05, 0.08));
  const rotorGeo = useGeo(() => cyl(0.17, 0.17, 0.03, 10));
  const eyeGeo = useGeo(() => new SphereGeometry(0.07, 8, 6));
  const scanGeo = useGeo(() => {
    const g = new ConeGeometry(0.75, 2.6, 12, 1, true);
    g.translate(0, -1.3, 0);
    return g;
  });

  useLandmarkFrame((t) => {
    DRONES.forEach((d, i) => {
      const g = drones.current[i];
      if (!g) return;
      const a = d.phase + t * d.speed;
      g.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 2 + i) * 0.15, Math.sin(a) * d.r);
      g.rotation.y = -a + (d.speed > 0 ? 0 : Math.PI);
      g.rotation.z = Math.sin(t * 1.5 + i) * 0.08;
    });
    rotors.current.forEach((r, i) => {
      if (r) r.rotation.y = t * 30 + i;
    });
    KEY_MAT.opacity = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.4));
    SCAN_MAT.opacity = 0.07 + 0.05 * (0.5 + 0.5 * Math.sin(t * 5));
    if (keyhole.current) keyhole.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.02);
  });

  return (
    <group>
      <Static build={buildCitadel} />
      <mesh ref={keyhole} geometry={keyGeo} material={KEY_MAT} position={[0, 0.17, HALF + 0.26]} />
      <Near>{DRONES.map((d, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) drones.current[i] = g;
          }}
        >
          <mesh geometry={bodyGeo} material={toon('#f4f1fb')} castShadow />
          <mesh geometry={armGeo} material={toon(COLORS.outline)} rotation={[0, Math.PI / 4, 0]} />
          <mesh geometry={armGeo} material={toon(COLORS.outline)} rotation={[0, -Math.PI / 4, 0]} />
          {[0, 1, 2, 3].map((k) => {
            const a = Math.PI / 4 + (k * Math.PI) / 2;
            return (
              <mesh
                key={k}
                ref={(m) => {
                  if (m) rotors.current[i * 4 + k] = m;
                }}
                geometry={rotorGeo}
                material={toon(E.base)}
                position={[Math.cos(a) * 0.45, 0.06, Math.sin(a) * 0.45]}
              />
            );
          })}
          <mesh geometry={eyeGeo} material={glow('#ff5d5d', 1, false)} position={[0, -0.04, 0.26]} />
          <mesh geometry={scanGeo} material={SCAN_MAT} position={[0, -0.12, 0]} />
        </group>
      ))}</Near>
    </group>
  );
}
