'use client';

import { useMemo, useRef } from 'react';
import { ConeGeometry, Object3D, type Group, type InstancedMesh, type Mesh } from 'three';
import { box, cone, cyl, part, ring, sphere, torus, type Part } from '@/lib/landmarkKit';
import { animatedGlow, glow } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Static, useGeo, useHiddenInstances, useInstanceColors, useLandmarkFrame } from './kit';

const D = TRACK_COLORS.developer;
const LANTERN_Y = 6.25;
const TOKENS_PER_ARM = 7;
const TOKEN_COLORS = ['#ffd66e', '#ff9eb8', '#82bdf2', '#7fd99a', '#b9a3ee', '#ffa940', '#ffffff'];

function buildTower(): Part[] {
  const parts: Part[] = [
    part(cyl(1.75, 1.95, 0.45, 9), COLORS.rock, [0, 0.22, 0]),
    part(cyl(0.92, 1.32, 5.4, 10), '#fffaf2', [0, 3.1, 0]),
    part(cyl(1.2, 1.27, 0.55, 10), D.base, [0, 1.6, 0]),
    part(cyl(1.04, 1.1, 0.55, 10), D.base, [0, 3.55, 0]),
    part(box(0.7, 1.15, 0.12), COLORS.woodDark, [0, 1.02, 1.27]),
    part(cyl(1.3, 1.22, 0.18, 10), COLORS.outline, [0, 5.85, 0]),
    part(torus(1.2, 0.04, 4, 20), COLORS.outline, [0, 6.4, 0], [Math.PI / 2, 0, 0]),
    part(cyl(0.78, 0.78, 0.14, 10), D.dark, [0, 6.8, 0]),
    part(cone(0.95, 0.85, 10), D.dark, [0, 7.3, 0]),
    part(sphere(0.16, 8, 6), '#ffc93c', [0, 7.8, 0]),
  ];
  for (const p of ring(10, 1.2)) parts.push(part(cyl(0.035, 0.035, 0.55, 4), COLORS.outline, [p.x, 6.15, p.z]));
  for (const p of ring(6, 0.66, 0.3)) parts.push(part(box(0.07, 0.65, 0.07), COLORS.outline, [p.x, LANTERN_Y + 0.1, p.z]));
  return parts;
}

/** Animated beam glow (module scope: one lighthouse, and frame callbacks mutate it). */
const BEAM_MAT = animatedGlow('#fff1b0', 0.12);

/** LLM Lighthouse: the lamp sweeps a beam made of token blocks, generated one token at a time. */
export default function Lighthouse() {
  const spin = useRef<Group>(null);
  const tokens = useRef<InstancedMesh>(null);
  const lamp = useRef<Mesh>(null);
  const tokenGeo = useGeo(() => box(0.36, 0.36, 0.36));
  const lampGeo = useGeo(() => cyl(0.62, 0.62, 0.7, 10));
  const beamGeo = useGeo(() => {
    const g = new ConeGeometry(0.9, 6.5, 12, 1, true);
    g.translate(0, -3.25, 0);
    g.rotateZ(Math.PI / 2);
    return g;
  });
  const dummy = useMemo(() => new Object3D(), []);
  useHiddenInstances(tokens);
  useInstanceColors(tokens, TOKEN_COLORS);

  useLandmarkFrame((t) => {
    if (spin.current) spin.current.rotation.y = t * 0.55;
    if (lamp.current) lamp.current.scale.setScalar(1 + Math.sin(t * 4) * 0.04);
    BEAM_MAT.opacity = 0.1 + Math.sin(t * 2) * 0.03;
    const mesh = tokens.current;
    if (!mesh) return;
    // Tokens appear outwards one after another, then the sequence restarts.
    const shown = (t * 2.2) % (TOKENS_PER_ARM + 3);
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < TOKENS_PER_ARM; i++) {
        const k = arm * TOKENS_PER_ARM + i;
        const grow = Math.max(0, Math.min(1, shown - i));
        const dir = arm === 0 ? 1 : -1;
        dummy.position.set(dir * (1.1 + i * 0.78), Math.sin(t * 2 + i) * 0.05, 0);
        dummy.rotation.set(t * 0.8 + i, t * 0.5, 0);
        dummy.scale.setScalar(Math.max(0.001, grow * (1 - i * 0.07)));
        dummy.updateMatrix();
        mesh.setMatrixAt(k, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Static build={buildTower} />
      <mesh ref={lamp} geometry={lampGeo} material={glow('#fff1b0', 1, false)} position={[0, LANTERN_Y, 0]} />
      <group ref={spin} position={[0, LANTERN_Y, 0]}>
        <instancedMesh ref={tokens} args={[tokenGeo, undefined, TOKENS_PER_ARM * 2]} frustumCulled={false}>
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <mesh geometry={beamGeo} material={BEAM_MAT} />
        <mesh geometry={beamGeo} material={BEAM_MAT} rotation={[0, Math.PI, 0]} />
      </group>
    </group>
  );
}
