'use client';

import { Suspense, useMemo, type ReactNode } from 'react';
import { Billboard, Outlines, Text } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { ISLAND_LABELS, ISLAND_TRACK, type IslandDef } from '@/data/world';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { getToonGradient } from '@/lib/toon';
import { landmarkOffset } from '@/lib/worldLayout';

export const LABEL_FONT = '/fonts/Geist-Regular.ttf';

/** Phase 1 placeholder: a track-coloured pillar with a floating name label. */
function PlaceholderLandmark({ def }: { def: IslandDef }) {
  const colors = TRACK_COLORS[ISLAND_TRACK[def.id]];
  const gradient = getToonGradient();

  return (
    <group scale={def.landmark === 'summit-plaza' ? 1.5 : 1}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.6, 8]} />
        <meshToonMaterial color={colors.dark} gradientMap={gradient} />
        <Outlines thickness={0.05} color={COLORS.outline} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.0, 4.2, 8]} />
        <meshToonMaterial color={colors.base} gradientMap={gradient} />
        <Outlines thickness={0.05} color={COLORS.outline} />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <octahedronGeometry args={[0.9, 0]} />
        <meshToonMaterial color={colors.light} gradientMap={gradient} />
        <Outlines thickness={0.05} color={COLORS.outline} />
      </mesh>
    </group>
  );
}

function Label({ text, height }: { text: string; height: number }) {
  return (
    <Billboard position={[0, height, 0]}>
      <Text
        font={LABEL_FONT}
        fontSize={1.3}
        color={COLORS.label}
        outlineWidth={0.12}
        outlineColor="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </Billboard>
  );
}

export default function Landmark({ def }: { def: IslandDef }) {
  const [ox, oz] = useMemo(() => landmarkOffset(def), [def]);
  const tall = def.landmark === 'summit-plaza';
  const s = tall ? 1.5 : 1;

  let body: ReactNode;
  switch (def.landmark) {
    // Phase 5 adds one bespoke landmark per type here.
    default:
      body = <PlaceholderLandmark def={def} />;
  }

  return (
    <group position={[def.position[0] + ox, def.position[1], def.position[2] + oz]}>
      {body}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[2.5 * s, 1.3 * s]} position={[0, 2.5 * s, 0]} />
      </RigidBody>
      <Suspense fallback={null}>
        <Label text={ISLAND_LABELS[def.id]} height={tall ? 10.5 : 7.5} />
      </Suspense>
    </group>
  );
}
