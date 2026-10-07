'use client';

import { useRef } from 'react';
import { CircleGeometry, type Group, type Mesh } from 'three';
import { beam, box, cyl, part, prism, ring, torus, type Part } from '@/lib/landmarkKit';
import { animatedGlow, glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Near, Static, useGeo, useLandmarkFrame } from './kit';

const F = TRACK_COLORS.fde;
const STONE = '#e6e1ef';
const STEEL = '#c6c1d6';
const FRONT = 0.32;
const DOOR_Y = 1.25;
const LOCK_Y = 3.85;

function buildVault(): Part[] {
  const parts: Part[] = [
    // Plinth, strongroom and a classical roof.
    part(box(3.5, 0.25, 2.8), '#d9d3e6', [0, 0.125, -0.6]),
    part(box(3.0, 2.2, 2.0), STONE, [0, 0.25 + 1.1, -0.68]),
    part(box(3.3, 0.22, 2.35), F.dark, [0, 2.56, -0.6]),
    part(prism(3.3, 0.7, 2.35), F.base, [0, 2.67, -0.6]),
    // Front steps.
    part(box(1.6, 0.12, 0.35), '#d9d3e6', [0, 0.06, 0.9]),
    // Round vault door in its frame.
    part(torus(0.92, 0.09, 6, 24), F.dark, [0, DOOR_Y, FRONT + 0.04]),
    part(cyl(0.86, 0.86, 0.14, 24), STEEL, [0, DOOR_Y, FRONT + 0.05], [Math.PI / 2, 0, 0]),
    part(cyl(0.6, 0.6, 0.04, 24), '#d9d4e6', [0, DOOR_Y, FRONT + 0.13], [Math.PI / 2, 0, 0]),
  ];
  // Bolts around the door.
  for (const p of ring(8, 0.74)) parts.push(part(cyl(0.05, 0.05, 0.06, 6), COLORS.outline, [p.x, DOOR_Y + p.z, FRONT + 0.14], [Math.PI / 2, 0, 0]));
  // Columns either side of the door.
  for (const x of [-1.3, -0.95, 0.95, 1.3]) {
    parts.push(part(cyl(0.13, 0.16, 2.2, 8), '#fffaf2', [x, 0.25 + 1.1, FRONT + 0.2]));
    parts.push(part(box(0.36, 0.1, 0.36), STONE, [x, 2.4, FRONT + 0.2]));
  }
  return parts;
}

/** The door wheel: a ring, three spokes and a hub (axis = local z, it spins in the frame callback). */
function buildWheel(): Part[] {
  const parts: Part[] = [part(torus(0.34, 0.045, 5, 18), COLORS.outline), part(cyl(0.1, 0.1, 0.1, 8), F.dark, [0, 0, 0.02], [Math.PI / 2, 0, 0])];
  for (const p of ring(3, 0.34)) parts.push(beam([0, 0, 0], [p.x, p.z, 0], 0.05, COLORS.outline));
  return parts;
}

/** Padlock: body + shackle. */
function buildLock(): Part[] {
  return [part(box(0.62, 0.5, 0.22), F.base, [0, 0, 0]), part(torus(0.2, 0.06, 5, 12, Math.PI), STEEL, [0, 0.25, 0]), part(cyl(0.06, 0.06, 0.12, 6), STEEL, [-0.2, 0.25, 0]), part(cyl(0.06, 0.06, 0.12, 6), STEEL, [0.2, 0.25, 0])];
}

/** The lock's halo (module scope: one vault, and the frame callback pulses its opacity). */
const HALO_MAT = animatedGlow('#ffd3d1', 0.45, false);

/** Trust Vault: a strongroom with a spinning door wheel and dial, guarded by a glowing padlock. */
export default function Vault() {
  const wheel = useRef<Group>(null);
  const dial = useRef<Mesh>(null);
  const lock = useRef<Group>(null);
  const halo = useRef<Mesh>(null);
  const dialGeo = useGeo(() => {
    const g = cyl(0.13, 0.13, 0.06, 12);
    g.rotateX(Math.PI / 2);
    return g;
  });
  const tickGeo = useGeo(() => box(0.03, 0.09, 0.02));
  const keyholeGeo = useGeo(() => cyl(0.06, 0.06, 0.03, 8));
  const haloGeo = useGeo(() => new CircleGeometry(0.62, 20));

  useLandmarkFrame((t) => {
    // The wheel turns a few notches, pauses, and turns back: someone is unlocking it.
    if (wheel.current) wheel.current.rotation.z = Math.sin(t * 0.6) * 2.2;
    if (dial.current) dial.current.rotation.z = -Math.round(Math.sin(t * 0.9) * 12) * (Math.PI / 12);
    if (lock.current) {
      lock.current.position.y = LOCK_Y + Math.sin(t * 1.4) * 0.12;
      lock.current.rotation.y = Math.sin(t * 0.6) * 0.5;
    }
    HALO_MAT.opacity = 0.25 + (Math.sin(t * 2.4) * 0.5 + 0.5) * 0.35;
    if (halo.current) halo.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.08);
  });

  return (
    <group>
      <Static build={buildVault} />
      <group ref={wheel} position={[0, DOOR_Y, FRONT + 0.2]}>
        <Static build={buildWheel} outline={0.025} />
      </group>
      <group position={[0.62, DOOR_Y + 0.5, FRONT + 0.16]}>
        <mesh ref={dial} geometry={dialGeo} material={toon('#fffaf2')}>
          <mesh geometry={tickGeo} material={toon(COLORS.outline)} position={[0, 0.08, 0.04]} />
        </mesh>
      </group>
      <Near>
        <group ref={lock} position={[0, LOCK_Y, -0.3]}>
          <mesh ref={halo} geometry={haloGeo} material={HALO_MAT} position={[0, 0.05, -0.14]} />
          <Static build={buildLock} outline={0.03} />
          <mesh geometry={keyholeGeo} material={glow('#fff1b0', 1, false)} position={[0, -0.03, 0.115]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      </Near>
    </group>
  );
}
