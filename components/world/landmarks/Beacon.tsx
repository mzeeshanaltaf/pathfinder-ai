'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { beam, box, cone, cyl, part, ring, sphere, torus, type Part } from '@/lib/landmarkKit';
import { animatedGlow, glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, useGeo, useLandmarkFrame } from './kit';

const F = TRACK_COLORS.fde;
const BASE_H = 0.35;
const SEGMENTS = 5;
const SEG_H = 0.95;
const MAST_TOP = BASE_H + SEGMENTS * SEG_H;
const LAMP_Y = MAST_TOP + 0.35;
const SIGN_Z = 1.25;

function buildMast(): Part[] {
  const parts: Part[] = [
    part(cyl(1.15, 1.3, BASE_H, 8), '#d9d3e6', [0, BASE_H / 2, -0.3]),
    part(cyl(0.7, 0.8, 0.25, 8), COLORS.rockDark, [0, BASE_H + 0.12, -0.3]),
    // The sign at the front, on two posts.
    part(box(1.3, 0.55, 0.1), '#fffaf2', [0, 0.95, SIGN_Z]),
    part(box(1.4, 0.08, 0.14), F.dark, [0, 1.24, SIGN_Z]),
  ];
  for (const x of [-0.55, 0.55]) parts.push(part(box(0.08, 0.95, 0.08), COLORS.woodDark, [x, 0.47, SIGN_Z - 0.06]));
  // Striped, tapering mast (coral and white, like a radio mast).
  for (let i = 0; i < SEGMENTS; i++) {
    const r0 = 0.24 - i * 0.03;
    parts.push(part(cyl(r0 - 0.03, r0, SEG_H, 6), i % 2 ? '#fffaf2' : F.base, [0, BASE_H + 0.25 + SEG_H * (i + 0.5), -0.3]));
  }
  parts.push(part(cyl(0.22, 0.22, 0.12, 8), F.dark, [0, MAST_TOP + 0.25, -0.3]));
  parts.push(part(cone(0.24, 0.35, 8), F.dark, [0, LAMP_Y + 0.42, -0.3]));
  // Guy wires to the base rim.
  for (const p of ring(3, 1.05, Math.PI / 6)) parts.push(beam([p.x, BASE_H, -0.3 + p.z], [0, MAST_TOP - 0.6, -0.3], 0.025, COLORS.outline, true));
  return parts;
}

/** Signal rings (module scope: one beacon, and the frame callback fades each ring as it grows). */
const RINGS = 3;
const RING_MATS = Array.from({ length: RINGS }, () => animatedGlow(F.base, 0.6, false));

/** Go-Live Beacon: a mast whose lamp sends out widening signal rings, with a flag and an on-air LIVE sign. */
export default function Beacon() {
  const lamp = useRef<Mesh>(null);
  const flag = useRef<Group>(null);
  const rings = useRef<Mesh[]>([]);
  const lampGeo = useGeo(() => sphere(0.26, 10, 8));
  const ringGeo = useGeo(() => torus(1, 0.05, 4, 32));
  const flagGeo = useGeo(() => box(0.8, 0.5, 0.03));
  const dot = useRef<Mesh>(null);
  const dotGeo = useGeo(() => sphere(0.09, 8, 6));

  useLandmarkFrame((t) => {
    if (lamp.current) lamp.current.scale.setScalar(1 + Math.max(0, Math.sin(t * 3)) * 0.35);
    if (dot.current) dot.current.visible = Math.sin(t * 4) > -0.3;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const u = (t * 0.4 + i / RINGS) % 1;
      const r = 0.35 + u * 3.2;
      m.scale.set(r, r, 1);
      m.position.y = LAMP_Y + u * 0.6;
      RING_MATS[i].opacity = 0.7 * (1 - u) * Math.min(1, u * 6);
    });
    if (flag.current) flag.current.rotation.y = Math.sin(t * 2.6) * 0.45 + 0.2;
  });

  return (
    <group>
      <Static build={buildMast} />
      <mesh ref={lamp} geometry={lampGeo} material={glow('#fff1b0', 1, false)} position={[0, LAMP_Y, -0.3]} />
      {RING_MATS.map((mat, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m;
          }}
          geometry={ringGeo}
          material={mat}
          position={[0, LAMP_Y, -0.3]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      <Near>
        <group ref={flag} position={[0, MAST_TOP - 0.55, -0.3]}>
          <mesh geometry={flagGeo} material={toon(F.dark)} position={[0.45, 0, 0]} castShadow />
        </group>
      </Near>
      <mesh ref={dot} geometry={dotGeo} material={glow('#ff5d5d', 1, false)} position={[-0.38, 0.95, SIGN_Z + 0.06]} />
      <Caption position={[0.12, 0.95, SIGN_Z + 0.06]} size={0.3} color={F.dark}>
        LIVE
      </Caption>
    </group>
  );
}
