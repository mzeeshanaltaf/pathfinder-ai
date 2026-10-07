'use client';

import { useMemo, useRef } from 'react';
import { Vector3, type Group, type Mesh } from 'three';
import { CAREER_PATHS, COMPARISON, shortPathLabel } from '@/data/roadmap';
import { ISLAND_BY_ID, pathStart } from '@/data/world';
import { box, cone, cyl, extrude, part, type Part } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, useGeo, useLandmark, useLandmarkFrame } from './kit';

const ARROW: [number, number][] = [
  [0, -0.32],
  [2.1, -0.32],
  [2.1, -0.48],
  [2.65, 0],
  [2.1, 0.48],
  [2.1, 0.32],
  [0, 0.32],
];

/** Rows from the doc's side-by-side comparison shown as 3D star bars (picked so each path leads somewhere). */
const BAR_AREAS = ['Mathematics', 'Deep Learning', 'Customer Communication', 'Model Serving', 'Product Development'];
const BAR_ROWS = BAR_AREAS.map((a) => COMPARISON.find((r) => r.area === a)!).filter(Boolean);
const STAR_H = 0.32;
const CHART = { x: 0, z: -2.0 };
/** One bar per career path in each row. */
const BAR_STEP = 0.27;
const ROW_STEP = CAREER_PATHS.length * BAR_STEP + 0.08;
const CHART_WIDTH = BAR_ROWS.length * ROW_STEP + 0.3;
/** Half the chart base's width (its collider in landmarks/index.ts). */
export const CHART_HALF_WIDTH = CHART_WIDTH / 2;
/** Arms stack down the post, one per path (first path on top). */
const ARM_TOP = 4.35;
const ARM_STEP = 0.9;

function buildPost(): Part[] {
  return [
    part(cyl(1.2, 1.35, 0.3, 8), COLORS.rock, [0, 0.15, 0]),
    part(cyl(0.2, 0.24, 5.3, 8), COLORS.woodDark, [0, 2.9, 0]),
    part(cone(0.32, 0.5, 8), TRACK_COLORS.meta.dark, [0, 5.8, 0]),
    // Bar-chart base.
    part(box(CHART_WIDTH, 0.16, 0.9), COLORS.woodDark, [CHART.x, 0.08, CHART.z]),
  ];
}

/** Local yaw that points an arm's +X towards a world target. */
function armYaw(from: Vector3, to: [number, number, number], groupYaw: number): number {
  const d = new Vector3(to[0] - from.x, 0, to[2] - from.z).applyAxisAngle(new Vector3(0, 1, 0), -groupYaw);
  return Math.atan2(-d.z, d.x);
}

/** The Fork: a big crossroads signpost (one arm per career path, pointing at its first island) and star bars. */
export default function Signpost() {
  const { position, rotY } = useLandmark();
  const arms = useRef<Group[]>([]);
  const bars = useRef<Mesh[]>([]);
  const vane = useRef<Group>(null);
  const arrow = useGeo(() => extrude(ARROW, 0.14, 0.03));
  const vaneBar = useGeo(() => box(0.9, 0.08, 0.08));
  const vaneTip = useGeo(() => cone(0.12, 0.3, 4));
  const barGeo = useGeo(() => {
    const g = box(0.24, 1, 0.24);
    g.translate(0, 0.5, 0);
    return g;
  });

  const yaws = useMemo(() => {
    const from = new Vector3(...position);
    return CAREER_PATHS.map((p) => armYaw(from, ISLAND_BY_ID[pathStart(p.id)].position, rotY));
  }, [position, rotY]);

  const n = CAREER_PATHS.length;
  useLandmarkFrame((t) => {
    arms.current.forEach((a, i) => {
      if (a) a.rotation.z = Math.sin(t * 1.3 + i * 2) * 0.035;
    });
    bars.current.forEach((b, i) => {
      if (!b) return;
      const stars = BAR_ROWS[Math.floor(i / n)].stars[CAREER_PATHS[i % n].id] ?? 0;
      b.scale.y = Math.max(0.001, stars * STAR_H * (1 + Math.sin(t * 2 + i * 0.6) * 0.04));
    });
    if (vane.current) vane.current.rotation.y = t * 0.8;
  });

  return (
    <group>
      <Static build={buildPost} />
      {CAREER_PATHS.map((p, i) => (
        <group key={p.id} rotation={[0, yaws[i], 0]} position={[0, ARM_TOP - i * ARM_STEP, 0]}>
          <group
            ref={(g) => {
              if (g) arms.current[i] = g;
            }}
          >
            <mesh geometry={arrow} material={toon(TRACK_COLORS[p.id].base)} position={[0.15, 0, 0]} castShadow />
            <Caption position={[1.35, 0, 0.09]} size={0.26}>
              {shortPathLabel(p)}
            </Caption>
            <Caption position={[1.35, 0, -0.09]} rotation={[0, Math.PI, 0]} size={0.26}>
              {shortPathLabel(p)}
            </Caption>
          </group>
        </group>
      ))}
      <group ref={vane} position={[0, 6.1, 0]}>
        <mesh geometry={vaneBar} material={toon(TRACK_COLORS.meta.base)} />
        <mesh geometry={vaneTip} material={toon(TRACK_COLORS.meta.base)} position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />
      </group>
      <Near>{BAR_ROWS.flatMap((row, r) =>
        CAREER_PATHS.map((p, j) => (
          <mesh
            key={`${row.area}-${p.id}`}
            ref={(m) => {
              if (m) bars.current[r * n + j] = m;
            }}
            geometry={barGeo}
            material={toon(TRACK_COLORS[p.id].base)}
            position={[CHART.x + (r - (BAR_ROWS.length - 1) / 2) * ROW_STEP + (j - (n - 1) / 2) * BAR_STEP, 0.16, CHART.z]}
            scale={[1, Math.max(0.001, (row.stars[p.id] ?? 0) * STAR_H), 1]}
            castShadow
          />
        )),
      )}</Near>
      <Caption position={[CHART.x, 2.15, CHART.z]} size={0.2}>
        {`Skill stars: ${CAREER_PATHS.map((p) => shortPathLabel(p).replace(/^AI /, '')).join(' vs ')}`}
      </Caption>
    </group>
  );
}
