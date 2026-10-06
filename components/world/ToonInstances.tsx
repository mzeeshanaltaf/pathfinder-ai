'use client';

import { useLayoutEffect, useRef } from 'react';
import { Outlines } from '@react-three/drei';
import type { BufferGeometry, Color, InstancedMesh, Matrix4 } from 'three';
import { COLORS } from '@/lib/palette';
import { getToonGradient } from '@/lib/toon';

interface ToonInstancesProps {
  geometry: BufferGeometry;
  matrices: Matrix4[];
  /** Per-instance colours. When given, the material colour is white so they show unmodified. */
  colors?: Color[];
  color?: string;
  /** World-space outline thickness; 0 disables outlines. */
  outline?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/** One draw call (plus one for the outline) for many static toon-shaded props. */
export default function ToonInstances({
  geometry,
  matrices,
  colors,
  color = '#ffffff',
  outline = 0.05,
  castShadow = true,
  receiveShadow = false,
}: ToonInstancesProps) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    if (colors) {
      colors.forEach((c, i) => mesh.setColorAt(i, c));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [matrices, colors]);

  if (matrices.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, undefined, matrices.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <meshToonMaterial color={colors ? '#ffffff' : color} gradientMap={getToonGradient()} />
      {outline > 0 && <Outlines thickness={outline} color={COLORS.outline} />}
    </instancedMesh>
  );
}
