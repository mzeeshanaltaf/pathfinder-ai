'use client';

import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import { Outlines } from '@react-three/drei';
import { SphereGeometry, type Group } from 'three';
import { ISLAND_TRACK } from '@/data/world';
import { box, cyl, mergeParts, part, sphere, torus, type Part } from '@/lib/landmarkKit';
import { toon, vertexToon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** What the Player feeds the avatar every frame (no React state). */
export interface AvatarMotion {
  /** Horizontal speed, m/s. */
  speed: number;
  grounded: boolean;
  sprint: boolean;
  /** Vertical velocity, m/s (+ up). */
  vy: number;
}

export interface AvatarHandle {
  /** Root group: the Player sets its position (feet) and yaw. */
  group: Group | null;
  update: (dt: number, m: AvatarMotion) => void;
  /** Current limb angles (`?debug` checks that the avatar animates). */
  pose: () => { leg: number; arm: number; bob: number; squash: number };
}

const SKIN = '#f5c9a0';
const HAIR = '#6b4430';
const SHIRT = '#f6c86b';
const SHORTS = '#7d6fa8';
const BOOT = '#8a5a3c';
const PACK = COLORS.wood;
const OUTLINE = 0.02;

const HIP_Y = 0.62;
const HIP_X = 0.12;
const SHOULDER_Y = 1.04;
const SHOULDER_X = 0.27;
/** Walk speed the stride is tuned for (Player WALK_SPEED). */
const WALK = 5.5;

// The avatar faces local −Z (yaw 0 = facing −Z, like the camera). Feet at y = 0.
function bodyParts(): Part[] {
  const hair = new SphereGeometry(0.29, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56);
  return [
    // Shorts + torso
    part(cyl(0.235, 0.25, 0.17, 10), SHORTS, [0, 0.66, 0]),
    part(cyl(0.2, 0.235, 0.46, 10), SHIRT, [0, 0.96, 0]),
    // Head, hair cap, eyes, nose, ears
    part(sphere(0.27, 14, 10), SKIN, [0, 1.38, 0]),
    part(hair, HAIR, [0, 1.41, 0.02], [-0.18, 0, 0]),
    part(sphere(0.04, 6, 5), COLORS.outline, [-0.095, 1.39, -0.245]),
    part(sphere(0.04, 6, 5), COLORS.outline, [0.095, 1.39, -0.245]),
    part(sphere(0.045, 6, 5), '#eeb28a', [0, 1.33, -0.27]),
    part(sphere(0.06, 6, 5), SKIN, [-0.265, 1.37, 0]),
    part(sphere(0.06, 6, 5), SKIN, [0.265, 1.37, 0]),
    // Backpack (body; the flap is in the track colour, see trimParts)
    part(box(0.36, 0.4, 0.18), PACK, [0, 0.93, 0.27]),
    part(box(0.26, 0.14, 0.06), COLORS.woodDark, [0, 0.82, 0.38]),
  ];
}

/** Scarf + backpack flap: painted with the current island's track colour. */
function trimParts(): Part[] {
  return [
    part(torus(0.2, 0.06, 6, 14), '#ffffff', [0, 1.13, 0], [Math.PI / 2, 0, 0]),
    part(box(0.1, 0.3, 0.05), '#ffffff', [0.1, 1.0, 0.2], [0.25, 0, 0.12]),
    part(box(0.38, 0.13, 0.2), '#ffffff', [0, 1.1, 0.27]),
  ];
}

/** An arm hanging from the shoulder pivot: sleeve, arm, hand. */
function armParts(): Part[] {
  return [
    part(cyl(0.085, 0.08, 0.16, 8), SHIRT, [0, -0.06, 0]),
    part(cyl(0.065, 0.06, 0.3, 8), SKIN, [0, -0.25, 0]),
    part(sphere(0.08, 8, 6), SKIN, [0, -0.43, 0]),
  ];
}

/** A leg hanging from the hip pivot: leg + boot (toe forward, −Z). */
function legParts(): Part[] {
  return [
    part(cyl(0.085, 0.08, 0.42, 8), SKIN, [0, -0.25, 0]),
    part(box(0.17, 0.12, 0.28), BOOT, [0, -0.52, -0.05]),
  ];
}

const damp = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

/**
 * The explorer kid: low-poly primitives merged per moving part (body, trim, 2 arms, 2 legs),
 * animated procedurally from the Player's motion. Everything per frame goes through refs.
 */
export default function Avatar({ ref }: { ref: Ref<AvatarHandle> }) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const anim = useRef({ phase: 0, t: 0, swing: 0, air: 0, squash: 0, wasGrounded: true, lastVy: 0 });

  const geo = useMemo(
    () => ({ body: mergeParts(bodyParts()), trim: mergeParts(trimParts()), arm: mergeParts(armParts()), leg: mergeParts(legParts()) }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  // Scarf colour follows the island underfoot (the last one stood on while crossing a bridge).
  const island = useUi((s) => s.currentIsland);
  const lastIsland = useProgress((s) => s.lastIsland);
  const id = island ?? lastIsland;
  const trim = toon(TRACK_COLORS[id ? ISLAND_TRACK[id] : 'meta'].base);

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return root.current;
      },
      pose: () => ({
        leg: legL.current?.rotation.x ?? 0,
        arm: armL.current?.rotation.z ?? 0,
        bob: body.current?.position.y ?? 0,
        squash: anim.current.squash,
      }),
      update(dt, m) {
        const a = anim.current;
        a.t += dt;
        const walk = Math.min(1.6, m.speed / WALK);
        // Stride: cadence and swing grow with speed; sprinting swings wider.
        a.phase += dt * (3.2 + 4.2 * walk) * (m.speed > 0.2 ? 1 : 0);
        a.swing = damp(a.swing, m.grounded ? Math.min(1, walk) * (m.sprint ? 0.95 : 0.6) : 0, 10, dt);
        a.air = damp(a.air, m.grounded ? 0 : m.vy > 0 ? 1 : 0.7, 12, dt);

        // Landing squash, scaled by how hard we came down.
        if (m.grounded && !a.wasGrounded && a.lastVy < -4) a.squash = Math.min(0.22, -a.lastVy * 0.016);
        a.wasGrounded = m.grounded;
        a.lastVy = m.vy;
        a.squash = damp(a.squash, 0, 9, dt);

        const s = Math.sin(a.phase);
        const breathe = Math.sin(a.t * 2.2) * 0.012;
        if (legL.current && legR.current) {
          legL.current.rotation.x = s * a.swing + a.air * 0.75;
          legR.current.rotation.x = -s * a.swing - a.air * 0.25;
        }
        if (armL.current && armR.current) {
          const idle = Math.sin(a.t * 1.6) * 0.04 * (1 - Math.min(1, walk));
          armL.current.rotation.x = -s * a.swing * 0.85 - a.air * 0.4;
          armR.current.rotation.x = s * a.swing * 0.85 - a.air * 0.4;
          // Arms lift out to the sides in the air.
          armL.current.rotation.z = -0.12 - idle - a.air * 1.1;
          armR.current.rotation.z = 0.12 + idle + a.air * 1.1;
        }
        if (body.current) {
          // Walking bob (twice per stride), idle breathing, landing squash.
          body.current.position.y = Math.abs(s) * 0.05 * a.swing;
          body.current.rotation.x = -0.08 * Math.min(1, walk) * (m.grounded ? 1 : 0.4);
          const sy = 1 - a.squash + breathe;
          const sxz = 1 + a.squash * 0.55;
          body.current.scale.set(sxz, sy, sxz);
        }
      },
    }),
    [],
  );

  return (
    <group ref={root}>
      <group ref={body}>
        <mesh geometry={geo.body} material={vertexToon()} castShadow>
          <Outlines thickness={OUTLINE} color={COLORS.outline} />
        </mesh>
        <mesh geometry={geo.trim} material={trim} castShadow>
          <Outlines thickness={OUTLINE} color={COLORS.outline} />
        </mesh>
        <group ref={armL} position={[-SHOULDER_X, SHOULDER_Y, 0]}>
          <mesh geometry={geo.arm} material={vertexToon()} castShadow>
            <Outlines thickness={OUTLINE} color={COLORS.outline} />
          </mesh>
        </group>
        <group ref={armR} position={[SHOULDER_X, SHOULDER_Y, 0]}>
          <mesh geometry={geo.arm} material={vertexToon()} castShadow>
            <Outlines thickness={OUTLINE} color={COLORS.outline} />
          </mesh>
        </group>
        <group ref={legL} position={[-HIP_X, HIP_Y, 0]}>
          <mesh geometry={geo.leg} material={vertexToon()} castShadow>
            <Outlines thickness={OUTLINE} color={COLORS.outline} />
          </mesh>
        </group>
        <group ref={legR} position={[HIP_X, HIP_Y, 0]}>
          <mesh geometry={geo.leg} material={vertexToon()} castShadow>
            <Outlines thickness={OUTLINE} color={COLORS.outline} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
