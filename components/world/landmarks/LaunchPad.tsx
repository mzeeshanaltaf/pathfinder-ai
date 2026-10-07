'use client';

import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { beam, box, cone, cyl, part, ring, sphere, type Part, type Vec3 } from '@/lib/landmarkKit';
import { glow } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Smoke } from './fx';
import { Near, Static, StaticGlow, useGeo, useLandmarkFrame } from './kit';

const F = TRACK_COLORS.fde;
const ROCKET: Vec3 = [0.35, 0, -0.45];
const PAD_TOP = 0.3;
const BODY_H = 2.6;
const GANTRY: Vec3 = [-1.25, 0, -0.45];
const GANTRY_H = 4.2;
const STEEL = '#c6c1d6';

function buildPad(): Part[] {
  const [gx, , gz] = GANTRY;
  const parts: Part[] = [
    // Octagonal pad with a hazard ring and a flame trench.
    part(cyl(1.75, 1.9, PAD_TOP, 8), '#d9d3e6', [0.1, PAD_TOP / 2, -0.45]),
    part(cyl(1.3, 1.3, 0.04, 8), '#ffc93c', [0.1, PAD_TOP + 0.02, -0.45]),
    part(cyl(1.15, 1.15, 0.06, 8), '#e6e1ef', [0.1, PAD_TOP + 0.03, -0.45]),
    part(box(0.7, 0.05, 1.2), COLORS.outline, [ROCKET[0], PAD_TOP + 0.04, ROCKET[2] - 0.8]),
    // Gantry tower: four legs, cross-bars and two service arms reaching the rocket.
    part(box(1.0, 0.12, 1.0), COLORS.rockDark, [gx, PAD_TOP + 0.06, gz]),
  ];
  for (const sx of [-0.35, 0.35]) for (const sz of [-0.35, 0.35]) parts.push(part(box(0.1, GANTRY_H, 0.1), STEEL, [gx + sx, PAD_TOP + GANTRY_H / 2, gz + sz]));
  for (let y = 0.7; y < GANTRY_H; y += 0.7) {
    for (const sz of [-0.35, 0.35]) parts.push(beam([gx - 0.35, PAD_TOP + y - 0.7, gz + sz], [gx + 0.35, PAD_TOP + y, gz + sz], 0.06, F.dark));
    parts.push(part(box(0.8, 0.06, 0.8), STEEL, [gx, PAD_TOP + y, gz]));
  }
  parts.push(part(box(0.9, 0.12, 0.9), F.dark, [gx, PAD_TOP + GANTRY_H, gz]));
  // Service arms span from the gantry to the rocket's skin.
  for (const y of [1.2, 2.5]) parts.push(part(box(0.8, 0.1, 0.22), STEEL, [gx + 0.74, PAD_TOP + y, gz]));
  // Rocket support legs (static; the rocket itself trembles on top of them).
  for (const p of ring(3, 0.62, Math.PI / 6)) parts.push(beam([ROCKET[0] + p.x * 1.3, PAD_TOP, ROCKET[2] + p.z * 1.3], [ROCKET[0] + p.x, PAD_TOP + 0.55, ROCKET[2] + p.z], 0.1, STEEL));
  return parts;
}

function buildRocket(): Part[] {
  const base = PAD_TOP + 0.45;
  const parts: Part[] = [
    part(cyl(0.44, 0.5, BODY_H, 12), '#fffaf2', [0, base + BODY_H / 2, 0]),
    part(cyl(0.46, 0.46, 0.28, 12), F.base, [0, base + 0.55, 0]),
    part(cyl(0.45, 0.45, 0.22, 12), F.base, [0, base + BODY_H - 0.35, 0]),
    part(cone(0.44, 0.95, 12), F.dark, [0, base + BODY_H + 0.47, 0]),
    part(cyl(0.3, 0.38, 0.3, 10), COLORS.rockDark, [0, base - 0.12, 0]),
    part(sphere(0.06, 6, 4), '#ffc93c', [0, base + BODY_H + 0.97, 0]),
  ];
  // Fins point radially outwards (their long side along the radius).
  for (const p of ring(3, 0.5, Math.PI / 2)) parts.push(part(box(0.06, 0.7, 0.5), F.dark, [p.x * 1.05, base + 0.3, p.z * 1.05], [0, Math.PI / 2 - p.a, 0]));
  return parts;
}

/** Porthole (unlit), facing the island centre. */
function buildWindow(): Part[] {
  return [part(cyl(0.16, 0.16, 0.05, 10), '#9fe7f5', [0, PAD_TOP + 0.45 + BODY_H * 0.62, 0.47], [Math.PI / 2, 0, 0])];
}

/** Launch Pad: a rocket on its gantry, venting vapour and blinking its lights, counting down to production. */
export default function LaunchPad() {
  const rocket = useRef<Group>(null);
  const lights = useRef<Mesh[]>([]);
  const lightGeo = useGeo(() => sphere(0.09, 8, 6));

  useLandmarkFrame((t) => {
    // A countdown loop: idle tremble, then a short hop on "lift-off" every 8 s.
    const u = t % 8;
    const hop = u > 7 ? Math.sin(((u - 7) / 1) * Math.PI) * 0.35 : 0;
    if (rocket.current) {
      rocket.current.position.y = hop + Math.sin(t * 40) * (u > 6 ? 0.012 : 0.003);
      rocket.current.rotation.z = Math.sin(t * 33) * (u > 6 ? 0.004 : 0);
    }
    lights.current.forEach((m, i) => {
      if (m) m.visible = Math.sin(t * (u > 6 ? 12 : 3) + i * Math.PI) > 0;
    });
  });

  return (
    <group>
      <Static build={buildPad} />
      <group ref={rocket} position={[ROCKET[0], 0, ROCKET[2]]}>
        <Static build={buildRocket} />
        <StaticGlow build={buildWindow} />
      </group>
      <Smoke vents={[[ROCKET[0] - 0.5, PAD_TOP, ROCKET[2] + 0.2], [ROCKET[0] + 0.55, PAD_TOP, ROCKET[2] - 0.1]]} count={4} rise={0.9} size={0.42} speed={0.4} drift={[0.9, 0, 0.6]} />
      <Near>
        {[0, 1].map((i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) lights.current[i] = m;
            }}
            geometry={lightGeo}
            material={glow(i === 0 ? '#ff5d5d' : '#7fd99a', 1, false)}
            position={[GANTRY[0] + (i === 0 ? -0.35 : 0.35), PAD_TOP + GANTRY_H + 0.18, GANTRY[2] + 0.35]}
          />
        ))}
      </Near>
    </group>
  );
}
