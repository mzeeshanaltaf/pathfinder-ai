'use client';

import { useMemo, useRef } from 'react';
import { Object3D, type Group, type InstancedMesh, type Mesh } from 'three';
import { box, cone, cyl, ico, part, type Part, type Vec3 } from '@/lib/landmarkKit';
import { glow, toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { hashString, mulberry32 } from '@/lib/random';
import { Smoke } from './fx';
import { Static, useGeo, useHiddenInstances, useInstanceColors, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
const STONE = '#c9c1d8';
const METAL = '#5d5a6e';
const ANVIL: Vec3 = [0.35, 0, 1.05];
const INGOT_Y = 0.92;
const STRIKE = 1.3;
const SPARKS = 16;

function buildForge(): Part[] {
  return [
    // Hearth + chimney.
    part(box(2.6, 1.7, 1.8), STONE, [0, 0.85, -0.75]),
    part(box(2.75, 0.22, 1.95), '#b3aac6', [0, 1.8, -0.75]),
    part(box(1.0, 0.8, 0.12), COLORS.outline, [-0.55, 0.75, 0.16]),
    part(box(0.85, 2.6, 0.85), STONE, [0.7, 3.1, -1.0]),
    part(box(1.0, 0.2, 1.0), '#b3aac6', [0.7, 4.45, -1.0]),
    // Anvil on its stump.
    part(cyl(0.34, 0.4, 0.5, 8), COLORS.woodDark, [ANVIL[0], 0.25, ANVIL[2]]),
    part(box(0.36, 0.2, 0.3), METAL, [ANVIL[0], 0.6, ANVIL[2]]),
    part(box(0.95, 0.22, 0.42), METAL, [ANVIL[0], 0.8, ANVIL[2]]),
    part(cone(0.18, 0.5, 6), METAL, [ANVIL[0] - 0.7, 0.82, ANVIL[2]], [0, 0, Math.PI / 2]),
    // Quench barrel and a stack of finished ingots.
    part(cyl(0.34, 0.3, 0.75, 8), COLORS.wood, [-1.65, 0.38, 0.75]),
    part(cyl(0.3, 0.3, 0.04, 8), E.base, [-1.65, 0.74, 0.75]),
    part(box(0.45, 0.14, 0.25), '#ffc93c', [1.55, 0.07, 0.25]),
    part(box(0.45, 0.14, 0.25), '#ffc93c', [1.6, 0.21, 0.3], [0, 0.3, 0]),
  ];
}

/** Model Forge: a hammer striking a glowing model ingot on the anvil, sparks flying with each blow. */
export default function Forge() {
  const hammer = useRef<Group>(null);
  const ingot = useRef<Mesh>(null);
  const fire = useRef<Mesh>(null);
  const sparks = useRef<InstancedMesh>(null);
  const ingotGeo = useGeo(() => box(0.5, 0.14, 0.26));
  const fireGeo = useGeo(() => ico(0.32, 0));
  const sparkGeo = useGeo(() => box(0.06, 0.06, 0.06));
  const handleGeo = useGeo(() => cyl(0.04, 0.05, 0.95, 5));
  const headGeo = useGeo(() => box(0.32, 0.18, 0.18));
  const seeds = useMemo(() => {
    const rng = mulberry32(hashString('sparks'));
    return Array.from({ length: SPARKS }, () => ({ vx: (rng() - 0.5) * 2.6, vy: 1.6 + rng() * 2.2, vz: (rng() - 0.5) * 2.6 }));
  }, []);
  const dummy = useMemo(() => new Object3D(), []);
  useHiddenInstances(sparks);
  useInstanceColors(sparks, ['#ffd66e', '#ffa940', '#fff1b0']);

  useLandmarkFrame((t) => {
    const u = (t % STRIKE) / STRIKE;
    // Raise slowly, strike fast.
    const swing = u < 0.75 ? Math.sin((u / 0.75) * Math.PI * 0.5) : 1 - (u - 0.75) / 0.25;
    if (hammer.current) hammer.current.rotation.z = 0.12 - swing * 1.3;
    const since = u * STRIKE; // the blow lands at u = 0
    if (ingot.current) ingot.current.scale.set(1 + Math.exp(-since * 6) * 0.15, 1 - Math.exp(-since * 6) * 0.2, 1);
    if (fire.current) {
      fire.current.scale.set(1 + Math.sin(t * 9) * 0.12, 1 + Math.sin(t * 7 + 1) * 0.2, 1);
      fire.current.rotation.y = t * 2;
    }
    const mesh = sparks.current;
    if (!mesh) return;
    seeds.forEach((s, i) => {
      const life = since;
      const alive = life < 0.7;
      dummy.position.set(ANVIL[0] + s.vx * life, INGOT_Y + s.vy * life - 4.9 * life * life, ANVIL[2] + s.vz * life);
      dummy.rotation.set(life * 9 + i, life * 6, 0);
      dummy.scale.setScalar(alive ? 1 - life / 0.7 + 0.001 : 0.001);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Static build={buildForge} />
      <Smoke vents={[[0.7, 4.6, -1.0]]} color="#e3dff0" />
      <mesh ref={fire} geometry={fireGeo} material={glow('#ff9b2f', 1, false)} position={[-0.55, 0.6, 0.12]} />
      <mesh ref={ingot} geometry={ingotGeo} material={glow('#ffb347', 1, false)} position={[ANVIL[0], INGOT_Y, ANVIL[2]]} />
      {/* Hammer pivots at its handle end, beside the anvil. */}
      <group ref={hammer} position={[ANVIL[0] + 1.0, INGOT_Y + 0.1, ANVIL[2]]}>
        <mesh geometry={handleGeo} material={toon(COLORS.wood)} position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
        <mesh geometry={headGeo} material={toon(METAL)} position={[-0.9, 0, 0]} castShadow />
      </group>
      <instancedMesh ref={sparks} args={[sparkGeo, undefined, SPARKS]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
