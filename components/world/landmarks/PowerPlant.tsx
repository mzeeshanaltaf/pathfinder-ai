'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, LatheGeometry, Object3D, Vector2, type InstancedMesh } from 'three';
import { beam, box, cyl, part, torus, transformParts, type Part, type Vec3 } from '@/lib/landmarkKit';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Smoke } from './fx';
import { Static, StaticGlow, useGeo, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;
const CONCRETE = '#ebe6f4';

export const COOLING: { at: Vec3; s: number }[] = [
  { at: [-1.25, 0, -1.35], s: 1 },
  { at: [1.3, 0, -1.5], s: 0.85 },
];
const TOWER_H = 3.4;
const BUILDING = { z: 0.7, w: 2.9, h: 1.2, d: 1.25 };
const CHIPS = [-0.9, 0, 0.9];

/** Hyperbolic cooling-tower shell. */
function coolingShell(): LatheGeometry {
  const pts: Vector2[] = [];
  for (let i = 0; i <= 8; i++) {
    const y = (i / 8) * TOWER_H;
    const r = y <= 2.3 ? 0.62 + 0.38 * ((y - 2.3) / 2.3) ** 2 : 0.62 + (y - 2.3) * 0.15;
    pts.push(new Vector2(r, y));
  }
  return new LatheGeometry(pts, 12);
}

function buildPlant(): Part[] {
  const parts: Part[] = [];
  for (const c of COOLING) {
    parts.push(
      ...transformParts(
        [
          part(coolingShell(), CONCRETE),
          part(cyl(0.74, 0.74, 0.05, 12), COLORS.outline, [0, TOWER_H - 0.3, 0]),
          part(torus(0.7, 0.07, 4, 16), E.base, [0, 2.9, 0], [Math.PI / 2, 0, 0]),
          part(torus(0.82, 0.07, 4, 16), E.base, [0, 1.2, 0], [Math.PI / 2, 0, 0]),
        ],
        c.at,
        [0, 0, 0],
        c.s,
      ),
    );
  }
  const { z, w, h, d } = BUILDING;
  parts.push(part(box(w, h, d), CONCRETE, [0, h / 2, z]));
  parts.push(part(box(w + 0.12, 0.12, d + 0.12), E.dark, [0, h + 0.06, z]));
  parts.push(part(box(0.65, 0.9, 0.08), COLORS.woodDark, [-1.0, 0.45, z + d / 2 + 0.03]));
  // GPU chips on the roof: circuit board + gold pins.
  for (const x of CHIPS) {
    parts.push(part(box(0.66, 0.08, 0.66), '#2f5d50', [x, h + 0.16, z]));
    for (const k of [-0.24, -0.08, 0.08, 0.24]) {
      parts.push(part(box(0.06, 0.03, 0.14), '#ffc93c', [x + k, h + 0.14, z + 0.38]));
      parts.push(part(box(0.06, 0.03, 0.14), '#ffc93c', [x + k, h + 0.14, z - 0.38]));
    }
  }
  // Power lines from the plant to each tower.
  for (const c of COOLING) parts.push(beam([c.at[0] * 0.4, h - 0.1, z - d / 2], [c.at[0], 1.0 * c.s, c.at[2] + 0.7 * c.s], 0.06, COLORS.outline, true));
  return parts;
}

function buildWindows(): Part[] {
  const { z, d } = BUILDING;
  return [0.2, 1.0].map((x) => part(box(0.55, 0.42, 0.06), '#c6e0fa', [x, 0.72, z + d / 2 + 0.03]));
}

/** GPU Power Plant: cooling towers venting steam, and glowing GPU chips on the plant roof. */
export default function PowerPlant() {
  const dies = useRef<InstancedMesh>(null);
  const dieGeo = useGeo(() => box(0.34, 0.07, 0.34));
  const dummy = useMemo(() => new Object3D(), []);
  const base = useMemo(() => new Color('#7ff3ff'), []);
  const c = useMemo(() => new Color(), []);

  // Place the dies once, so they show (at rest) before the first animated frame.
  useLayoutEffect(() => {
    const mesh = dies.current;
    if (!mesh) return;
    CHIPS.forEach((x, i) => {
      dummy.position.set(x, BUILDING.h + 0.23, BUILDING.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, base);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy, base]);

  useLandmarkFrame((t) => {
    const mesh = dies.current;
    if (!mesh) return;
    CHIPS.forEach((_, i) => mesh.setColorAt(i, c.copy(base).multiplyScalar(0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4 + i * 2.1)))));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const vents = useMemo(() => COOLING.map((k) => [k.at[0], TOWER_H * k.s + 0.1, k.at[2]] as Vec3), []);

  return (
    <group>
      <Static build={buildPlant} />
      <StaticGlow build={buildWindows} />
      <Smoke vents={vents} size={0.6} rise={3.2} speed={0.25} />
      <instancedMesh ref={dies} args={[dieGeo, undefined, CHIPS.length]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
