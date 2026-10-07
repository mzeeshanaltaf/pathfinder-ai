'use client';

import { useMemo, useRef } from 'react';
import { IcosahedronGeometry, Object3D, type InstancedMesh } from 'three';
import type { Vec3 } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { useGeo, useHiddenInstances, useLandmarkFrame } from './kit';

/** Looping puffs rising from one or more vents (chimneys, cooling towers). One instanced draw. */
export function Smoke({
  vents,
  count = 5,
  rise = 2.6,
  size = 0.45,
  speed = 0.32,
  drift = [0.35, 0, 0.15],
  color = '#f4f1fb',
}: {
  vents: Vec3[];
  count?: number;
  rise?: number;
  size?: number;
  speed?: number;
  drift?: Vec3;
  color?: string;
}) {
  const ref = useRef<InstancedMesh>(null);
  const geo = useGeo(() => new IcosahedronGeometry(1, 0));
  const dummy = useMemo(() => new Object3D(), []);
  const total = vents.length * count;
  useHiddenInstances(ref);

  useLandmarkFrame((t) => {
    const mesh = ref.current;
    if (!mesh) return;
    let i = 0;
    vents.forEach((v, vi) => {
      for (let k = 0; k < count; k++, i++) {
        const u = (t * speed + k / count + vi * 0.37) % 1;
        const grow = Math.sin(Math.min(1, u * 1.25) * Math.PI * 0.5) * (1 - u * u);
        dummy.position.set(v[0] + drift[0] * u * rise, v[1] + u * rise, v[2] + drift[2] * u * rise);
        dummy.rotation.set(u * 2 + k, u * 3, 0);
        dummy.scale.setScalar(Math.max(0.001, size * (0.45 + u) * grow));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, toon(color), total]} frustumCulled={false} />;
}
