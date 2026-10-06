'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CapsuleCollider,
  RigidBody,
  useRapier,
  type RapierCollider,
  type RapierRigidBody,
} from '@react-three/rapier';
import { Euler, Vector3 } from 'three';
import type { PhaseId } from '@/data/roadmap';
import { BRIDGES, ISLAND_BY_ID, ISLANDS, RESPAWN_Y } from '@/data/world';
import { hasQueryFlag, isCoarsePointer } from '@/lib/device';
import { islandAt } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { useInput } from './useInput';

// Capsule: 2 × 0.35 + 2 × 0.5 = 1.7 tall. Body origin is the capsule centre.
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HALF = 0.5;
const CENTER_HEIGHT = CAPSULE_HALF + CAPSULE_RADIUS;
const EYE_HEIGHT = 1.6;

const WALK_SPEED = 5.5;
const SPRINT_SPEED = 9.5;
const GROUND_ACCEL = 14;
const AIR_ACCEL = 4;
const GRAVITY = 26;
const JUMP_SPEED = 8.8;
const MAX_FALL_SPEED = 55;
/** Grace period to still jump just after walking off an edge. */
const COYOTE_TIME = 0.12;
/** A jump pressed slightly before landing still fires. */
const JUMP_BUFFER = 0.15;
const PITCH_LIMIT = 1.45;

export const RESPAWN_FADE_MS = 350;

type CharacterController = ReturnType<ReturnType<typeof useRapier>['world']['createCharacterController']>;

/** Centre of the last island stood on (falls back to the raw persisted checkpoint). */
function spawnPoint(): Vector3 {
  const { lastIsland, checkpoint } = useProgress.getState();
  const p = ISLAND_BY_ID[lastIsland]?.position ?? checkpoint;
  return new Vector3(p[0], p[1] + CENTER_HEIGHT + 0.1, p[2]);
}

export default function Player() {
  const { world } = useRapier();
  const camera = useThree((s) => s.camera);
  const readInput = useInput();

  const [spawn] = useState(spawnPoint);
  const [isTouch] = useState(isCoarsePointer);

  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const controllerRef = useRef<CharacterController | null>(null);

  // Per-frame state lives in refs (never React state).
  const pos = useRef(spawn.clone());
  const vel = useRef(new Vector3());
  const desired = useRef(new Vector3());
  const look = useRef({ yaw: 0, pitch: 0 });
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const timers = useRef({ coyote: 0, jumpBuffer: 0 });
  const grounded = useRef(false);
  const currentIsland = useRef<PhaseId | null>(null);
  const respawning = useRef(false);
  const pendingTeleport = useRef(false);
  const fadeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const kcc = world.createCharacterController(0.05);
    kcc.setUp({ x: 0, y: 1, z: 0 });
    kcc.setMaxSlopeClimbAngle((50 * Math.PI) / 180);
    kcc.setMinSlopeSlideAngle((40 * Math.PI) / 180);
    kcc.enableAutostep(0.45, 0.2, false);
    kcc.enableSnapToGround(0.5);
    kcc.setSlideEnabled(true);
    kcc.setApplyImpulsesToDynamicBodies(false);
    controllerRef.current = kcc;
    return () => {
      controllerRef.current = null;
      world.removeCharacterController(kcc);
    };
  }, [world]);

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  // `?debug` test hook: read player state and teleport from the console / automated checks.
  useEffect(() => {
    if (!hasQueryFlag('debug')) return;
    const w = window as unknown as Record<string, unknown>;
    w.__aiQuest = {
      world: { islands: ISLANDS, bridges: BRIDGES },
      state: () => ({
        position: pos.current.toArray(),
        feetY: pos.current.y - CENTER_HEIGHT,
        yaw: look.current.yaw,
        pitch: look.current.pitch,
        grounded: grounded.current,
        island: currentIsland.current,
      }),
      teleport: (x: number, feetY: number, z: number) => {
        pos.current.set(x, feetY + CENTER_HEIGHT, z);
        vel.current.set(0, 0, 0);
        bodyRef.current?.setTranslation(pos.current, true);
        bodyRef.current?.setNextKinematicTranslation(pos.current);
      },
      setLook: (yaw: number, pitch = 0) => {
        look.current.yaw = yaw;
        look.current.pitch = pitch;
      },
    };
    return () => {
      delete w.__aiQuest;
    };
  }, []);

  useFrame((_, rawDt) => {
    const body = bodyRef.current;
    const collider = colliderRef.current;
    const kcc = controllerRef.current;
    if (!body || !collider || !kcc) return;

    const dt = Math.min(rawDt, 1 / 20);
    const p = pos.current;
    const v = vel.current;
    const t = timers.current;
    const ui = useUi.getState();
    const input = readInput();
    const active = ui.mode === 'explore' && (ui.pointerLocked || isTouch);

    // Respawn teleport (scheduled once the screen is fully white).
    if (pendingTeleport.current) {
      pendingTeleport.current = false;
      respawning.current = false;
      p.copy(spawnPoint());
      v.set(0, 0, 0);
      body.setTranslation(p, true);
      body.setNextKinematicTranslation(p);
      ui.setFading(false);
    }

    // Look
    if (active) {
      const { sensitivity, invertY } = useProgress.getState().settings;
      look.current.yaw -= input.lookX * sensitivity;
      look.current.pitch -= input.lookY * sensitivity * (invertY ? -1 : 1);
      look.current.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, look.current.pitch));
    }
    const { yaw, pitch } = look.current;

    // Horizontal velocity, eased towards the input target.
    const mx = active ? input.moveX : 0;
    const my = active ? input.moveY : 0;
    const speed = input.sprint ? SPRINT_SPEED : WALK_SPEED;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const targetX = (cos * mx - sin * my) * speed;
    const targetZ = (-sin * mx - cos * my) * speed;
    const ease = 1 - Math.exp(-(grounded.current ? GROUND_ACCEL : AIR_ACCEL) * dt);
    v.x += (targetX - v.x) * ease;
    v.z += (targetZ - v.z) * ease;

    // Jump (coyote time + input buffer) and gravity.
    t.coyote = grounded.current && v.y <= 0 ? COYOTE_TIME : t.coyote - dt;
    t.jumpBuffer = active && input.jump ? JUMP_BUFFER : t.jumpBuffer - dt;
    if (t.jumpBuffer > 0 && t.coyote > 0) {
      v.y = JUMP_SPEED;
      t.jumpBuffer = 0;
      t.coyote = 0;
    }
    v.y = Math.max(v.y - GRAVITY * dt, -MAX_FALL_SPEED);

    // Collide and slide.
    const d = desired.current.set(v.x * dt, v.y * dt, v.z * dt);
    kcc.computeColliderMovement(collider, d);
    const m = kcc.computedMovement();
    grounded.current = kcc.computedGrounded();
    if (grounded.current && v.y < 0) v.y = 0;
    if (v.y > 0 && m.y < d.y * 0.5) v.y = 0; // bumped a ceiling
    p.set(p.x + m.x, p.y + m.y, p.z + m.z);
    body.setNextKinematicTranslation(p);

    // Camera at eye height.
    camera.position.set(p.x, p.y - CENTER_HEIGHT + EYE_HEIGHT, p.z);
    camera.quaternion.setFromEuler(euler.current.set(pitch, yaw, 0, 'YXZ'));

    // Island tracking → checkpoint (store writes only when the island changes).
    const island = islandAt(p.x, p.y - CENTER_HEIGHT, p.z)?.id ?? null;
    if (island !== currentIsland.current) {
      currentIsland.current = island;
      ui.setNearby(island);
      if (island) useProgress.getState().reachIsland(island);
    }

    // Fell off the world: fade to white, then teleport to the checkpoint.
    if (p.y < RESPAWN_Y && !respawning.current) {
      respawning.current = true;
      ui.setFading(true);
      fadeTimer.current = window.setTimeout(() => {
        pendingTeleport.current = true;
      }, RESPAWN_FADE_MS);
    }
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={spawn.toArray()}>
      <CapsuleCollider ref={colliderRef} args={[CAPSULE_HALF, CAPSULE_RADIUS]} />
    </RigidBody>
  );
}
