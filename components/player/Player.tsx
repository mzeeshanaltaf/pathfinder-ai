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
import { Vector3 } from 'three';
import type { Ray } from '@dimforge/rapier3d-compat';
import { MINIGAMES } from '@/data/minigames';
import type { PhaseId } from '@/data/roadmap';
import { BRIDGES, CHALLENGE_RADIUS, DOCK_INTERACT_RADIUS, INTERACT_RADIUS, ISLAND_BY_ID, ISLANDS, RESPAWN_Y } from '@/data/world';
import { sfx } from '@/lib/audio';
import { hasQueryFlag } from '@/lib/device';
import {
  challengePosition,
  dockPosition,
  getGemSpawns,
  islandAt,
  landmarkPosition,
  landmarkScale,
  mentorPosition,
} from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import Avatar, { type AvatarHandle } from './Avatar';
import { playerControl, playerEvents, playerPose } from './playerState';
import { useInput } from './useInput';

// Capsule: 2 × 0.35 + 2 × 0.5 = 1.7 tall. Body origin is the capsule centre.
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HALF = 0.5;
const CENTER_HEIGHT = CAPSULE_HALF + CAPSULE_RADIUS;

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
/** Walking backwards is slower. */
const BACK_SPEED = 0.6;
/** Turning (rad/s at sensitivity 1); the turn rate eases in so a tap nudges and a hold turns smoothly. */
const TURN_SPEED = 2.4;
const TURN_EASE = 10;
/** How fast the avatar's body swings round to the facing direction. */
const AVATAR_TURN = 14;

/** Third-person camera rig. */
const CAM = {
  /** Look-at height above the feet. */
  targetH: 1.45,
  back: 4.2,
  up: 1.6,
  /** Look at a point this far ahead of the target (a slight downward tilt). */
  ahead: 2,
  /** Position damping (1/s): the camera lags a little behind turns. */
  damp: 10,
  /** Occlusion: stop `pad` in front of a hit, never closer than `min`; hide the avatar under `hide`. */
  pad: 0.3,
  min: 0.8,
  hide: 1.2,
  /** Pull-out speed (1/s) once an obstacle clears. */
  release: 4,
};

export const RESPAWN_FADE_MS = 350;

/** Interaction zones around each landmark (horizontal radius). */
const LANDMARKS = ISLANDS.map((def) => {
  const [x, y, z] = landmarkPosition(def);
  return { id: def.id, x, y, z, radius: INTERACT_RADIUS * landmarkScale(def) };
});

/** Challenge pedestals (one per island) that open the mini-game directly. */
const CHALLENGES = ISLANDS.map((def) => {
  const [x, y, z] = challengePosition(def);
  return { id: def.id, x, y, z };
});

/** Balloon docks (one per island): E opens the Passport map to pick a destination. */
const DOCKS = ISLANDS.map((def) => {
  const [x, y, z] = dockPosition(def);
  return { id: def.id, x, y, z };
});

/** Distance walked per footstep sound (m). */
const STRIDE = 1.9;

type CharacterController =ReturnType<ReturnType<typeof useRapier>['world']['createCharacterController']>;

/** Centre of the last island stood on (falls back to the raw persisted checkpoint). */
function spawnPoint(): Vector3 {
  const { lastIsland, checkpoint } = useProgress.getState();
  const p = ISLAND_BY_ID[lastIsland]?.position ?? checkpoint;
  return new Vector3(p[0], p[1] + CENTER_HEIGHT + 0.1, p[2]);
}

/** First-time players spawn facing Byte (the guide) so the greeting is seen; everyone else faces −Z. */
function firstVisitYaw(): number {
  const { onboardingDone, visited, gems } = useProgress.getState();
  const fresh = !onboardingDone && Object.keys(gems).length === 0 && Object.keys(visited).length <= 1;
  if (!fresh) return 0;
  const harbor = ISLAND_BY_ID.harbor;
  const [mx, , mz] = mentorPosition(harbor);
  return Math.atan2(-(mx - harbor.position[0]), -(mz - harbor.position[2]));
}

export default function Player() {
  const { world, rapier } = useRapier();
  const camera = useThree((s) => s.camera);
  const readInput = useInput();

  const [spawn] = useState(spawnPoint);

  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const controllerRef = useRef<CharacterController | null>(null);
  const avatar = useRef<AvatarHandle>(null);

  // Per-frame state lives in refs (never React state).
  const pos = useRef(spawn.clone());
  const vel = useRef(new Vector3());
  const desired = useRef(new Vector3());
  const [initialYaw] = useState(firstVisitYaw);
  /** Facing (yaw 0 = −Z), eased turn rate, and the avatar body's own (lagging) yaw. */
  const look = useRef({ yaw: initialYaw, turn: 0, bodyYaw: initialYaw });
  const timers = useRef({ coyote: 0, jumpBuffer: 0 });
  const grounded = useRef(false);
  const currentIsland = useRef<PhaseId | null>(null);
  const nearLandmark = useRef<PhaseId | null>(null);
  const nearChallenge = useRef<PhaseId | null>(null);
  const nearDock = useRef<PhaseId | null>(null);
  const stepDist = useRef(0);
  const respawning = useRef(false);
  const pendingTeleport = useRef(false);
  const fadeTimer = useRef<number | undefined>(undefined);
  /** Camera rig: damped position + look point, occlusion distance, and a one-shot snap (spawn, respawn, teleports). */
  const rig = useRef({ pos: new Vector3(), look: new Vector3(), occl: Infinity, snap: true, dist: CAM.back });
  const scratch = useRef({ target: new Vector3(), ideal: new Vector3(), lookGoal: new Vector3(), dir: new Vector3(), ray: null as Ray | null });

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

  // Scripted moves (balloon landing, finale framing).
  useEffect(() => {
    playerControl.teleport = (x, feetY, z, yaw, opts) => {
      pos.current.set(x, feetY + CENTER_HEIGHT, z);
      vel.current.set(0, 0, 0);
      bodyRef.current?.setTranslation(pos.current, true);
      bodyRef.current?.setNextKinematicTranslation(pos.current);
      if (yaw !== undefined) look.current.yaw = look.current.bodyYaw = yaw;
      look.current.turn = 0;
      // A balloon landing blends from the cinematic camera; everything else cuts straight to the new spot.
      if (opts?.snap !== false) rig.current.snap = true;
    };
    playerControl.face = (yaw) => {
      look.current.yaw = look.current.bodyYaw = yaw;
    };
    return () => {
      playerControl.teleport = null;
      playerControl.face = null;
    };
  }, []);

  // `?debug` test hook: read player state and teleport from the console / automated checks.
  useEffect(() => {
    if (!hasQueryFlag('debug')) return;
    const w = window as unknown as Record<string, unknown>;
    w.__aiQuest = {
      world: { islands: ISLANDS, bridges: BRIDGES, landmarks: LANDMARKS, challenges: CHALLENGES, docks: DOCKS, gems: getGemSpawns() },
      minigames: MINIGAMES,
      state: () => ({
        position: pos.current.toArray(),
        feetY: pos.current.y - CENTER_HEIGHT,
        yaw: look.current.yaw,
        grounded: grounded.current,
        island: currentIsland.current,
        camera: camera.position.toArray(),
        /** Camera distance from the look target (shrinks when something is in the way). */
        cameraDist: rig.current.dist,
        avatarVisible: avatar.current?.group?.visible ?? false,
        avatar: avatar.current?.pose(),
      }),
      teleport: (x: number, feetY: number, z: number, yaw?: number) => playerControl.teleport?.(x, feetY, z, yaw),
      setLook: (yaw: number) => playerControl.face?.(yaw),
      /** Open a phase's mini-game at its intro card (tests drive each sim from there). */
      openGame: (id: PhaseId) => useUi.getState().openMiniGame(id),
      openPanel: (id: PhaseId) => useUi.getState().openPanel(id),
    };
    return () => {
      delete w.__aiQuest;
    };
  }, [camera]);

  useFrame((_, rawDt) => {
    const body = bodyRef.current;
    const collider = colliderRef.current;
    const kcc = controllerRef.current;
    if (!body || !collider || !kcc) return;

    const dt = Math.min(rawDt, 1 / 20);
    const p = pos.current;
    const v = vel.current;
    const t = timers.current;
    const L = look.current;
    const ui = useUi.getState();
    const input = readInput();
    const active = ui.mode === 'explore';

    // Respawn teleport (scheduled once the screen is fully white).
    if (pendingTeleport.current) {
      pendingTeleport.current = false;
      respawning.current = false;
      p.copy(spawnPoint());
      v.set(0, 0, 0);
      body.setTranslation(p, true);
      body.setNextKinematicTranslation(p);
      rig.current.snap = true;
      ui.setFading(false);
    }

    // Tank steering: A/D (or the stick's X) turn; the rate eases in and out.
    const { sensitivity } = useProgress.getState().settings;
    L.turn += ((active ? input.turn : 0) - L.turn) * (1 - Math.exp(-TURN_EASE * dt));
    if (Math.abs(L.turn) < 1e-4) L.turn = 0;
    L.yaw -= L.turn * TURN_SPEED * sensitivity * dt;
    const yaw = L.yaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);

    // Walk along the facing direction (no strafe); backwards is slower.
    const my = active ? input.moveY : 0;
    const speed = (input.sprint && my > 0 ? SPRINT_SPEED : WALK_SPEED) * (my < 0 ? BACK_SPEED : 1);
    const targetX = fx * my * speed;
    const targetZ = fz * my * speed;
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
      playerEvents.jumps++;
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
    const moved = Math.hypot(m.x, m.z);

    // Footsteps: one soft tick per stride while walking on the ground.
    if (grounded.current && active) {
      stepDist.current += moved;
      if (stepDist.current > (input.sprint ? STRIDE * 1.3 : STRIDE)) {
        stepDist.current = 0;
        sfx.footstep(input.sprint);
      }
    }

    const feetY = p.y - CENTER_HEIGHT;

    // Avatar: feet at the body, body swings round to the facing direction, procedural animation.
    const av = avatar.current;
    if (av?.group) {
      L.bodyYaw += Math.atan2(Math.sin(yaw - L.bodyYaw), Math.cos(yaw - L.bodyYaw)) * (1 - Math.exp(-AVATAR_TURN * dt));
      av.group.position.set(p.x, feetY, p.z);
      av.group.rotation.y = L.bodyYaw;
      av.update(dt, { speed: moved / Math.max(dt, 1e-4), grounded: grounded.current, sprint: input.sprint && active, vy: v.y });
    }

    // Camera rig (a cinematic drives the camera itself; the rig then damps from wherever it left it).
    const r = rig.current;
    const tmp = scratch.current;
    if (ui.mode === 'cinematic') {
      r.pos.copy(camera.position);
      camera.getWorldDirection(tmp.dir);
      r.look.copy(camera.position).addScaledVector(tmp.dir, CAM.back);
      r.occl = Infinity;
      if (av?.group) av.group.visible = ui.cinematic?.kind !== 'balloon';
    } else {
      const target = tmp.target.set(p.x, feetY + CAM.targetH, p.z);
      const ideal = tmp.ideal.set(target.x - fx * CAM.back, target.y + CAM.up, target.z - fz * CAM.back);
      const lookGoal = tmp.lookGoal.set(target.x + fx * CAM.ahead, target.y, target.z + fz * CAM.ahead);
      if (r.snap) {
        r.snap = false;
        r.pos.copy(ideal);
        r.look.copy(lookGoal);
        r.occl = Infinity;
      } else {
        const k = 1 - Math.exp(-CAM.damp * dt);
        r.pos.lerp(ideal, k);
        r.look.lerp(lookGoal, k);
      }
      // Occlusion: cast from the target back towards the camera; snap in on a hit, ease back out once clear.
      const dir = tmp.dir.subVectors(r.pos, target);
      const len = dir.length();
      let limit = len;
      if (len > 1e-3) {
        dir.divideScalar(len);
        const ray = (tmp.ray ??= new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }));
        ray.origin = { x: target.x, y: target.y, z: target.z };
        ray.dir = { x: dir.x, y: dir.y, z: dir.z };
        const hit = world.castRay(ray, len + CAM.pad, true, rapier.QueryFilterFlags.EXCLUDE_SENSORS, undefined, collider, body);
        if (hit) limit = Math.min(len, Math.max(CAM.min, hit.timeOfImpact - CAM.pad));
      }
      if (limit < r.occl) r.occl = limit;
      else r.occl += (limit - r.occl) * (1 - Math.exp(-CAM.release * dt));
      r.dist = Math.min(len, r.occl);
      camera.position.copy(target).addScaledVector(dir, r.dist);
      camera.lookAt(r.look);
      if (av?.group) av.group.visible = r.dist >= CAM.hide;
    }

    playerPose.x = p.x;
    playerPose.y = feetY;
    playerPose.z = p.z;
    playerPose.yaw = yaw;

    // Island tracking → checkpoint (store writes only when the island changes).
    const island = islandAt(p.x, feetY, p.z)?.id ?? null;
    if (island !== currentIsland.current) {
      currentIsland.current = island;
      ui.setCurrentIsland(island);
      if (island) useProgress.getState().reachIsland(island);
    }

    // Landmark proximity → interact prompt (store writes only on change).
    let near: PhaseId | null = null;
    for (const l of LANDMARKS) {
      if (Math.abs(feetY - l.y) < 3 && Math.hypot(p.x - l.x, p.z - l.z) < l.radius) {
        near = l.id;
        break;
      }
    }
    if (near !== nearLandmark.current) {
      nearLandmark.current = near;
      ui.setNearby(near);
    }
    // Challenge pedestals sit inside the landmark radius, so they win when the player is right at one.
    let challenge: PhaseId | null = null;
    for (const c of CHALLENGES) {
      if (Math.abs(feetY - c.y) < 3 && Math.hypot(p.x - c.x, p.z - c.z) < CHALLENGE_RADIUS) {
        challenge = c.id;
        break;
      }
    }
    if (challenge !== nearChallenge.current) {
      nearChallenge.current = challenge;
      ui.setNearbyChallenge(challenge);
    }
    // Balloon dock (lowest priority: only when no pedestal is in range).
    let dock: PhaseId | null = null;
    for (const dk of DOCKS) {
      if (Math.abs(feetY - dk.y) < 3 && Math.hypot(p.x - dk.x, p.z - dk.z) < DOCK_INTERACT_RADIUS) {
        dock = dk.id;
        break;
      }
    }
    if (dock !== nearDock.current) {
      nearDock.current = dock;
      ui.setNearbyDock(dock);
    }
    if (input.interact && active) {
      if (challenge) ui.openMiniGame(challenge);
      else if (dock) ui.openPassport();
      else if (near) ui.openPanel(near);
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
    <>
      <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={spawn.toArray()}>
        <CapsuleCollider ref={colliderRef} args={[CAPSULE_HALF, CAPSULE_RADIUS]} />
      </RigidBody>
      <Avatar ref={avatar} />
    </>
  );
}
