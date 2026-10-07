'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Outlines } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  SphereGeometry,
  type BufferGeometry,
  type Group,
} from 'three';
import { playerPose } from '@/components/player/playerState';
import { getPhase } from '@/data/roadmap';
import { ISLAND_TRACK, ISLANDS, type IslandDef } from '@/data/world';
import { mergeParts, part, type Part } from '@/lib/landmarkKit';
import { vertexToon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { hatColor } from '@/lib/progress';
import { getToonGradient } from '@/lib/toon';
import { mentorPosition } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** Player within this distance → the mentor turns to face them. */
const FACE_RADIUS = 11;
/** Player within this distance → speech bubble. */
const TALK_RADIUS = 7.5;
/** Byte greets first-time players from further away. */
const GREET_RADIUS = 14;
const LINE_MS = 4500;
const HOVER = 0.35;
/** Mentors further than this (m) from the camera are not drawn. */
const DRAW_RADIUS = 120;

const robotCache = new Map<string, BufferGeometry>();

/**
 * One robot as a single merged, vertex-coloured mesh (one draw + one outline instead of ~10),
 * cached per accent colour. Byte drops the antenna when wearing a hat.
 */
function robotGeometry(accent: string, antenna: boolean): BufferGeometry {
  const key = `${accent}|${antenna}`;
  let g = robotCache.get(key);
  if (!g) {
    const head: [number, number, number] = [0, 1.38, 0];
    const at = (x: number, y: number, z: number): [number, number, number] => [head[0] + x, head[1] + y, head[2] + z];
    const parts: Part[] = [
      part(new CapsuleGeometry(0.36, 0.42, 4, 10), COLORS.robotShell, [0, 0.62, 0]),
      part(new SphereGeometry(0.12, 10, 8), accent, [-0.5, 0.55, 0.05]),
      part(new SphereGeometry(0.12, 10, 8), accent, [0.5, 0.55, 0.05]),
      part(new BoxGeometry(0.82, 0.6, 0.6), accent, head),
      part(new BoxGeometry(0.64, 0.42, 0.04), COLORS.robotScreen, at(0, 0, 0.3)),
      part(new SphereGeometry(0.06, 8, 6), COLORS.robotEyes, at(-0.14, 0.03, 0.32), [0, 0, 0], [1, 1.3, 0.4]),
      part(new SphereGeometry(0.06, 8, 6), COLORS.robotEyes, at(0.14, 0.03, 0.32), [0, 0, 0], [1, 1.3, 0.4]),
    ];
    if (antenna) {
      parts.push(part(new CylinderGeometry(0.025, 0.025, 0.32, 5), COLORS.outline, at(0, 0.46, 0)));
      parts.push(part(new SphereGeometry(0.09, 10, 8), accent, at(0, 0.64, 0)));
    }
    g = mergeParts(parts);
    robotCache.set(key, g);
  }
  return g;
}

let hatGeos: Record<'brim' | 'crown' | 'band', BufferGeometry> | null = null;
const shadowGeo = new CircleGeometry(0.45, 16);

function Robot({ accent, hat = null }: { accent: string; hat?: string | null }) {
  hatGeos ??= {
    brim: new CylinderGeometry(0.36, 0.36, 0.05, 14),
    crown: new CylinderGeometry(0.22, 0.25, 0.36, 14),
    band: new CylinderGeometry(0.255, 0.255, 0.08, 14),
  };
  const gradient = getToonGradient();
  return (
    <group>
      <mesh geometry={robotGeometry(accent, !hat)} material={vertexToon()} castShadow>
        <Outlines thickness={0.03} color={COLORS.outline} />
      </mesh>
      {hat && (
        // Byte's streak hat: a little top hat, worn at a jaunty angle.
        <group position={[0.06, 1.69, 0]} rotation={[0, 0, -0.18]}>
          <mesh geometry={hatGeos.brim} castShadow>
            <meshToonMaterial color={hat} gradientMap={gradient} />
            <Outlines thickness={0.02} color={COLORS.outline} />
          </mesh>
          <mesh geometry={hatGeos.crown} position={[0, 0.2, 0]} castShadow>
            <meshToonMaterial color={hat} gradientMap={gradient} />
            <Outlines thickness={0.02} color={COLORS.outline} />
          </mesh>
          <mesh geometry={hatGeos.band} position={[0, 0.08, 0]}>
            <meshToonMaterial color={COLORS.outline} gradientMap={gradient} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function SpeechBubble({ name, lines, accent }: { name: string; lines: string[]; accent: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % lines.length), LINE_MS);
    return () => window.clearInterval(id);
  }, [lines.length]);

  return (
    <Html position={[0, 2.55, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className="w-56 max-w-[60vw] -translate-y-1/2 select-none">
        <div className="relative rounded-2xl border-[3px] border-[#3d3452] bg-white px-3 py-2 text-[13px] leading-snug text-[#3d3452] shadow-lg">
          <div className="mb-0.5 text-[11px] font-extrabold uppercase tracking-wide" style={{ color: accent }}>
            {name}
          </div>
          <p key={i} className="animate-[bubble-in_250ms_ease-out]">
            {lines[i]}
          </p>
          <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#3d3452] bg-white" />
        </div>
      </div>
    </Html>
  );
}

function Mentor({ def }: { def: IslandDef }) {
  const phase = getPhase(def.id);
  const colors = TRACK_COLORS[ISLAND_TRACK[def.id]];
  const position = useMemo(() => mentorPosition(def), [def]);
  const bob = useRef<Group>(null);
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const [talking, setTalking] = useState(false);
  const talkingRef = useRef(false);
  const seed = useMemo(() => position[0] * 0.37 + position[2] * 0.11, [position]);
  const isGuide = def.id === 'harbor';
  const hat = useProgress((s) => (isGuide ? hatColor(s.byteHat) : null));

  useFrame(({ clock, camera }, dt) => {
    const t = clock.elapsedTime;
    if (bob.current) bob.current.position.y = HOVER + Math.sin(t * 2.2 + seed) * 0.08;

    const dx = playerPose.x - position[0];
    const dz = playerPose.z - position[2];
    const dist = Math.hypot(dx, dz);
    const near = Math.abs(playerPose.y - position[1]) < 4;
    // Far-away mentors are specks: skip drawing them (the camera, not the player, during cinematics).
    if (root.current) root.current.visible = (camera.position.x - position[0]) ** 2 + (camera.position.z - position[2]) ** 2 < DRAW_RADIUS ** 2;

    if (spin.current) {
      // Face the player when near, otherwise idle-sway towards the island centre.
      const target =
        near && dist < FACE_RADIUS
          ? Math.atan2(dx, dz)
          : Math.atan2(def.position[0] - position[0], def.position[2] - position[2]) + Math.sin(t * 0.5 + seed) * 0.4;
      let diff = target - spin.current.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      spin.current.rotation.y += diff * (1 - Math.exp(-5 * dt));
    }

    const firstTime = isGuide && !useProgress.getState().onboardingDone && Object.keys(useProgress.getState().gems).length === 0;
    const radius = firstTime ? GREET_RADIUS : TALK_RADIUS;
    const talk = near && dist < radius && useUi.getState().mode === 'explore';
    if (talk !== talkingRef.current) {
      talkingRef.current = talk;
      setTalking(talk);
    }
  });

  return (
    <group ref={root} position={position}>
      <mesh geometry={shadowGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <meshBasicMaterial color={COLORS.outline} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <group ref={spin}>
        <group ref={bob}>
          <Robot accent={colors.base} hat={hat} />
        </group>
      </group>
      {talking && <SpeechBubble name={phase.mentor.name} lines={phase.mentor.lines} accent={colors.dark} />}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.9, 0.5]} position={[0, 0.9, 0]} />
      </RigidBody>
    </group>
  );
}

/** One friendly capsule-robot mentor per landmark. */
export default function Mentors() {
  return (
    <>
      {ISLANDS.map((def) => (
        <Mentor key={def.id} def={def} />
      ))}
    </>
  );
}
