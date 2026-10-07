'use client';

import { useMemo, useRef } from 'react';
import { Object3D, type InstancedMesh, type Mesh } from 'three';
import { getPhase } from '@/data/roadmap';
import { box, cyl, part, type Part, type Vec3 } from '@/lib/landmarkKit';
import { glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Static, StaticGlow, useGeo, useHiddenInstances, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
/** Stadium loop: straights of half-length L at z = ±R, semicircle ends of radius R. */
const L = 1.3;
const R = 0.85;
const PERIM = 4 * L + 2 * Math.PI * R;
const BELT_Y = 0.62;
const CRATES = 6;

/** Point on the loop at arc length s (front straight runs +x, i.e. clockwise seen from above). */
function loopPoint(s: number): [number, number] {
  let u = ((s % PERIM) + PERIM) % PERIM;
  if (u < 2 * L) return [-L + u, R];
  u -= 2 * L;
  if (u < Math.PI * R) {
    const f = u / R;
    return [L + R * Math.sin(f), R * Math.cos(f)];
  }
  u -= Math.PI * R;
  if (u < 2 * L) return [L - u, -R];
  u -= 2 * L;
  const f = u / R;
  return [-L - R * Math.sin(f), -R * Math.cos(f)];
}

function loopYaw(s: number): number {
  const [x0, z0] = loopPoint(s - 0.02);
  const [x1, z1] = loopPoint(s + 0.02);
  return Math.atan2(-(z1 - z0), x1 - x0);
}

/**
 * Lifecycle stages from the doc, in the order a crate meets them (it rounds the right end, runs
 * along the back, then the left end). The front stays open so the loop is visible.
 */
const LIFECYCLE = getPhase('eng-mlops-conveyor').diagrams![0].steps;
export const STATIONS: { name: string; at: Vec3; rotY: number; color: string }[] = [
  { name: LIFECYCLE[1], at: [L + R + 0.85, 0, 0], rotY: Math.PI / 2, color: '#ffc078' }, // Training
  { name: LIFECYCLE[2], at: [0.85, 0, -R - 0.95], rotY: 0, color: '#b9a3ee' }, // Evaluation
  { name: LIFECYCLE[4], at: [-0.85, 0, -R - 0.95], rotY: 0, color: '#7fd99a' }, // Deployment
  { name: LIFECYCLE[5], at: [-L - R - 0.85, 0, 0], rotY: -Math.PI / 2, color: '#82bdf2' }, // Monitoring
];

function buildLoop(): Part[] {
  const parts: Part[] = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const s = (i / n) * PERIM;
    const [x, z] = loopPoint(s);
    parts.push(part(box(PERIM / n + 0.04, 0.12, 0.55), COLORS.outline, [x, BELT_Y, z], [0, loopYaw(s), 0]));
    if (i % 3 === 0) parts.push(part(box(0.09, BELT_Y, 0.09), COLORS.rockDark, [x, BELT_Y / 2, z]));
  }
  for (const s of STATIONS) {
    const [x, , z] = s.at;
    parts.push(part(box(0.85, 1.0, 0.6), s.color, [x, 0.5, z], [0, s.rotY, 0]));
    parts.push(part(box(1.05, 0.12, 0.8), E.dark, [x, 1.06, z], [0, s.rotY, 0]));
    parts.push(part(box(1.25, 0.36, 0.08), COLORS.signBoard, [x, 1.42, z], [0, s.rotY, 0]));
  }
  parts.push(part(cyl(0.06, 0.08, 1.5, 6), COLORS.outline, [0, 0.75, 0]));
  parts.push(part(box(0.8, 0.52, 0.08), COLORS.outline, [0, 1.6, 0]));
  return parts;
}

function buildScreen(): Part[] {
  const parts: Part[] = [part(box(0.7, 0.42, 0.02), '#1f3b4d', [0, 1.6, 0.05])];
  [0.2, 0.32, 0.26, 0.38, 0.3].forEach((h, i) => parts.push(part(box(0.08, h * 0.7, 0.02), '#7ff3ff', [-0.24 + i * 0.12, 1.42 + (h * 0.7) / 2, 0.07])));
  return parts;
}

/** MLOps Conveyor: model crates riding a looping conveyor past the lifecycle stations. */
export default function Conveyor() {
  const crates = useRef<InstancedMesh>(null);
  const lamp = useRef<Mesh>(null);
  const crateGeo = useGeo(() => box(0.4, 0.34, 0.4));
  const lampGeo = useGeo(() => cyl(0.08, 0.08, 0.08, 8));
  const dummy = useMemo(() => new Object3D(), []);
  useHiddenInstances(crates);

  useLandmarkFrame((t) => {
    const mesh = crates.current;
    if (mesh) {
      for (let i = 0; i < CRATES; i++) {
        const s = t * 0.55 + (i * PERIM) / CRATES;
        const [x, z] = loopPoint(s);
        dummy.position.set(x, BELT_Y + 0.06 + 0.17, z);
        dummy.rotation.set(0, loopYaw(s), 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (lamp.current) lamp.current.visible = Math.sin(t * 4) > -0.2;
  });

  return (
    <group>
      <Static build={buildLoop} outline={0.035} />
      <StaticGlow build={buildScreen} />
      <instancedMesh ref={crates} args={[crateGeo, toon('#e0b04a'), CRATES]} frustumCulled={false} castShadow />
      <mesh ref={lamp} geometry={lampGeo} material={glow('#7fd99a', 1, false)} position={[0, 1.9, 0]} />
      {STATIONS.map((s) => (
        <group key={s.name} position={s.at} rotation={[0, s.rotY, 0]}>
          <Caption position={[0, 1.42, 0.05]} size={0.2} outline="">
            {s.name}
          </Caption>
          <Caption position={[0, 1.42, -0.05]} rotation={[0, Math.PI, 0]} size={0.2} outline="">
            {s.name}
          </Caption>
        </group>
      ))}
    </group>
  );
}
