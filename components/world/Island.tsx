'use client';

import { useEffect, useMemo } from 'react';
import { Outlines } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import {
  BufferAttribute,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { IslandDef } from '@/data/world';
import { COLORS } from '@/lib/palette';
import { hash3, hashString, mulberry32 } from '@/lib/random';
import { getToonGradient } from '@/lib/toon';
import { islandSegments, islandWalkRadius } from '@/lib/worldLayout';

const GRASS_DEPTH = 0.9;
const DIRT_DEPTH = 1.8;
const COLLIDER_HALF_HEIGHT = 1.5;

/** Non-indexed copy with a flat vertex colour (or a per-vertex colour fn). */
function paint(geo: BufferGeometry, color: Color | ((y: number) => Color)): BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.getAttribute('position');
  const cols = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const c = typeof color === 'function' ? color(pos.getY(i)) : color;
    cols.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new BufferAttribute(cols, 3));
  if (g !== geo) geo.dispose();
  return g;
}

/**
 * One merged, vertex-coloured mesh per island: grass cap, dirt band, a jittered
 * rocky cone underneath and a few dangling rocks. Origin = top-surface centre.
 */
function buildIslandGeometry(def: IslandDef): BufferGeometry {
  const r = def.radius;
  const segs = islandSegments(r);
  const rng = mulberry32(hashString(def.id));

  // A light tint of the track colour: enough to tell paths apart, still reads as grass.
  const grass = new Color(COLORS.grass).lerp(new Color(def.color), 0.2);
  const dirt = new Color(COLORS.dirt);
  const rock = new Color(COLORS.rock);
  const rockDark = new Color(COLORS.rockDark);

  const cap = new CylinderGeometry(r, r * 0.98, GRASS_DEPTH, segs, 1);
  cap.translate(0, -GRASS_DEPTH / 2, 0);

  const band = new CylinderGeometry(r * 0.98, r * 0.86, DIRT_DEPTH, segs, 1, true);
  band.translate(0, -GRASS_DEPTH - DIRT_DEPTH / 2, 0);

  const coneTop = -GRASS_DEPTH - DIRT_DEPTH;
  const coneDepth = r * (1 + rng() * 0.35);
  const coneR = r * 0.86;
  const cone = new ConeGeometry(coneR, coneDepth, segs, 4, true);
  cone.rotateX(Math.PI); // apex down
  cone.translate(0, coneTop - coneDepth / 2, 0);
  // Jitter every vertex below the top ring. Duplicated seam vertices hash identically, so no cracks.
  const cp = cone.getAttribute('position');
  for (let i = 0; i < cp.count; i++) {
    const x = cp.getX(i);
    const y = cp.getY(i);
    const z = cp.getZ(i);
    if (y > coneTop - 0.01) continue;
    const h = hash3(Math.round(x * 100), Math.round(y * 100), Math.round(z * 100) + def.position[0]);
    const k = 1 + (h - 0.5) * 0.35;
    cp.setXYZ(i, x * k, y + (h - 0.5) * 1.2, z * k);
  }
  const rockShade = (y: number) => rock.clone().lerp(rockDark, Math.min(1, (coneTop - y) / coneDepth));

  const parts: BufferGeometry[] = [paint(cap, grass), paint(band, dirt), paint(cone, rockShade)];

  // Dangling rocks hugging the underside, plus one floating free below the tip.
  const rockCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < rockCount; i++) {
    const size = 0.6 + rng() * 1.1;
    const g = new DodecahedronGeometry(size, 0);
    const f = 0.35 + rng() * 0.55; // fraction down the cone
    const ang = rng() * Math.PI * 2;
    const rad = coneR * (1 - f) + size * 0.4;
    g.scale(1, 0.8 + rng() * 0.5, 1);
    g.rotateY(rng() * Math.PI);
    g.translate(Math.cos(ang) * rad, coneTop - f * coneDepth, Math.sin(ang) * rad);
    parts.push(paint(g, rockShade));
  }
  const floater = new DodecahedronGeometry(0.8 + rng() * 0.6, 0);
  floater.translate((rng() - 0.5) * 3, coneTop - coneDepth - 3 - rng() * 3, (rng() - 0.5) * 3);
  parts.push(paint(floater, rockDark));

  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  merged.computeVertexNormals(); // non-indexed → flat, faceted low-poly normals
  return merged;
}

export default function Island({ def }: { def: IslandDef }) {
  const geometry = useMemo(() => buildIslandGeometry(def), [def]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={def.position}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshToonMaterial vertexColors gradientMap={getToonGradient()} />
        <Outlines thickness={0.14} color={COLORS.outline} />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider
          args={[COLLIDER_HALF_HEIGHT, islandWalkRadius(def.radius)]}
          position={[0, -COLLIDER_HALF_HEIGHT, 0]}
        />
      </RigidBody>
    </group>
  );
}
