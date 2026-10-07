'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import { Color, Matrix4, Object3D, OctahedronGeometry, type InstancedMesh } from 'three';
import { playerPose } from '@/components/player/playerState';
import { GEM_HEIGHT, GEM_PICKUP_RADIUS, ISLAND_TRACK } from '@/data/world';
import { sfx } from '@/lib/audio';
import { COLORS, GEM_COLORS } from '@/lib/palette';
import { getToonGradient } from '@/lib/toon';
import { getGemSpawns } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** Player body centre above the feet, used for the pickup distance. */
const BODY_CENTRE = 0.9;
/** Only animate gems this close to the player; distant ones keep their last pose. */
const ANIMATE_RADIUS = 120;
const HIDDEN = new Matrix4().makeScale(0, 0, 0);

/** Every Skill Gem in the world as one instanced draw: bobbing, spinning, collected on touch. */
export default function SkillGems() {
  const spawns = useMemo(() => getGemSpawns(), []);
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => {
    const g = new OctahedronGeometry(0.32, 0);
    g.scale(1, 1.45, 1);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Static per-gem data: track colour and a phase offset so gems don't bob in sync.
  const phases = useMemo(() => spawns.map((s, i) => (i * 2.399) % (Math.PI * 2)), [spawns]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new Color();
    spawns.forEach((s, i) => {
      mesh.setColorAt(i, c.set(GEM_COLORS[ISLAND_TRACK[s.phaseId]]));
      mesh.setMatrixAt(i, HIDDEN);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
    // Gems span the whole world and move every frame: never cull the batch (incl. the Outlines copy,
    // whose bounding sphere would otherwise be computed once from the initially hidden instances).
    mesh.traverse((o) => {
      o.frustumCulled = false;
    });
  }, [spawns]);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const gems = useProgress.getState().gems;
    const px = playerPose.x;
    const py = playerPose.y + BODY_CENTRE;
    const pz = playerPose.z;

    for (let i = 0; i < spawns.length; i++) {
      const s = spawns[i];
      if (gems[s.id]) {
        mesh.setMatrixAt(i, HIDDEN);
        continue;
      }
      const dx = s.x - px;
      const dz = s.z - pz;
      const flat = Math.hypot(dx, dz);
      if (flat > ANIMATE_RADIUS) continue;

      const y = s.y + GEM_HEIGHT + Math.sin(t * 2 + phases[i]) * 0.14;
      if (Math.hypot(flat, y - py) < GEM_PICKUP_RADIUS) {
        if (useProgress.getState().collectGem(s.id)) {
          useUi.getState().pushToast(s.id);
          sfx.gem();
        }
        mesh.setMatrixAt(i, HIDDEN);
        continue;
      }
      dummy.position.set(s.x, y, s.z);
      dummy.rotation.set(0, t * 1.4 + phases[i], 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, spawns.length]} frustumCulled={false} castShadow>
      <meshToonMaterial color="#ffffff" gradientMap={getToonGradient()} />
      <Outlines thickness={0.03} color={COLORS.outline} />
    </instancedMesh>
  );
}
