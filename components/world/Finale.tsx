'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Matrix4, Object3D, OctahedronGeometry, Vector3, type InstancedMesh } from 'three';
import { cinematicControl, playerControl, playerPose } from '@/components/player/playerState';
import { ISLAND_BY_ID } from '@/data/world';
import { sfx } from '@/lib/audio';
import { landmarkPosition, landmarkScale } from '@/lib/worldLayout';
import { useUi } from '@/store/ui';
import { HOLO_CENTRE_Y } from './landmarks/SummitPlaza';

const SUMMIT = ISLAND_BY_ID.summit;
/** Centre of the holographic architecture, world space. */
const CENTRE = (() => {
  const [x, y, z] = landmarkPosition(SUMMIT);
  return new Vector3(x, y + HOLO_CENTRE_Y * landmarkScale(SUMMIT), z);
})();
const DURATION = 9;
const PER_BURST = 36;
const MAX_BURSTS = 9;
const COUNT = PER_BURST * MAX_BURSTS;
const LIFE = 1.9;
const COLORS = ['#ffc93c', '#ff7eb6', '#7fd99a', '#82bdf2', '#b9a3ee', '#ffa940', '#ffffff'];
const HIDDEN = new Matrix4().makeScale(0, 0, 0);

const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Summit celebration: while `cinematic.kind === 'finale'` the camera circles the holographic
 * architecture; fireworks burst overhead during the fly-around and the finale card that follows.
 */
export default function Finale() {
  const camera = useThree((s) => s.camera);
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new OctahedronGeometry(1, 0), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  // Particle state is mutated every frame, so it lives in a ref (not a memoised value).
  const particles = useRef({ pos: new Float32Array(COUNT * 3), vel: new Float32Array(COUNT * 3), age: new Float32Array(COUNT).fill(LIFE), next: 0 });
  const show = useRef({ flying: false, t: 0, a0: 0, timer: 0 });

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < COUNT; i++) {
      mesh.setMatrixAt(i, HIDDEN);
      mesh.setColorAt(i, color.set('#ffffff'));
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [color]);

  const burst = () => {
    const mesh = ref.current;
    if (!mesh) return;
    const parts = particles.current;
    const cx = CENTRE.x + (Math.random() - 0.5) * 18;
    const cy = CENTRE.y + 6 + Math.random() * 7;
    const cz = CENTRE.z + (Math.random() - 0.5) * 18;
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    const speed = 5 + Math.random() * 2.5;
    for (let k = 0; k < PER_BURST; k++) {
      const i = parts.next;
      parts.next = (parts.next + 1) % COUNT;
      // Even-ish directions on a sphere.
      const yy = 1 - (2 * (k + 0.5)) / PER_BURST;
      const r = Math.sqrt(1 - yy * yy);
      const th = k * 2.39996;
      parts.pos.set([cx, cy, cz], i * 3);
      parts.vel.set([Math.cos(th) * r * speed, yy * speed, Math.sin(th) * r * speed], i * 3);
      parts.age[i] = 0;
      mesh.setColorAt(i, color.set(c));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    sfx.firework();
  };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const ui = useUi.getState();
    const flying = ui.cinematic?.kind === 'finale';
    const celebrating = flying || ui.menu === 'finale';
    const s = show.current;

    if (flying && !s.flying) {
      s.t = 0;
      s.timer = 0.3;
      s.a0 = Math.atan2(camera.position.z - CENTRE.z, camera.position.x - CENTRE.x);
      cinematicControl.skip = false;
    }
    s.flying = flying;

    if (flying) {
      s.t += dt;
      const e = smooth(Math.min(1, s.t / DURATION));
      const a = s.a0 + e * Math.PI * 1.15;
      const radius = 19 - 7 * e;
      camera.position.set(CENTRE.x + Math.cos(a) * radius, CENTRE.y + 4.5 - 2.5 * e + Math.sin(e * Math.PI) * 2, CENTRE.z + Math.sin(a) * radius);
      camera.lookAt(CENTRE.x, CENTRE.y + 0.8, CENTRE.z);
      if (s.t >= DURATION || cinematicControl.skip) {
        cinematicControl.skip = false;
        // Hand back to the player, looking up at the hologram.
        playerControl.face?.(Math.atan2(-(CENTRE.x - playerPose.x), -(CENTRE.z - playerPose.z)));
        ui.openMenu('finale');
      }
    }

    if (celebrating) {
      s.timer -= dt;
      if (s.timer <= 0) {
        burst();
        s.timer = 0.45 + Math.random() * 0.5;
      }
    }

    const mesh = ref.current;
    if (!mesh) return;
    const parts = particles.current;
    let any = false;
    for (let i = 0; i < COUNT; i++) {
      if (parts.age[i] >= LIFE) continue;
      any = true;
      parts.age[i] += dt;
      const o = i * 3;
      parts.vel[o + 1] -= 3.2 * dt;
      for (let k = 0; k < 3; k++) {
        parts.vel[o + k] *= 1 - 0.9 * dt;
        parts.pos[o + k] += parts.vel[o + k] * dt;
      }
      if (parts.age[i] >= LIFE) {
        mesh.setMatrixAt(i, HIDDEN);
        continue;
      }
      dummy.position.set(parts.pos[o], parts.pos[o + 1], parts.pos[o + 2]);
      dummy.rotation.set(parts.age[i] * 6, parts.age[i] * 4, 0);
      dummy.scale.setScalar(0.28 * (1 - parts.age[i] / LIFE) + 0.001);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    if (any) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geo, undefined, COUNT]} frustumCulled={false}>
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
