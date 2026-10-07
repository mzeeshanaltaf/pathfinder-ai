'use client';

import { useMemo, useRef } from 'react';
import { Object3D, Vector3, type InstancedMesh, type Mesh } from 'three';
import { box, cyl, oct, part, type Part, type Vec3 } from '@/lib/landmarkKit';
import { glow } from '@/lib/materials';
import { COLORS } from '@/lib/palette';
import { hashString, mulberry32 } from '@/lib/random';
import { Static, useGeo, useHiddenInstances, useInstanceColors, useLandmarkFrame } from './kit';

const BOOK_COLORS = ['#e66a5c', '#7fd99a', '#82bdf2', '#ffc078', '#b9a3ee', '#ff9eb8', '#45b06a', '#f3dcb4'];

/** Three book towers (base x, z, and height in books). */
const TOWERS: { x: number; z: number; books: number }[] = [
  { x: -1.45, z: -0.5, books: 11 },
  { x: 1.45, z: -0.7, books: 14 },
  { x: 0, z: -2.1, books: 17 },
];

const ORB: Vec3 = [0, 3.0, 0.7];
const CHUNKS = 8;

function towerTops(): Vector3[] {
  const rng = mulberry32(hashString('library'));
  return TOWERS.map((t) => {
    let y = 0.14;
    for (let i = 0; i < t.books; i++) y += 0.22 + rng() * 0.12;
    return new Vector3(t.x, y, t.z);
  });
}

function buildTowers(): Part[] {
  const rng = mulberry32(hashString('library'));
  const parts: Part[] = [part(cyl(2.3, 2.45, 0.14, 12), '#a65d68', [0, 0.07, -0.6])];
  for (const t of TOWERS) {
    let y = 0.14;
    for (let i = 0; i < t.books; i++) {
      const h = 0.22 + rng() * 0.12;
      const w = 1.0 + rng() * 0.3;
      parts.push(
        part(box(w, h, 0.78 + rng() * 0.12), BOOK_COLORS[Math.floor(rng() * BOOK_COLORS.length)], [t.x + (rng() - 0.5) * 0.12, y + h / 2, t.z], [0, (rng() - 0.5) * 0.45, 0]),
      );
      y += h;
    }
  }
  // Reading lectern holding the answer orb.
  parts.push(part(cyl(0.12, 0.2, 2.2, 6), COLORS.woodDark, [ORB[0], 1.1, ORB[2]]));
  parts.push(part(cyl(0.4, 0.3, 0.18, 8), COLORS.wood, [ORB[0], 2.25, ORB[2]]));
  return parts;
}

/** RAG Library: book towers, with glowing chunks flying from the shelves into the answer orb. */
export default function Library() {
  const chunks = useRef<InstancedMesh>(null);
  const orb = useRef<Mesh>(null);
  const chunkGeo = useGeo(() => box(0.32, 0.22, 0.05));
  const orbGeo = useGeo(() => oct(0.38));
  const tops = useMemo(() => towerTops(), []);
  const target = useMemo(() => new Vector3(...ORB), []);
  const dummy = useMemo(() => new Object3D(), []);
  const tmp = useMemo(() => new Vector3(), []);
  useHiddenInstances(chunks);
  useInstanceColors(chunks, ['#fff1b0', '#c4f0cf', '#c6e0fa', '#ffe0b5']);

  useLandmarkFrame((t) => {
    const mesh = chunks.current;
    if (mesh) {
      for (let i = 0; i < CHUNKS; i++) {
        const u = (t * 0.32 + i / CHUNKS) % 1;
        const from = tops[i % tops.length];
        tmp.lerpVectors(from, target, u);
        dummy.position.set(tmp.x, tmp.y + Math.sin(u * Math.PI) * 1.3, tmp.z);
        dummy.rotation.set(t * 2 + i, t * 1.5 + i, 0);
        dummy.scale.setScalar(Math.max(0.001, Math.sin(Math.min(1, u * 1.15) * Math.PI)));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (orb.current) {
      orb.current.rotation.set(t * 0.7, t, 0);
      orb.current.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    }
  });

  return (
    <group>
      <Static build={buildTowers} />
      <instancedMesh ref={chunks} args={[chunkGeo, undefined, CHUNKS]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={orb} geometry={orbGeo} material={glow('#fff1b0', 1, false)} position={ORB} />
    </group>
  );
}
