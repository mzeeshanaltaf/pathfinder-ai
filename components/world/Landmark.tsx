'use client';

import { Suspense, useMemo, type ReactNode } from 'react';
import { Billboard, Outlines, Text } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { getPhase } from '@/data/roadmap';
import { ISLAND_TRACK, type IslandDef } from '@/data/world';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { getToonGradient } from '@/lib/toon';
import { landmarkPosition, landmarkRadius, landmarkScale } from '@/lib/worldLayout';

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
  const position = useMemo(() => landmarkPosition(def), [def]);
  const s = landmarkScale(def);
  const tall = s > 1;

  let body: ReactNode;
  switch (def.landmark) {
    // Phase 5 adds one bespoke landmark per type here.
    default:
      body = <PlaceholderLandmark def={def} />;
  }

  return (
    <group position={position}>
      {body}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[2.5 * s, landmarkRadius(def)]} position={[0, 2.5 * s, 0]} />
      </RigidBody>
      <Suspense fallback={null}>
        <Label text={getPhase(def.id).title} height={tall ? 10.5 : 7.5} />
      </Suspense>
    </group>
  );
}
