'use client';

import { useMemo, useRef } from 'react';
import { ConeGeometry, EdgesGeometry, Object3D, SphereGeometry, type Group, type InstancedMesh } from 'three';
import { getPhase } from '@/data/roadmap';
import { box, cyl, part, ring, sphere, type Part } from '@/lib/landmarkKit';
import { animatedGlow, glow } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Static, StaticGlow, useGeo, useHiddenInstances, useLandmarkFrame } from './kit';

const M = TRACK_COLORS.meta;
/** The doc's production architecture, top (Frontend) to bottom (Monitoring). */
export const ARCH_ROWS = getPhase('summit').diagrams![0].steps.map((row) => row.split(' | '));
const TOP = 6.1;
const ROW_GAP = 0.74;
const ROW_W = 2.6;
const BOX_H = 0.34;
const BOX_D = 0.55;
const PULSES = 6;
export const HOLO_CENTRE_Y = TOP - ((ARCH_ROWS.length - 1) * ROW_GAP) / 2;

const rowY = (i: number) => TOP - i * ROW_GAP;
function boxesFor(row: string[]) {
  const gap = 0.08;
  const w = (ROW_W - gap * (row.length - 1)) / row.length;
  return row.map((label, k) => ({ label, w, x: -ROW_W / 2 + w / 2 + k * (w + gap) }));
}

function buildPlaza(): Part[] {
  const parts: Part[] = [
    part(cyl(2.95, 3.05, 0.16, 16), '#d9d3e6', [0, 0.08, 0]),
    part(cyl(2.6, 2.7, 0.18, 16), '#efeaf7', [0, 0.25, 0]),
    part(cyl(0.62, 0.75, 0.5, 10), M.dark, [0, 0.59, 0]),
    part(cyl(0.48, 0.48, 0.08, 10), COLORS.outline, [0, 0.86, 0]),
  ];
  for (const p of ring(6, 2.3, Math.PI / 6)) {
    parts.push(part(cyl(0.16, 0.2, 2.3, 8), '#f7f4ff', [p.x, 1.49, p.z]));
    parts.push(part(box(0.5, 0.16, 0.5), M.base, [p.x, 2.7, p.z]));
    parts.push(part(box(0.48, 0.12, 0.48), '#f7f4ff', [p.x, 0.4, p.z]));
  }
  return parts;
}

function buildLamps(): Part[] {
  return [
    ...ring(6, 2.3, Math.PI / 6).map((p) => part(sphere(0.17, 8, 6), '#fff1b0', [p.x, 2.95, p.z])),
    part(cyl(0.42, 0.42, 0.04, 10), '#7ff3ff', [0, 0.91, 0]),
  ];
}

/** Hologram materials (module scope: one Summit, and the frame loop animates their opacity). */
const FILL = animatedGlow('#5fd4e6', 0.45, false);
const EDGE = animatedGlow('#1d8aa3', 0.9, false);
const BEAM = animatedGlow('#9fe7f5', 0.1, false);

/** The Summit: a plaza where a holographic production-AI architecture floats above a projector. */
export default function SummitPlaza() {
  const holo = useRef<Group>(null);
  const pulses = useRef<InstancedMesh>(null);
  const boxGeo = useGeo(() => box(1, BOX_H, BOX_D));
  const edgeGeo = useGeo(() => new EdgesGeometry(box(1, BOX_H, BOX_D)));
  const beamGeo = useGeo(() => {
    const g = new ConeGeometry(1.7, TOP - 0.6, 16, 1, true);
    g.rotateX(Math.PI);
    g.translate(0, (TOP - 0.6) / 2 + 0.9, 0);
    return g;
  });
  const pulseGeo = useGeo(() => new SphereGeometry(0.07, 8, 6));
  const layout = useMemo(() => ARCH_ROWS.map(boxesFor), []);
  const dummy = useMemo(() => new Object3D(), []);
  useHiddenInstances(pulses);

  useLandmarkFrame((t) => {
    if (holo.current) {
      holo.current.rotation.y = t * 0.25;
      holo.current.position.y = Math.sin(t * 0.9) * 0.06;
    }
    FILL.opacity = 0.42 + Math.sin(t * 2.2) * 0.06;
    EDGE.opacity = 0.8 + Math.sin(t * 3.1) * 0.15;
    BEAM.opacity = 0.09 + Math.sin(t * 1.7) * 0.03;
    const mesh = pulses.current;
    if (!mesh) return;
    // Requests flow down through the stack, one layer at a time.
    for (let i = 0; i < PULSES; i++) {
      const u = (t * 0.35 + i / PULSES) % 1;
      const f = u * (ARCH_ROWS.length - 1);
      const k = Math.floor(f);
      const row = layout[k];
      const next = layout[Math.min(k + 1, layout.length - 1)];
      const a = row[i % row.length];
      const b = next[i % next.length];
      const frac = f - k;
      dummy.position.set(a.x + (b.x - a.x) * frac, rowY(k) - ROW_GAP * frac, (i % 2 ? 1 : -1) * 0.12);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Static build={buildPlaza} />
      <StaticGlow build={buildLamps} />
      <mesh geometry={beamGeo} material={BEAM} />
      <group ref={holo}>
        {layout.map((row, i) =>
          row.map((b) => (
            <group key={b.label} position={[b.x, rowY(i), 0]}>
              <mesh geometry={boxGeo} material={FILL} scale={[b.w, 1, 1]} />
              <lineSegments geometry={edgeGeo} material={EDGE} scale={[b.w, 1, 1]} />
              <Caption position={[0, 0, BOX_D / 2 + 0.02]} size={b.w < 1 ? 0.13 : 0.17} color="#1d4e63" outline="#e6fdff" maxWidth={b.w * 0.95} frontOnly>
                {b.label}
              </Caption>
              <Caption position={[0, 0, -BOX_D / 2 - 0.02]} rotation={[0, Math.PI, 0]} size={b.w < 1 ? 0.13 : 0.17} color="#1d4e63" outline="#e6fdff" maxWidth={b.w * 0.95} frontOnly>
                {b.label}
              </Caption>
            </group>
          )),
        )}
        <instancedMesh ref={pulses} args={[pulseGeo, glow('#ffffff', 1, false), PULSES]} frustumCulled={false} />
      </group>
    </group>
  );
}
