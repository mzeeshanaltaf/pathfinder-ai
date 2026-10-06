'use client';

import { useEffect, useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { COLORS } from '@/lib/palette';
import { getToonGradient } from '@/lib/toon';
import { hashString, mulberry32 } from '@/lib/random';
import { BRIDGE_HALF_WIDTH, BRIDGE_LAYOUTS, BRIDGE_OVERLAP, type BridgeLayout } from '@/lib/worldLayout';
import ToonInstances from './ToonInstances';

const PLANK_WIDTH = 3.3;
const PLANK_DEPTH = 0.55;
const PLANK_GAP = 0.09;
const PLANK_THICKNESS = 0.2;
/** Planks sit a hair above the (invisible) deck collider to avoid z-fighting with the island top. */
const PLANK_LIFT = 0.03;
const POST_SPACING = 3.4;
const POST_OFFSET = BRIDGE_HALF_WIDTH + 0.2;
const POST_HEIGHT = 1.25;
const ROPE_SAG = 0.2;
/** Below the ~1.5 m jump apex: leaving a bridge is possible, just never accidental. */
const WALL_HEIGHT = 1.2;

interface BridgeParts {
  planks: Matrix4[];
  beams: Matrix4[];
  posts: Matrix4[];
  ropes: BufferGeometry;
}

const UP = new Vector3(0, 1, 0);

/** Visible span: from just inside each island rim. */
const span = (b: BridgeLayout) => ({ from: BRIDGE_OVERLAP - 0.3, to: b.length - BRIDGE_OVERLAP + 0.3 });

function buildBridges(layouts: BridgeLayout[]): BridgeParts {
  const planks: Matrix4[] = [];
  const beams: Matrix4[] = [];
  const posts: Matrix4[] = [];
  const ropeGeos: BufferGeometry[] = [];

  const local = new Vector3();
  const jitterQ = new Quaternion();
  const toWorld = (b: BridgeLayout, x: number, y: number, z: number) =>
    local.set(x, y, z).applyQuaternion(b.quaternion).add(b.start).clone();

  for (const b of layouts) {
    const rng = mulberry32(hashString(b.key));
    const { from, to } = span(b);

    // Planks, each slightly askew for a hand-made look.
    const step = PLANK_DEPTH + PLANK_GAP;
    for (let z = from + PLANK_DEPTH / 2; z < to; z += step) {
      const pos = toWorld(b, (rng() - 0.5) * 0.1, PLANK_LIFT - PLANK_THICKNESS / 2 + (rng() - 0.5) * 0.03, z);
      jitterQ.setFromAxisAngle(UP, (rng() - 0.5) * 0.08);
      planks.push(new Matrix4().compose(pos, b.quaternion.clone().multiply(jitterQ), new Vector3(1, 1, 1)));
    }

    // Two support beams under the planks (unit box scaled along the bridge).
    const len = to - from;
    for (const x of [-1.1, 1.1]) {
      const pos = toWorld(b, x, -PLANK_THICKNESS - 0.12, from + len / 2);
      beams.push(new Matrix4().compose(pos, b.quaternion, new Vector3(1, 1, len)));
    }

    // Vertical posts on both sides, ropes strung between their tops with a little sag.
    const count = Math.max(2, Math.round(len / POST_SPACING) + 1);
    for (const side of [-1, 1]) {
      const tops: Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const base = toWorld(b, side * POST_OFFSET, 0, from + (len * i) / (count - 1));
        posts.push(new Matrix4().makeTranslation(base.x, base.y + POST_HEIGHT / 2 - 0.25, base.z));
        tops.push(base.add(new Vector3(0, POST_HEIGHT - 0.35, 0)));
      }
      const pts: Vector3[] = [];
      tops.forEach((t, i) => {
        pts.push(t);
        if (i < tops.length - 1) pts.push(t.clone().lerp(tops[i + 1], 0.5).add(new Vector3(0, -ROPE_SAG, 0)));
      });
      ropeGeos.push(new TubeGeometry(new CatmullRomCurve3(pts), pts.length * 4, 0.05, 5, false));
    }
  }

  const ropes = mergeGeometries(ropeGeos);
  ropeGeos.forEach((g) => g.dispose());
  return { planks, beams, posts, ropes };
}

/** Deck + invisible low side walls so new players don't trivially walk off. */
function BridgeColliders({ b }: { b: BridgeLayout }) {
  const rimA = BRIDGE_OVERLAP + 0.2;
  const rimB = b.length - BRIDGE_OVERLAP - 0.2;
  const wallHalf = Math.max(0.1, (rimB - rimA) / 2);
  const wallMid = (rimA + rimB) / 2;
  return (
    <RigidBody type="fixed" colliders={false} position={b.start.toArray()} rotation={b.rotation}>
      <CuboidCollider args={[BRIDGE_HALF_WIDTH, 0.15, b.length / 2]} position={[0, -0.15, b.length / 2]} />
      {[-1, 1].map((side) => (
        <CuboidCollider
          key={side}
          args={[0.1, WALL_HEIGHT / 2, wallHalf]}
          position={[side * (BRIDGE_HALF_WIDTH + 0.1), WALL_HEIGHT / 2, wallMid]}
        />
      ))}
    </RigidBody>
  );
}

/** All bridges, batched: planks, beams and posts are instanced; ropes are one merged mesh. */
export default function Bridges() {
  const parts = useMemo(() => buildBridges(BRIDGE_LAYOUTS), []);
  const geos = useMemo(
    () => ({
      plank: new BoxGeometry(PLANK_WIDTH, PLANK_THICKNESS, PLANK_DEPTH),
      beam: new BoxGeometry(0.28, 0.24, 1),
      post: new CylinderGeometry(0.11, 0.13, POST_HEIGHT, 6),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose());
      parts.ropes.dispose();
    },
    [geos, parts],
  );

  return (
    <>
      <ToonInstances geometry={geos.plank} matrices={parts.planks} color={COLORS.wood} outline={0.035} receiveShadow />
      <ToonInstances geometry={geos.beam} matrices={parts.beams} color={COLORS.woodDark} outline={0.03} />
      <ToonInstances geometry={geos.post} matrices={parts.posts} color={COLORS.woodDark} outline={0.035} />
      <mesh geometry={parts.ropes} castShadow>
        <meshToonMaterial color={COLORS.rope} gradientMap={getToonGradient()} />
      </mesh>
      {BRIDGE_LAYOUTS.map((b) => (
        <BridgeColliders key={b.key} b={b} />
      ))}
    </>
  );
}
