'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { Color, Object3D, SphereGeometry, type InstancedMesh } from 'three';
import { playerPose } from '@/components/player/playerState';
import { ISLAND_TRACK, ISLANDS } from '@/data/world';
import { beam, box, cone, cyl, mergeParts, part, torus, type Part } from '@/lib/landmarkKit';
import { vertexToon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { DOCK_RADIUS, dockPosition } from '@/lib/worldLayout';

/** Basket bottom above the dock platform for a parked balloon. */
const PARKED_Y = 2.45;
/** Dock platform height (players land standing on it). */
export const DOCK_PLATFORM_H = 0.2;
const STRIPES = 8;

/**
 * One hot-air balloon (origin = basket floor centre). By default white and light-grey stripes, so
 * an instance colour tints it per track; `stripe` paints coloured stripes instead (the ride, which
 * keeps its wicker basket untinted). `open` = walls only, no lid (you ride inside it).
 */
export function balloonParts(open = false, stripe?: string): Part[] {
  const wicker = '#e9c79a';
  const parts: Part[] = [];
  const bw = 0.95;
  const wall = 0.08;
  const h = 0.62;
  parts.push(part(box(bw, 0.06, bw), wicker, [0, 0.03, 0]));
  for (const s of [-1, 1]) {
    parts.push(part(box(bw, h, wall), wicker, [0, h / 2, (s * (bw - wall)) / 2]));
    parts.push(part(box(wall, h, bw), wicker, [(s * (bw - wall)) / 2, h / 2, 0]));
  }
  if (!open) parts.push(part(box(bw - 0.1, 0.05, bw - 0.1), '#d9b07c', [0, h - 0.06, 0]));
  parts.push(part(torus(0.5, 0.05, 4, 12), '#c99363', [0, h, 0], [Math.PI / 2, Math.PI / 4, 0]));
  for (const x of [-1, 1]) for (const z of [-1, 1]) parts.push(beam([x * 0.42, h, z * 0.42], [x * 0.34, 1.75, z * 0.34], 0.035, COLORS.outline, true));
  parts.push(part(cyl(0.16, 0.12, 0.22, 8), COLORS.outline, [0, 1.55, 0]));
  parts.push(part(cone(0.62, 0.55, 12), '#ffffff', [0, 1.95, 0], [Math.PI, 0, 0]));
  for (let i = 0; i < STRIPES; i++) {
    const g = new SphereGeometry(1.25, 3, 10, (i / STRIPES) * Math.PI * 2, (Math.PI * 2) / STRIPES);
    parts.push(part(g, i % 2 ? '#ffffff' : (stripe ?? '#d6d0e4'), [0, 3.0, 0], [0, 0, 0], [1, 1.15, 1]));
  }
  return parts;
}

/** Dock platform + mooring post for every island, merged into one mesh. */
function buildDocks(): Part[] {
  const parts: Part[] = [];
  for (const def of ISLANDS) {
    const [x, y, z] = dockPosition(def);
    const out = outward(def.position, x, z);
    parts.push(part(cyl(DOCK_RADIUS, DOCK_RADIUS + 0.05, 0.2, 12), COLORS.wood, [x, y + 0.1, z]));
    parts.push(part(torus(DOCK_RADIUS, 0.06, 4, 16), COLORS.woodDark, [x, y + 0.2, z], [Math.PI / 2, 0, 0]));
    const px = x + out[0] * (DOCK_RADIUS + 0.15);
    const pz = z + out[1] * (DOCK_RADIUS + 0.15);
    parts.push(part(cyl(0.11, 0.13, 1.4, 6), COLORS.woodDark, [px, y + 0.7, pz]));
    const [bx, bz] = parkedAt(def.position, x, z);
    parts.push(beam([px, y + 1.35, pz], [bx + out[0] * 0.4, y + PARKED_Y + 0.2, bz + out[1] * 0.4], 0.04, COLORS.rope, true));
  }
  return parts;
}

/** Unit XZ direction from the island centre to the dock (the dock's "outside"). */
function outward(c: readonly number[], x: number, z: number): [number, number] {
  const dx = x - c[0];
  const dz = z - c[2];
  const len = Math.hypot(dx, dz) || 1;
  return [dx / len, dz / len];
}

/** A parked balloon floats just outside the platform centre, so players can stand on the dock. */
function parkedAt(c: readonly number[], x: number, z: number): [number, number] {
  const [ox, oz] = outward(c, x, z);
  return [x + ox * 0.9, z + oz * 0.9];
}

/** Parked balloons gently bob within this distance of the player. */
const BOB_RADIUS = 150;

/** A balloon dock on every island: platform, mooring post and a parked, bobbing balloon (one instanced draw). */
export default function BalloonDocks() {
  const docks = useMemo(() => mergeParts(buildDocks()), []);
  const balloon = useMemo(() => mergeParts(balloonParts()), []);
  useEffect(
    () => () => {
      docks.dispose();
      balloon.dispose();
    },
    [docks, balloon],
  );
  const ref = useRef<InstancedMesh>(null);
  const spots = useMemo(
    () =>
      ISLANDS.map((def, i) => {
        const [x, y, z] = dockPosition(def);
        const [bx, bz] = parkedAt(def.position, x, z);
        return { x: bx, y: y + PARKED_Y, z: bz, i, track: ISLAND_TRACK[def.id], dock: [x, y, z] as const };
      }),
    [],
  );
  const dummy = useMemo(() => new Object3D(), []);

  const place = (mesh: InstancedMesh, t: number, all: boolean) => {
    for (const s of spots) {
      if (!all && Math.hypot(s.x - playerPose.x, s.z - playerPose.z) > BOB_RADIUS) continue;
      dummy.position.set(s.x, s.y + Math.sin(t * 0.9 + s.i) * 0.14, s.z);
      dummy.rotation.set(Math.sin(t * 0.7 + s.i) * 0.03, s.i + t * 0.05, Math.cos(t * 0.6 + s.i) * 0.03);
      dummy.updateMatrix();
      mesh.setMatrixAt(s.i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new Color();
    for (const s of spots) mesh.setColorAt(s.i, c.set(TRACK_COLORS[s.track].base));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    place(mesh, 0, true);
    mesh.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots]);

  useFrame(({ clock }) => {
    if (ref.current) place(ref.current, clock.elapsedTime, false);
  });

  return (
    <>
      <mesh geometry={docks} material={vertexToon()} receiveShadow castShadow>
        <Outlines thickness={0.03} color={COLORS.outline} />
      </mesh>
      <instancedMesh ref={ref} args={[balloon, vertexToon(), spots.length]} castShadow frustumCulled={false}>
        <Outlines thickness={0.03} color={COLORS.outline} />
      </instancedMesh>
      <RigidBody type="fixed" colliders={false}>
        {spots.map((s) => {
          const out = outward(ISLANDS[s.i].position, s.dock[0], s.dock[2]);
          return (
            <group key={s.i}>
              <CylinderCollider args={[DOCK_PLATFORM_H / 2, DOCK_RADIUS]} position={[s.dock[0], s.dock[1] + DOCK_PLATFORM_H / 2, s.dock[2]]} />
              <CylinderCollider
                args={[0.7, 0.16]}
                position={[s.dock[0] + out[0] * (DOCK_RADIUS + 0.15), s.dock[1] + 0.7, s.dock[2] + out[1] * (DOCK_RADIUS + 0.15)]}
              />
            </group>
          );
        })}
      </RigidBody>
    </>
  );
}
