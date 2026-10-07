'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, Vector3, type BufferGeometry, type Group, type Mesh } from 'three';
import { cinematicControl, playerControl, playerPose, takeTravelRequest } from '@/components/player/playerState';
import { RESPAWN_FADE_MS } from '@/components/player/Player';
import type { PhaseId, Track } from '@/data/roadmap';
import { ISLAND_BY_ID, ISLAND_TRACK } from '@/data/world';
import { sfx } from '@/lib/audio';
import { mergeParts, sphere } from '@/lib/landmarkKit';
import { glow, vertexToon } from '@/lib/materials';
import { TRACK_COLORS } from '@/lib/palette';
import { dockPosition, yawTowardsLandmark } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { balloonParts, DOCK_PLATFORM_H } from './Balloons';

const EYE = 1.6;
/** The ride's balloon is a bit bigger than parked ones, so the basket frames the view. */
const RIDE_SCALE = 1.45;
/** The basket floor sits this far below the camera (standing height): only the rim corners and ropes frame the view. */
const FLOOR_BELOW_EYE = 1.6;
const TRACKS = Object.keys(TRACK_COLORS) as Track[];

interface Flight {
  to: PhaseId;
  t: number;
  dur: number;
  p0: Vector3;
  p1: Vector3;
  p2: Vector3;
  p3: Vector3;
  yaw0: number;
  cruiseYaw: number;
  arriveYaw: number;
  feet: [number, number, number];
}

const tmp = new Vector3();
function bezier(f: Flight, u: number, out: Vector3) {
  const a = 1 - u;
  out.set(0, 0, 0);
  out.addScaledVector(f.p0, a * a * a);
  out.addScaledVector(f.p1, 3 * a * a * u);
  out.addScaledVector(f.p2, 3 * a * u * u);
  out.addScaledVector(f.p3, u * u * u);
  return out;
}

const smooth = (x: number) => x * x * (3 - 2 * x);
const lerpAngle = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lands the player on a dock: feet on the platform, facing the island's landmark. */
function land(f: Pick<Flight, 'to' | 'feet' | 'arriveYaw'>, snap: boolean) {
  useProgress.getState().reachIsland(f.to);
  // After a flight the third-person rig damps out from where it left the camera; a fade cuts straight there.
  playerControl.teleport?.(f.feet[0], f.feet[1], f.feet[2], f.arriveYaw, { snap });
}

/**
 * Hot-air balloon fast travel. Consumes `requestTravel()`: rises from where the player stands,
 * flies to the destination island's dock and lands there (skippable). Reduced motion → a quick fade.
 */
export default function BalloonTravel() {
  const camera = useThree((s) => s.camera);
  const flight = useRef<Flight | null>(null);
  const ride = useRef<Group>(null);
  const flame = useRef<Mesh>(null);
  const body = useRef<Mesh>(null);
  // One ride balloon per track colour (stripes match the destination's path).
  const geometries = useMemo(
    () => Object.fromEntries(TRACKS.map((t) => [t, mergeParts(balloonParts(true, TRACK_COLORS[t].base))])) as Record<Track, BufferGeometry>,
    [],
  );
  const flameGeo = useMemo(() => sphere(0.12, 8, 6), []);
  const euler = useMemo(() => new Euler(0, 0, 0, 'YXZ'), []);
  const fadeTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      flameGeo.dispose();
      window.clearTimeout(fadeTimer.current);
    },
    [geometries, flameGeo],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const req = takeTravelRequest();
    if (req && !flight.current) {
      const def = ISLAND_BY_ID[req];
      const [dx, dy, dz] = dockPosition(def);
      const feet: [number, number, number] = [dx, dy + DOCK_PLATFORM_H + 0.02, dz];
      const arriveYaw = yawTowardsLandmark(def, dx, dz);
      if (prefersReducedMotion()) {
        const ui = useUi.getState();
        ui.setFading(true);
        fadeTimer.current = window.setTimeout(() => {
          land({ to: req, feet, arriveYaw }, true);
          useUi.getState().setFading(false);
        }, RESPAWN_FADE_MS);
      } else {
        const p0 = camera.position.clone();
        const p3 = new Vector3(feet[0], feet[1] + EYE, feet[2]);
        const dist = Math.hypot(p3.x - p0.x, p3.z - p0.z);
        const cruise = Math.max(p0.y, p3.y) + 12 + dist * 0.07;
        flight.current = {
          to: req,
          t: 0,
          dur: Math.min(7, Math.max(3.2, 2.6 + dist / 55)),
          p0,
          p1: new Vector3(p0.x, cruise, p0.z),
          p2: new Vector3(p3.x, cruise, p3.z),
          p3,
          yaw0: playerPose.yaw,
          cruiseYaw: dist > 1 ? Math.atan2(-(p3.x - p0.x), -(p3.z - p0.z)) : playerPose.yaw,
          arriveYaw,
          feet,
        };
        cinematicControl.skip = false;
        if (body.current) body.current.geometry = geometries[ISLAND_TRACK[req]];
        useUi.getState().startCinematic({ kind: 'balloon', to: req });
        sfx.whoosh();
      }
    }

    const f = flight.current;
    const r = ride.current;
    if (!f) {
      if (r && r.visible) r.visible = false;
      return;
    }
    f.t += dt;
    if (cinematicControl.skip) f.t = f.dur;
    const u = Math.min(1, f.t / f.dur);
    const e = smooth(u);
    bezier(f, e, tmp);
    camera.position.copy(tmp);
    // Turn towards the destination early, then towards the landmark on the way down.
    const yaw = u < 0.75 ? lerpAngle(f.yaw0, f.cruiseYaw, smooth(Math.min(1, u / 0.2))) : lerpAngle(f.cruiseYaw, f.arriveYaw, smooth((u - 0.75) / 0.25));
    const pitch = -0.28 * Math.sin(Math.PI * Math.min(1, u * 1.15));
    camera.quaternion.setFromEuler(euler.set(pitch, yaw, 0));
    if (r) {
      r.visible = u < 1;
      r.position.set(tmp.x, tmp.y - FLOOR_BELOW_EYE, tmp.z);
      r.rotation.set(0, yaw, 0);
    }
    if (flame.current) flame.current.scale.setScalar(0.8 + Math.random() * 0.5);

    if (u >= 1) {
      flight.current = null;
      cinematicControl.skip = false;
      land(f, false);
      const ui = useUi.getState();
      if (ui.mode === 'cinematic') ui.closeOverlay();
    }
  });

  return (
    <group ref={ride} visible={false} scale={RIDE_SCALE}>
      <mesh ref={body} geometry={geometries.meta} material={vertexToon()} />
      <mesh ref={flame} geometry={flameGeo} material={glow('#ffb347', 1, false)} position={[0, 1.72, 0]} />
    </group>
  );
}
