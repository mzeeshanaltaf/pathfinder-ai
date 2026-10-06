import type { PhaseId, Track } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';

// World layout. The trunk runs along −Z from the Harbor to the Fork; the
// Developer path arcs to −X, the Engineer path arcs (wider, it is longer) to +X,
// and both converge at the Summit. Positions are the centre of each island's
// walkable top surface.

export type LandmarkType =
  | 'dock'
  | 'workshop'
  | 'mountain'
  | 'farm'
  | 'signpost'
  | 'lighthouse'
  | 'craft-shop'
  | 'library'
  | 'control-tower'
  | 'factory'
  | 'fort'
  | 'neuron-trees'
  | 'tower'
  | 'forge'
  | 'archive'
  | 'gear-tower'
  | 'power-plant'
  | 'conveyor'
  | 'citadel'
  | 'summit-plaza';

export interface IslandDef {
  id: PhaseId;
  position: [number, number, number];
  radius: number;
  landmark: LandmarkType;
  color: string;
}

export interface BridgeDef {
  from: PhaseId;
  to: PhaseId;
}

export const ISLAND_TRACK: Record<PhaseId, Track> = {
  harbor: 'meta',
  'code-village': 'common',
  'math-mountain': 'common',
  'ml-meadow': 'common',
  fork: 'meta',
  'dev-llm-lighthouse': 'developer',
  'dev-prompt-workshop': 'developer',
  'dev-rag-library': 'developer',
  'dev-agent-hq': 'developer',
  'dev-app-factory': 'developer',
  'dev-shield-fort': 'developer',
  'eng-neural-garden': 'engineer',
  'eng-transformer-tower': 'engineer',
  'eng-model-forge': 'engineer',
  'eng-deep-archive': 'engineer',
  'eng-clockwork-keep': 'engineer',
  'eng-gpu-plant': 'engineer',
  'eng-mlops-conveyor': 'engineer',
  'eng-security-citadel': 'engineer',
  summit: 'meta',
};

/** Placeholder display names for Phase 1 labels. Phase 2 uses `Phase.title` from data/roadmap.ts. */
export const ISLAND_LABELS: Record<PhaseId, string> = {
  harbor: 'Harbor',
  'code-village': 'Code Village',
  'math-mountain': 'Math Mountain',
  'ml-meadow': 'ML Meadow',
  fork: 'The Fork',
  'dev-llm-lighthouse': 'LLM Lighthouse',
  'dev-prompt-workshop': 'Prompt Workshop',
  'dev-rag-library': 'RAG Library',
  'dev-agent-hq': 'Agent HQ',
  'dev-app-factory': 'App Factory',
  'dev-shield-fort': 'Shield Fort',
  'eng-neural-garden': 'Neural Garden',
  'eng-transformer-tower': 'Transformer Tower',
  'eng-model-forge': 'Model Forge',
  'eng-deep-archive': 'Deep Archive',
  'eng-clockwork-keep': 'Clockwork Keep',
  'eng-gpu-plant': 'GPU Plant',
  'eng-mlops-conveyor': 'MLOps Conveyor',
  'eng-security-citadel': 'Security Citadel',
  summit: 'The Summit',
};

const island = (
  id: PhaseId,
  position: [number, number, number],
  radius: number,
  landmark: LandmarkType,
): IslandDef => ({ id, position, radius, landmark, color: TRACK_COLORS[ISLAND_TRACK[id]].base });

export const ISLANDS: IslandDef[] = [
  // Trunk
  island('harbor', [0, 0, 0], 15, 'dock'),
  island('code-village', [0, 1, -45], 14, 'workshop'),
  island('math-mountain', [0, 3.5, -90], 15, 'mountain'),
  island('ml-meadow', [0, 2, -135], 14, 'farm'),
  island('fork', [0, 2.5, -180], 16, 'signpost'),
  // Developer path (−X)
  island('dev-llm-lighthouse', [-42, 3, -205], 12, 'lighthouse'),
  island('dev-prompt-workshop', [-78, 2, -228], 12, 'craft-shop'),
  island('dev-rag-library', [-100, 3.5, -265], 13, 'library'),
  island('dev-agent-hq', [-106, 5, -308], 12, 'control-tower'),
  island('dev-app-factory', [-92, 4, -350], 13, 'factory'),
  island('dev-shield-fort', [-48, 5, -385], 12, 'fort'),
  // Engineer path (+X)
  island('eng-neural-garden', [42, 2, -205], 12, 'neuron-trees'),
  island('eng-transformer-tower', [82, 3.5, -222], 12, 'tower'),
  island('eng-model-forge', [115, 4.5, -250], 13, 'forge'),
  island('eng-deep-archive', [132, 3, -290], 12, 'archive'),
  island('eng-clockwork-keep', [130, 5, -335], 12, 'gear-tower'),
  island('eng-gpu-plant', [112, 4, -375], 13, 'power-plant'),
  island('eng-mlops-conveyor', [80, 5.5, -402], 12, 'conveyor'),
  island('eng-security-citadel', [42, 5, -418], 12, 'citadel'),
  // Convergence
  island('summit', [0, 6.5, -410], 20, 'summit-plaza'),
];

export const ISLAND_BY_ID = Object.fromEntries(ISLANDS.map((i) => [i.id, i])) as Record<PhaseId, IslandDef>;

const chain = (ids: PhaseId[]): BridgeDef[] => ids.slice(1).map((to, i) => ({ from: ids[i], to }));

export const BRIDGES: BridgeDef[] = [
  ...chain(['harbor', 'code-village', 'math-mountain', 'ml-meadow', 'fork']),
  ...chain([
    'fork',
    'dev-llm-lighthouse',
    'dev-prompt-workshop',
    'dev-rag-library',
    'dev-agent-hq',
    'dev-app-factory',
    'dev-shield-fort',
    'summit',
  ]),
  ...chain([
    'fork',
    'eng-neural-garden',
    'eng-transformer-tower',
    'eng-model-forge',
    'eng-deep-archive',
    'eng-clockwork-keep',
    'eng-gpu-plant',
    'eng-mlops-conveyor',
    'eng-security-citadel',
    'summit',
  ]),
];

export const DEFAULT_SPAWN_ISLAND: PhaseId = 'harbor';

/** Falling below this height triggers a respawn. */
export const RESPAWN_Y = -30;
