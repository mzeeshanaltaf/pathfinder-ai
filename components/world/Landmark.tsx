'use client';

import { Suspense, useMemo } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import { getPhase } from '@/data/roadmap';
import type { IslandDef } from '@/data/world';
import { COLORS } from '@/lib/palette';
import { landmarkPosition, landmarkScale, landmarkYaw } from '@/lib/worldLayout';
import { LABEL_FONT, LandmarkContext } from './landmarks/kit';
import { LANDMARK_SPECS } from './landmarks';

export { LABEL_FONT };

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

/** One island's landmark: its bespoke animated body, colliders and floating name label. */
export default function Landmark({ def }: { def: IslandDef }) {
  const position = useMemo(() => landmarkPosition(def), [def]);
  const rotY = useMemo(() => landmarkYaw(def), [def]);
  const ctx = useMemo(() => ({ def, position, rotY }), [def, position, rotY]);
  const s = landmarkScale(def);
  const spec = LANDMARK_SPECS[def.landmark];
  const { Body } = spec;

  return (
    <LandmarkContext.Provider value={ctx}>
      <group position={position}>
        <group rotation={[0, rotY, 0]}>
          <group scale={s}>
            <Body />
          </group>
          <RigidBody type="fixed" colliders={false}>
            {spec.colliders.map((c, i) =>
              c.kind === 'box' ? (
                <CuboidCollider
                  key={i}
                  args={[c.half[0] * s, c.half[1] * s, c.half[2] * s]}
                  position={[c.at[0] * s, c.at[1] * s, c.at[2] * s]}
                  rotation={[0, c.rotY ?? 0, 0]}
                />
              ) : (
                <CylinderCollider key={i} args={[c.halfH * s, c.r * s]} position={[c.at[0] * s, c.at[1] * s, c.at[2] * s]} />
              ),
            )}
          </RigidBody>
        </group>
        <Suspense fallback={null}>
          <Label text={getPhase(def.id).title} height={spec.label} />
        </Suspense>
      </group>
    </LandmarkContext.Provider>
  );
}
