'use client';

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Outlines, Text } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { CylinderGeometry, ExtrudeGeometry, Shape, type BufferGeometry, type Group } from 'three';
import type { Track } from '@/data/roadmap';
import { ISLAND_TRACK, ISLANDS, type IslandDef } from '@/data/world';
import { mergeParts, part } from '@/lib/landmarkKit';
import { vertexToon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { getToonGradient } from '@/lib/toon';
import { challengePosition } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { LABEL_FONT } from './Landmark';

const STAR_Y = 1.75;

let geos: Record<'star', BufferGeometry> | null = null;
const stands = new Map<string, BufferGeometry>();

/** The stone stand as one merged, vertex-coloured mesh, cached per track colour. */
function standGeometry(track: Track): BufferGeometry {
  let g = stands.get(track);
  if (!g) {
    const c = TRACK_COLORS[track];
    g = mergeParts([
      part(new CylinderGeometry(0.8, 0.9, 0.3, 8), COLORS.rock, [0, 0.15, 0]),
      part(new CylinderGeometry(0.45, 0.55, 0.75, 8), c.base, [0, 0.67, 0]),
      part(new CylinderGeometry(0.7, 0.6, 0.18, 8), c.light, [0, 1.13, 0]),
    ]);
    stands.set(track, g);
  }
  return g;
}

/** Pedestal labels further than this (m) are hidden. */
const LABEL_RADIUS = 60;
/** Whole pedestals further than this (m) are not drawn (the collider stays). */
const DRAW_RADIUS = 120;

/** Shared star geometry (created once for all 20 pedestals). */
function pedestalGeometry() {
  if (!geos) {
    const star = new Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.42 : 0.19;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    star.closePath();
    const starGeo = new ExtrudeGeometry(star, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
    starGeo.center();
    geos = { star: starGeo };
  }
  return geos;
}

function Pedestal({ def, index }: { def: IslandDef; index: number }) {
  const position = useMemo(() => challengePosition(def), [def]);
  const spinner = useRef<Group>(null);
  const label = useRef<Group>(null);
  const root = useRef<Group>(null);

  useFrame(({ clock, camera }) => {
    const s = spinner.current;
    if (!s) return;
    const t = clock.elapsedTime;
    s.rotation.y = t * 1.4 + index;
    s.position.y = STAR_Y + Math.sin(t * 2 + index) * 0.08;
    const d2 = (camera.position.x - position[0]) ** 2 + (camera.position.z - position[2]) ** 2;
    if (label.current) label.current.visible = d2 < LABEL_RADIUS ** 2;
    if (root.current) root.current.visible = d2 < DRAW_RADIUS ** 2;
  });

  const stars = useProgress((s) => s.badges[def.id]?.stars ?? 0);
  const track = ISLAND_TRACK[def.id];
  const colors = TRACK_COLORS[track];
  const g = pedestalGeometry();
  const gradient = getToonGradient();
  const earned = stars > 0;

  return (
    <group ref={root} position={position}>
      <mesh geometry={standGeometry(track)} material={vertexToon()} castShadow receiveShadow>
        <Outlines thickness={0.03} color={COLORS.outline} />
      </mesh>
      <group ref={spinner} position={[0, STAR_Y, 0]}>
        <mesh geometry={g.star} castShadow>
          <meshToonMaterial
            color={earned ? COLORS.badgeGold : COLORS.badgeIdle}
            emissive={earned ? COLORS.badgeGold : colors.base}
            emissiveIntensity={earned ? 0.45 : 0.25}
            gradientMap={gradient}
          />
          <Outlines thickness={0.025} color={COLORS.outline} />
        </mesh>
      </group>
      <Suspense fallback={null}>
        <Billboard ref={label} position={[0, 2.6, 0]}>
          <Text font={LABEL_FONT} fontSize={0.36} color={COLORS.label} outlineWidth={0.05} outlineColor="#ffffff" anchorX="center" anchorY="middle">
            {earned ? `Challenge · ${stars}/3 stars` : 'Challenge'}
          </Text>
        </Billboard>
      </Suspense>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.65, 0.85]} position={[0, 0.65, 0]} />
      </RigidBody>
    </group>
  );
}

/** One Challenge pedestal per island, beside the landmark: walk up and press E to play its mini-game. */
export default function ChallengePedestals() {
  return (
    <>
      {ISLANDS.map((def, i) => (
        <Pedestal key={def.id} def={def} index={i} />
      ))}
    </>
  );
}
