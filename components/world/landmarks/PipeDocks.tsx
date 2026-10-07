'use client';

import { useMemo, useRef } from 'react';
import { Object3D, Vector3, type Group, type InstancedMesh, type Mesh } from 'three';
import { beam, box, cyl, part, torus, type Part, type Vec3 } from '@/lib/landmarkKit';
import { toon } from '@/lib/materials';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Caption, Near, Static, useGeo, useHiddenInstances, useInstanceColors, useLandmarkFrame } from './kit';

const F = TRACK_COLORS.fde;
const HUB: Vec3 = [0, 0, -0.3];
const CRATES: Vec3 = [-2.0, 0, -0.6];
const DB: Vec3 = [2.0, 0, -0.6];
const MAST: Vec3 = [-1.5, 0, -2.15];
const MAST_H = 4.0;
const PIPE_Y = 0.72;
const CRANE_YELLOW = '#ffc93c';

/** Pipes between the integration hub and the customer's systems (CRM crates, data store, warehouse). */
const PIPES: [Vec3, Vec3][] = [
  [[-0.56, PIPE_Y, -0.3], [-1.48, PIPE_Y, -0.55]],
  [[0.56, PIPE_Y, -0.3], [1.5, PIPE_Y, -0.55]],
  [[0, PIPE_Y, -0.76], [0.9, PIPE_Y, -1.9]],
];
const PACKETS_PER_PIPE = 3;

function buildDocks(): Part[] {
  const parts: Part[] = [
    // Stone quay.
    part(box(5.0, 0.16, 3.0), '#d9d3e6', [0, 0.08, -1.0]),
    // Integration hub with a coral band and a round port on the front.
    part(box(1.1, 1.25, 0.9), '#f4f1fb', [HUB[0], 0.16 + 0.62, HUB[2]]),
    part(box(1.14, 0.22, 0.94), F.base, [HUB[0], 1.05, HUB[2]]),
    part(box(1.2, 0.12, 1.0), F.dark, [HUB[0], 1.46, HUB[2]]),
    // Data store: a stack of discs (the classic database icon).
    ...[0, 1, 2].map((i) => part(cyl(0.48, 0.48, 0.3, 12), i === 1 ? '#82bdf2' : '#c6e0fa', [DB[0], 0.32 + i * 0.34, DB[2]])),
    // Warehouse shed behind the hub.
    part(box(1.0, 0.9, 0.8), '#e3dff0', [1.15, 0.6, -2.2]),
    part(box(1.1, 0.1, 0.9), F.dark, [1.15, 1.1, -2.2]),
    // Crane: base, mast with cross-braces, cab.
    part(box(0.8, 0.3, 0.8), COLORS.rock, [MAST[0], 0.31, MAST[2]]),
    part(box(0.3, MAST_H, 0.3), CRANE_YELLOW, [MAST[0], 0.46 + MAST_H / 2, MAST[2]]),
    part(box(0.5, 0.45, 0.5), '#f4f1fb', [MAST[0], 0.46 + MAST_H - 0.4, MAST[2] + 0.3]),
  ];
  // Crates: CRM / ticketing records waiting to be shipped.
  const crate = (at: Vec3, s: number, lid: string) => {
    parts.push(part(box(s, s, s), COLORS.wood, at));
    parts.push(part(box(s + 0.04, 0.08, s + 0.04), lid, [at[0], at[1] + s / 2 - 0.04, at[2]]));
    parts.push(part(box(s + 0.02, 0.08, 0.08), COLORS.woodDark, [at[0], at[1], at[2] + s / 2]));
  };
  crate([CRATES[0], 0.16 + 0.42, CRATES[2]], 0.84, F.base);
  crate([CRATES[0] + 0.1, 0.16 + 0.84 + 0.3, CRATES[2] - 0.05], 0.6, '#82bdf2');
  crate([CRATES[0] + 0.15, 0.16 + 0.3, CRATES[2] + 0.75], 0.6, '#7fd99a');
  // Pipes with flanges at both ends.
  for (const [a, b] of PIPES) {
    parts.push(beam(a, b, 0.17, '#b3aac6', true));
    for (const p of [a, b]) parts.push(part(cyl(0.15, 0.15, 0.1, 8), COLORS.rockDark, p, [0, 0, Math.PI / 2], 1));
  }
  // Supports under the long back pipe.
  parts.push(beam([0.45, 0.16, -1.33], [0.45, PIPE_Y, -1.33], 0.08, COLORS.rockDark));
  // Mast braces.
  for (let y = 0.8; y < MAST_H; y += 0.8) parts.push(part(torus(0.22, 0.03, 4, 4), COLORS.outline, [MAST[0], 0.46 + y, MAST[2]], [Math.PI / 2, 0, Math.PI / 4]));
  return parts;
}

/** Integration Docks: a crane loads crates while data packets flow through pipes between the hub and the customer's systems. */
export default function PipeDocks() {
  const boom = useRef<Group>(null);
  const rope = useRef<Mesh>(null);
  const crate = useRef<Mesh>(null);
  const port = useRef<Mesh>(null);
  const packets = useRef<InstancedMesh>(null);
  const boomGeo = useGeo(() => box(3.1, 0.2, 0.22));
  const weightGeo = useGeo(() => box(0.5, 0.45, 0.45));
  const ropeGeo = useGeo(() => cyl(0.02, 0.02, 1.0, 4));
  const hookCrate = useGeo(() => box(0.5, 0.5, 0.5));
  const portGeo = useGeo(() => cyl(0.26, 0.26, 0.06, 12));
  const packetGeo = useGeo(() => box(0.2, 0.2, 0.2));
  const dummy = useMemo(() => new Object3D(), []);
  const ends = useMemo(() => PIPES.map(([a, b]) => [new Vector3(...a), new Vector3(...b)] as const), []);
  const tmp = useMemo(() => new Vector3(), []);
  useHiddenInstances(packets);
  useInstanceColors(packets, ['#fff1b0', '#c6e0fa', '#ffd3d1']);

  useLandmarkFrame((t) => {
    if (boom.current) boom.current.rotation.y = -0.9 + Math.sin(t * 0.45) * 0.75;
    // The hook winds up and down: the rope stretches, the crate rides at its end.
    const drop = 1.3 + Math.sin(t * 0.9) * 0.45;
    if (rope.current) {
      rope.current.scale.y = drop;
      rope.current.position.y = -0.1 - drop / 2;
    }
    if (crate.current) crate.current.position.y = -0.1 - drop - 0.25;
    if (port.current) port.current.rotation.y = t * 1.5;
    const mesh = packets.current;
    if (!mesh) return;
    ends.forEach(([a, b], p) => {
      for (let k = 0; k < PACKETS_PER_PIPE; k++) {
        // Requests flow out of the hub on two pipes; results flow back on the third.
        const u = (t * 0.45 + k / PACKETS_PER_PIPE + p * 0.21) % 1;
        tmp.lerpVectors(a, b, p === 2 ? 1 - u : u);
        dummy.position.copy(tmp);
        dummy.rotation.set(t * 2 + k, t + p, 0);
        dummy.scale.setScalar(Math.max(0.001, Math.sin(u * Math.PI)));
        dummy.updateMatrix();
        mesh.setMatrixAt(p * PACKETS_PER_PIPE + k, dummy.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <Static build={buildDocks} />
      <mesh ref={port} geometry={portGeo} material={toon(F.dark)} position={[HUB[0], 0.75, HUB[2] + 0.48]} rotation={[Math.PI / 2, 0, 0]} />
      <Caption position={[HUB[0], 0.75, HUB[2] + 0.53]} size={0.17} color="#ffffff" outline={COLORS.outline}>
        MCP
      </Caption>
      {/* The boom slews over the yard; the hook (rope + crate) hangs from its tip. */}
      <group ref={boom} position={[MAST[0], 0.46 + MAST_H + 0.1, MAST[2]]}>
        <mesh geometry={boomGeo} material={toon(CRANE_YELLOW)} position={[1.0, 0, 0]} castShadow />
        <mesh geometry={weightGeo} material={toon(COLORS.rockDark)} position={[-0.45, -0.1, 0]} castShadow />
        <Near>
          <group position={[2.35, 0, 0]}>
            <mesh ref={rope} geometry={ropeGeo} material={toon(COLORS.outline)} />
            <mesh ref={crate} geometry={hookCrate} material={toon(F.base)} castShadow />
          </group>
        </Near>
      </group>
      <Near>
        <instancedMesh ref={packets} args={[packetGeo, undefined, PIPES.length * PACKETS_PER_PIPE]} frustumCulled={false}>
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </Near>
      <Caption position={[CRATES[0], 1.75, CRATES[2] + 0.45]} size={0.22}>
        CRM
      </Caption>
      <Caption position={[DB[0], 1.4, DB[2] + 0.5]} size={0.22}>
        Data
      </Caption>
    </group>
  );
}
