'use client';

import { useEffect, useMemo } from 'react';
import { BallCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import { ISLANDS } from '@/data/world';
import { COLORS } from '@/lib/palette';
import { DOCK_RADIUS, dockPosition, sceneryObstacles, scatterOnIsland, type ScatterPoint } from '@/lib/worldLayout';
import { useUi } from '@/store/ui';
import ToonInstances from './ToonInstances';

const TRUNK_HEIGHT = 1.6;

interface Batch {
  matrices: Matrix4[];
  colors: Color[];
}

const batch = (): Batch => ({ matrices: [], colors: [] });
const pick = <T,>(arr: readonly T[], rng: () => number) => arr[Math.floor(rng() * arr.length)];

function compose(x: number, y: number, z: number, rotY: number, sx: number, sy = sx, sz = sx) {
  return new Matrix4().compose(
    new Vector3(x, y, z),
    new Quaternion().setFromEuler(new Euler(0, rotY, 0)),
    new Vector3(sx, sy, sz),
  );
}

/** Seeded scatter of trees, rocks and flowers over every island (identical on every load). */
function buildScenery() {
  const trunks = batch();
  const round = batch();
  const pines = batch();
  const rocks = batch();
  const flowers = batch();
  const treeColliders: ScatterPoint[] = [];
  const rockColliders: { p: ScatterPoint; r: number }[] = [];

  for (const def of ISLANDS) {
    const { trees, rocks: rockPts } = sceneryObstacles(def);
    for (const t of trees) {
      const s = 0.85 + t.rng() * 0.5;
      trunks.matrices.push(compose(t.x, t.y + (TRUNK_HEIGHT * s) / 2, t.z, 0, s));
      trunks.colors.push(new Color(COLORS.trunk));
      if (t.rng() < 0.4) {
        pines.matrices.push(compose(t.x, t.y + TRUNK_HEIGHT * s + 1.1 * s, t.z, t.rng() * Math.PI, s));
        pines.colors.push(new Color(pick(COLORS.pine, t.rng)));
      } else {
        round.matrices.push(compose(t.x, t.y + TRUNK_HEIGHT * s + 0.6 * s, t.z, t.rng() * Math.PI, s * 1.1, s, s * 1.1));
        round.colors.push(new Color(pick(COLORS.leaves, t.rng)));
      }
      treeColliders.push(t);
    }

    for (const p of rockPts) {
      const s = 0.6 + p.rng() * 0.6;
      rocks.matrices.push(compose(p.x, p.y + 0.15 * s, p.z, p.rng() * Math.PI, s, s * (0.6 + p.rng() * 0.3), s));
      rocks.colors.push(new Color(COLORS.rock).lerp(new Color(COLORS.rockDark), p.rng() * 0.6));
      rockColliders.push({ p, r: 0.45 * s });
    }

    const flowerPts = scatterOnIsland(def, Math.round(def.radius), 'flowers', 0.9, {
      edgeMargin: 1,
      avoid: [...trees, ...rockPts],
      avoidDist: 1.2,
    });
    const [dx, , dz] = dockPosition(def);
    for (const p of flowerPts) {
      if (Math.hypot(p.x - dx, p.z - dz) < DOCK_RADIUS + 0.3) continue;
      flowers.matrices.push(compose(p.x, p.y + 0.2, p.z, p.rng() * Math.PI, 0.8 + p.rng() * 0.5));
      flowers.colors.push(new Color(pick(COLORS.flowers, p.rng)));
    }
  }

  return { trunks, round, pines, rocks, flowers, treeColliders, rockColliders };
}

export default function Scenery() {
  const s = useMemo(() => buildScenery(), []);
  const geos = useMemo(
    () => ({
      trunk: new CylinderGeometry(0.18, 0.28, TRUNK_HEIGHT, 6),
      round: new IcosahedronGeometry(1.25, 0),
      pine: new ConeGeometry(1.15, 2.8, 7),
      rock: new DodecahedronGeometry(0.6, 0),
      flower: new IcosahedronGeometry(0.16, 0),
    }),
    [],
  );
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  // Low quality drops the flowers (hundreds of tiny instances, one more draw).
  const low = useUi((st) => st.perfTier === 0);

  return (
    <>
      <ToonInstances geometry={geos.trunk} {...s.trunks} outline={0.04} />
      <ToonInstances geometry={geos.round} {...s.round} outline={0.05} />
      <ToonInstances geometry={geos.pine} {...s.pines} outline={0.05} />
      <ToonInstances geometry={geos.rock} {...s.rocks} outline={0.04} receiveShadow />
      {!low && <ToonInstances geometry={geos.flower} {...s.flowers} outline={0} castShadow={false} />}
      <RigidBody type="fixed" colliders={false}>
        {s.treeColliders.map((t, i) => (
          <CylinderCollider key={`t${i}`} args={[1.2, 0.32]} position={[t.x, t.y + 1.2, t.z]} />
        ))}
        {s.rockColliders.map(({ p, r }, i) => (
          <BallCollider key={`r${i}`} args={[r]} position={[p.x, p.y, p.z]} />
        ))}
      </RigidBody>
    </>
  );
}
