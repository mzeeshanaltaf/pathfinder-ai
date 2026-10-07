'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, SphereGeometry, Vector3, type InstancedMesh } from 'three';
import { beam, cyl, part, type Part } from '@/lib/landmarkKit';
import { COLORS, TRACK_COLORS } from '@/lib/palette';
import { Static, useGeo, useHiddenInstances, useInstanceColors, useLandmarkFrame } from './kit';

const E = TRACK_COLORS.engineer;

export const TREES = [
  { x: 0, z: -0.3, trunk: 1.9, s: 1 },
  { x: -1.75, z: -1.55, trunk: 1.4, s: 0.75 },
  { x: 1.8, z: -1.45, trunk: 1.5, s: 0.8 },
];

/** Layers of each neuron crown: node count, ring radius, height above the trunk top. */
const LAYERS = [
  { n: 1, r: 0, dy: 0 },
  { n: 3, r: 0.85, dy: 0.8 },
  { n: 4, r: 1.25, dy: 1.6 },
  { n: 2, r: 0.5, dy: 2.35 },
];

interface Net {
  nodes: { p: Vector3; layer: number }[];
  edges: [Vector3, Vector3][];
}

function buildNet(): Net {
  const nodes: Net['nodes'] = [];
  const edges: Net['edges'] = [];
  TREES.forEach((t, ti) => {
    let prev: Vector3[] = [];
    LAYERS.forEach((L, li) => {
      const layer: Vector3[] = [];
      for (let k = 0; k < L.n; k++) {
        const a = (k / L.n) * Math.PI * 2 + li * 0.5 + ti;
        layer.push(new Vector3(t.x + Math.cos(a) * L.r * t.s, t.trunk + L.dy * t.s, t.z + Math.sin(a) * L.r * t.s));
      }
      layer.forEach((p) => nodes.push({ p, layer: li }));
      for (const a of prev) for (const b of layer) edges.push([a, b]);
      prev = layer;
    });
  });
  return { nodes, edges };
}

const NET = buildNet();
const PULSES = 18;

function buildStatic(): Part[] {
  const parts: Part[] = [part(cyl(2.35, 2.5, 0.14, 12), '#5fb78a', [0, 0.07, -0.8])];
  for (const t of TREES) {
    parts.push(part(cyl(0.16 * t.s + 0.06, 0.3 * t.s + 0.08, t.trunk, 7), COLORS.trunk, [t.x, t.trunk / 2, t.z]));
  }
  for (const [a, b] of NET.edges) parts.push(beam([a.x, a.y, a.z], [b.x, b.y, b.z], 0.05, '#a9cdf2', true));
  return parts;
}

/** Neural Garden: trees whose crowns are neuron graphs, with signals pulsing up through the layers. */
export default function NeuronTrees() {
  const nodes = useRef<InstancedMesh>(null);
  const pulses = useRef<InstancedMesh>(null);
  const nodeGeo = useGeo(() => new SphereGeometry(0.17, 10, 8));
  const pulseGeo = useGeo(() => new SphereGeometry(0.075, 8, 6));
  const dummy = useMemo(() => new Object3D(), []);
  useHiddenInstances(pulses);
  useInstanceColors(nodes, [E.light, '#9fe7f5', '#c6e0fa']);

  useLandmarkFrame((t) => {
    const n = nodes.current;
    if (n) {
      NET.nodes.forEach((node, i) => {
        const wave = Math.max(0, Math.sin(t * 2.6 - node.layer * 1.1));
        dummy.position.copy(node.p);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1 + wave * 0.4);
        dummy.updateMatrix();
        n.setMatrixAt(i, dummy.matrix);
      });
      n.instanceMatrix.needsUpdate = true;
    }
    const p = pulses.current;
    if (p) {
      for (let i = 0; i < PULSES; i++) {
        const [a, b] = NET.edges[(i * 7 + Math.floor(t * 0.9 + i * 0.37) * 5) % NET.edges.length];
        const u = (t * 0.9 + i * 0.37) % 1;
        dummy.position.lerpVectors(a, b, u);
        dummy.scale.setScalar(Math.sin(u * Math.PI) + 0.001);
        dummy.updateMatrix();
        p.setMatrixAt(i, dummy.matrix);
      }
      p.instanceMatrix.needsUpdate = true;
    }
  });

  // Nodes start at rest, so they show from afar before (or without) any animated frame.
  useLayoutEffect(() => {
    const n = nodes.current;
    if (!n) return;
    const d = new Object3D();
    NET.nodes.forEach((node, i) => {
      d.position.copy(node.p);
      d.updateMatrix();
      n.setMatrixAt(i, d.matrix);
    });
    n.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <Static build={buildStatic} outline={0.035} />
      <instancedMesh ref={nodes} args={[nodeGeo, undefined, NET.nodes.length]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pulses} args={[pulseGeo, undefined, PULSES]} frustumCulled={false}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
