'use client';

import { useMemo, useRef } from 'react';
import { Object3D, type InstancedMesh, type Mesh } from 'three';
import { box, cyl, extrude, gearGeometry, part, type Part } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Smoke } from './fx';
import { Static, StaticGlow, useGeo, useHiddenInstances, useLandmarkFrame } from './kit';

const D = TRACK_COLORS.developer;
const W = 3.4;
const DEPTH = 2.6;
export const BELT = { x0: 1.75, x1: 3.1, y: 0.72, z: 0.25 };
const BOXES = 4;

function buildFactory(): Part[] {
  const parts: Part[] = [
    part(box(W, 2.3, DEPTH), '#ebe6f4', [0, 1.15, 0]),
    part(box(W + 0.12, 0.18, DEPTH + 0.12), COLORS.rockDark, [0, 0.09, 0]),
    part(box(0.7, 1.3, 0.08), COLORS.woodDark, [1.25, 0.65, DEPTH / 2 + 0.03]),
    part(box(0.08, 0.9, 0.9), COLORS.woodDark, [W / 2 + 0.03, 0.75, BELT.z]),
    // Chimney with stripes.
    part(cyl(0.3, 0.38, 4.6, 8), '#c97b63', [-1.15, 2.3, -0.85]),
    part(cyl(0.33, 0.33, 0.25, 8), '#ffffff', [-1.15, 3.6, -0.85]),
    part(cyl(0.33, 0.33, 0.25, 8), '#ffffff', [-1.15, 4.3, -0.85]),
    // Conveyor: belt, frame and legs.
    part(box(BELT.x1 - BELT.x0 + 0.3, 0.12, 0.72), COLORS.outline, [(BELT.x0 + BELT.x1) / 2, BELT.y, BELT.z]),
    part(box(BELT.x1 - BELT.x0 + 0.4, 0.1, 0.08), '#ffc93c', [(BELT.x0 + BELT.x1) / 2, BELT.y + 0.03, BELT.z + 0.4]),
    part(box(BELT.x1 - BELT.x0 + 0.4, 0.1, 0.08), '#ffc93c', [(BELT.x0 + BELT.x1) / 2, BELT.y + 0.03, BELT.z - 0.4]),
    part(box(0.7, 0.45, 0.8), COLORS.wood, [BELT.x1 + 0.45, 0.23, BELT.z]),
  ];
  for (const x of [BELT.x0 + 0.1, BELT.x1 - 0.1]) for (const dz of [-0.3, 0.3]) parts.push(part(box(0.1, BELT.y, 0.1), COLORS.rockDark, [x, BELT.y / 2, BELT.z + dz]));
  // Saw-tooth roof: three north-light teeth, glass on the steep side.
  for (let i = 0; i < 3; i++) {
    const x0 = -W / 2 + (i * W) / 3;
    parts.push(
      part(
        extrude(
          [
            [0, 0],
            [W / 3, 0],
            [W / 3, 0.75],
          ],
          DEPTH,
          0,
        ),
        D.dark,
        [x0, 2.3, 0],
      ),
    );
  }
  return parts;
}

function buildGlow(): Part[] {
  const parts: Part[] = [];
  for (let i = 0; i < 3; i++) parts.push(part(box(0.05, 0.6, DEPTH - 0.3), '#c6e0fa', [-W / 2 + ((i + 1) * W) / 3 - 0.02, 2.62, 0]));
  parts.push(part(box(0.06, 0.55, 1.2), '#ffe9a8', [-W / 2 - 0.03, 1.4, 0.2]));
  return parts;
}

/** App Factory: a saw-tooth factory with a big turning gear and boxes riding a conveyor out of the side door. */
export default function Factory() {
  const big = useRef<Mesh>(null);
  const small = useRef<Mesh>(null);
  const boxes = useRef<InstancedMesh>(null);
  const bigGeo = useGeo(() => gearGeometry(12, 0.92, 0.76, 0.18, 0.22));
  const smallGeo = useGeo(() => gearGeometry(8, 0.6, 0.46, 0.16, 0.15));
  const boxGeo = useGeo(() => box(0.38, 0.32, 0.38));
  const dummy = useMemo(() => new Object3D(), []);
  useHiddenInstances(boxes);

  useLandmarkFrame((t) => {
    if (big.current) big.current.rotation.z = t * 0.6;
    if (small.current) small.current.rotation.z = -t * 0.6 * (12 / 8) + 0.2;
    const mesh = boxes.current;
    if (!mesh) return;
    for (let i = 0; i < BOXES; i++) {
      const u = (t * 0.22 + i / BOXES) % 1;
      const x = BELT.x0 - 0.2 + u * (BELT.x1 - BELT.x0 + 0.5);
      const s = Math.min(1, u * 8, (1 - u) * 8);
      dummy.position.set(x, BELT.y + 0.06 + 0.16 * s, BELT.z);
      dummy.rotation.set(0, i * 0.4, 0);
      dummy.scale.setScalar(Math.max(0.001, s));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Static build={buildFactory} />
      <StaticGlow build={buildGlow} />
      <Smoke vents={[[-1.15, 4.7, -0.85]]} />
      <mesh ref={big} geometry={bigGeo} material={toon(D.base)} position={[-0.75, 1.35, DEPTH / 2 + 0.12]} castShadow />
      <mesh ref={small} geometry={smallGeo} material={toon('#ffc93c')} position={[0.56, 1.77, DEPTH / 2 + 0.12]} castShadow />
      <instancedMesh ref={boxes} args={[boxGeo, toon('#d9a066'), BOXES]} frustumCulled={false} castShadow />
    </group>
  );
}
