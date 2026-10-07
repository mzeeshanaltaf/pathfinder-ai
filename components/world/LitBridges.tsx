'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Matrix4, Object3D, OctahedronGeometry, SphereGeometry, Vector3, type InstancedMesh } from 'three';
import { playerPose } from '@/components/player/playerState';
import { glow } from '@/lib/materials';
import { hashString, mulberry32 } from '@/lib/random';
import { BRIDGE_HALF_WIDTH, BRIDGE_LAYOUTS, type BridgeLayout } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { bridgePostBases, POST_TOP } from './Bridge';

const MOTES_PER_BRIDGE = 10;
const ANIMATE_RADIUS = 160;
const HIDDEN = new Matrix4().makeScale(0, 0, 0);

interface Mote {
  bridge: BridgeLayout;
  along: number;
  side: number;
  speed: number;
  phase: number;
}

/**
 * Lit bridges: once a bridge's `from` island has a badge, lanterns glow on its posts and golden
 * motes drift up over the deck. Purely visual, never a lock.
 */
export default function LitBridges() {
  const litKey = useProgress((s) => BRIDGE_LAYOUTS.map((b) => (s.badges[b.from.id] ? 1 : 0)).join(''));
  const low = useUi((s) => s.perfTier === 0);
  const lit = useMemo(() => BRIDGE_LAYOUTS.filter((_, i) => litKey[i] === '1'), [litKey]);

  const lanterns = useMemo(() => lit.flatMap((b) => bridgePostBases(b).flat().map((p) => p.clone().add(new Vector3(0, POST_TOP + 0.12, 0)))), [lit]);
  const motes = useMemo<Mote[]>(() => {
    const per = low ? 3 : MOTES_PER_BRIDGE;
    return lit.flatMap((b) => {
      const rng = mulberry32(hashString(`motes:${b.key}`));
      return Array.from({ length: per }, () => ({ bridge: b, along: rng(), side: rng() * 2 - 1, speed: 0.25 + rng() * 0.25, phase: rng() }));
    });
  }, [lit, low]);

  const lanternGeo = useMemo(() => new SphereGeometry(0.13, 8, 6), []);
  const moteGeo = useMemo(() => new OctahedronGeometry(0.09, 0), []);
  useEffect(
    () => () => {
      lanternGeo.dispose();
      moteGeo.dispose();
    },
    [lanternGeo, moteGeo],
  );

  const lanternRef = useRef<InstancedMesh>(null);
  const moteRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const v = useMemo(() => new Vector3(), []);

  useLayoutEffect(() => {
    const mesh = lanternRef.current;
    if (!mesh) return;
    lanterns.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [lanterns, dummy]);

  useLayoutEffect(() => {
    const mesh = moteRef.current;
    if (!mesh) return;
    for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, HIDDEN);
    mesh.instanceMatrix.needsUpdate = true;
  }, [motes]);

  useFrame(({ clock }) => {
    const mesh = moteRef.current;
    if (!mesh || motes.length === 0) return;
    const t = clock.elapsedTime;
    motes.forEach((m, i) => {
      const b = m.bridge;
      const u = (t * m.speed * 0.25 + m.phase) % 1;
      const along = (m.along + t * 0.015) % 1;
      v.copy(b.start).lerp(b.end, along);
      if (Math.hypot(v.x - playerPose.x, v.z - playerPose.z) > ANIMATE_RADIUS) {
        mesh.setMatrixAt(i, HIDDEN);
        return;
      }
      // Sideways offset across the deck (perpendicular to the bridge, horizontal).
      const dx = b.end.z - b.start.z;
      const dz = -(b.end.x - b.start.x);
      const len = Math.hypot(dx, dz) || 1;
      const off = m.side * BRIDGE_HALF_WIDTH * 0.9;
      dummy.position.set(v.x + (dx / len) * off, v.y + 0.3 + u * 2.4, v.z + (dz / len) * off);
      dummy.rotation.set(t + i, t * 1.3 + i, 0);
      dummy.scale.setScalar(Math.sin(u * Math.PI) + 0.001);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {lanterns.length > 0 && (
        <instancedMesh key={`l${lanterns.length}`} ref={lanternRef} args={[lanternGeo, glow('#ffe39a', 1, false), lanterns.length]} />
      )}
      {motes.length > 0 && (
        <instancedMesh key={`m${motes.length}`} ref={moteRef} args={[moteGeo, glow('#ffd66e', 1, false), motes.length]} frustumCulled={false} />
      )}
    </>
  );
}
