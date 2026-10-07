import type { ComponentType } from 'react';
import type { LandmarkType } from '@/data/world';
import { ring, type Vec3 } from '@/lib/landmarkKit';
import Archive from './Archive';
import Citadel from './Citadel';
import ControlTower from './ControlTower';
import Conveyor, { STATIONS } from './Conveyor';
import CraftShop from './CraftShop';
import Dock, { PIER } from './Dock';
import Factory, { BELT } from './Factory';
import Farm from './Farm';
import Forge from './Forge';
import Fort from './Fort';
import GearTower from './GearTower';
import Library from './Library';
import Lighthouse from './Lighthouse';
import Mountain from './Mountain';
import NeuronTrees, { TREES } from './NeuronTrees';
import PowerPlant, { COOLING } from './PowerPlant';
import Signpost from './Signpost';
import SummitPlaza from './SummitPlaza';
import Tower from './Tower';
import Workshop from './Workshop';

/** Solid shapes in landmark space (before the landmark's scale). */
export type LandmarkCollider =
  | { kind: 'box'; half: Vec3; at: Vec3; rotY?: number }
  | { kind: 'cyl'; r: number; halfH: number; at: Vec3 };

export interface LandmarkSpec {
  Body: ComponentType;
  /** Label height above the island top (world metres). */
  label: number;
  colliders: LandmarkCollider[];
}

const boxC = (half: Vec3, at: Vec3, rotY = 0): LandmarkCollider => ({ kind: 'box', half, at, rotY });
const cylC = (r: number, halfH: number, at: Vec3 = [0, halfH, 0]): LandmarkCollider => ({ kind: 'cyl', r, halfH, at });

const pierMid = (PIER.front + PIER.back) / 2;
const pierHalf = (PIER.front - PIER.back) / 2;

export const LANDMARK_SPECS: Record<LandmarkType, LandmarkSpec> = {
  dock: {
    Body: Dock,
    label: 4.6,
    colliders: [
      boxC([PIER.half, PIER.deck / 2, pierHalf], [0, PIER.deck / 2, pierMid]),
      boxC([0.08, 0.55, pierHalf - 1.2], [-PIER.half - 0.06, PIER.deck + 0.55, pierMid - 1.2]),
      boxC([0.08, 0.55, pierHalf - 1.2], [PIER.half + 0.06, PIER.deck + 0.55, pierMid - 1.2]),
      boxC([PIER.half, 0.55, 0.08], [0, PIER.deck + 0.55, PIER.back + 0.2]),
      boxC([0.15, 1.3, 0.15], [-2.2, 1.3, 0.6]),
      boxC([0.45, 0.6, 0.45], [2.15, 0.6, 0.1]),
      cylC(0.34, 0.4, [2.6, 0.4, -1.0]),
    ],
  },
  workshop: {
    Body: Workshop,
    label: 7.6,
    colliders: [
      boxC([1.55, 1.9, 1.35], [0, 1.9, 0]),
      boxC([0.95, 1.3, 0.85], [-2.3, 1.3, -2.0], 0.5),
      boxC([0.75, 1.1, 0.65], [2.35, 1.1, -2.0], -0.45),
      boxC([0.55, 0.38, 0.3], [-0.95, 0.38, 1.75]),
    ],
  },
  mountain: { Body: Mountain, label: 8.2, colliders: [cylC(2.3, 2.25), boxC([1.65, 0.5, 0.55], [-2.55, 0.5, -1.9], 0.75)] },
  farm: { Body: Farm, label: 5.6, colliders: [boxC([1.55, 1.75, 1.3], [0, 1.75, 0])] },
  signpost: { Body: Signpost, label: 7.3, colliders: [cylC(0.35, 3), boxC([1.7, 0.5, 0.45], [0, 0.5, -2.0])] },
  lighthouse: { Body: Lighthouse, label: 9.2, colliders: [cylC(1.45, 3.5)] },
  'craft-shop': {
    Body: CraftShop,
    label: 6.2,
    colliders: [boxC([1.5, 1.5, 1.2], [0, 1.5, 0]), boxC([0.65, 0.35, 0.25], [-0.55, 0.35, 1.38]), boxC([0.55, 0.4, 0.3], [-1.95, 0.4, -0.2])],
  },
  library: {
    Body: Library,
    label: 6.6,
    colliders: [
      boxC([0.65, 1.6, 0.5], [-1.45, 1.6, -0.5]),
      boxC([0.65, 2.0, 0.5], [1.45, 2.0, -0.7]),
      boxC([0.65, 2.4, 0.5], [0, 2.4, -2.1]),
      cylC(0.25, 1.1, [0, 1.1, 0.7]),
    ],
  },
  'control-tower': { Body: ControlTower, label: 8.6, colliders: [boxC([1.4, 0.25, 1.4], [0, 0.25, 0]), cylC(1.1, 3)] },
  factory: {
    Body: Factory,
    label: 6.6,
    colliders: [
      boxC([1.75, 1.6, 1.35], [0, 1.6, 0]),
      boxC([(BELT.x1 - BELT.x0) / 2 + 0.15, 0.42, 0.4], [(BELT.x0 + BELT.x1) / 2, 0.42, BELT.z]),
      boxC([0.38, 0.25, 0.42], [BELT.x1 + 0.45, 0.25, BELT.z]),
    ],
  },
  fort: { Body: Fort, label: 5.6, colliders: [cylC(2.05, 1.4)] },
  'neuron-trees': {
    Body: NeuronTrees,
    label: 6.0,
    colliders: TREES.map((t) => cylC(0.3 * t.s + 0.1, t.trunk / 2, [t.x, t.trunk / 2, t.z])),
  },
  tower: { Body: Tower, label: 10, colliders: [cylC(1.6, 3.5)] },
  forge: {
    Body: Forge,
    label: 6.4,
    colliders: [boxC([1.3, 0.95, 0.9], [0, 0.95, -0.75]), boxC([0.5, 0.45, 0.25], [0.35, 0.45, 1.05]), cylC(0.35, 0.4, [-1.65, 0.4, 0.75])],
  },
  archive: { Body: Archive, label: 5.2, colliders: [boxC([1.8, 1.65, 1.35], [0, 1.65, -1.45]), cylC(1.0, 0.45, [0, 0.45, 1.15])] },
  'gear-tower': { Body: GearTower, label: 7.6, colliders: [boxC([1.45, 2.3, 1.15], [0, 2.3, 0])] },
  'power-plant': {
    Body: PowerPlant,
    label: 6.0,
    colliders: [...COOLING.map((c) => cylC(0.95 * c.s, 1.7 * c.s, [c.at[0], 1.7 * c.s, c.at[2]])), boxC([1.45, 0.65, 0.63], [0, 0.65, 0.7])],
  },
  conveyor: {
    Body: Conveyor,
    label: 4.2,
    colliders: [
      boxC([2.2, 0.45, 1.15], [0, 0.45, 0]),
      ...STATIONS.map((s) => boxC([0.45, 0.55, 0.35], [s.at[0], 0.55, s.at[2]], s.rotY)),
    ],
  },
  citadel: { Body: Citadel, label: 7.2, colliders: [boxC([1.95, 1.6, 1.95], [0, 1.6, 0])] },
  'summit-plaza': {
    Body: SummitPlaza,
    label: 11,
    colliders: [cylC(0.75, 0.45), ...ring(6, 2.3, Math.PI / 6).map((p) => cylC(0.22, 1.4, [p.x, 1.4, p.z]))],
  },
};
