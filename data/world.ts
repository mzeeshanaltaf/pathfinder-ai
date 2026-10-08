import { CAREER_PATHS, PHASE_IDS, PHASES, trackPhases, type PathId, type PhaseId, type Track } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';

/** First island of a career path (the one the Fork's bridge leads to). */
export const pathStart = (id: PathId): PhaseId => trackPhases(id)[0].id;

// World layout. The trunk runs along −Z from the Harbor to the Fork; the
// Developer path arcs to −X, the Engineer path arcs (wider, it is longer) to +X,
// the FDE path zig-zags down the middle corridor (x ≈ 0), and all three converge
// at the Summit. Positions are the centre of each island's walkable top surface.

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
  | 'watchtower'
  | 'neuron-trees'
  | 'tower'
  | 'forge'
  | 'archive'
  | 'gear-tower'
  | 'power-plant'
  | 'conveyor'
  | 'citadel'
  | 'field-camp'
  | 'pipe-docks'
  | 'launch-pad'
  | 'observatory'
  | 'vault'
  | 'beacon'
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

/** Track per island, derived from the roadmap content. */
export const ISLAND_TRACK = Object.fromEntries(PHASE_IDS.map((id) => [id, PHASES[id].track])) as Record<PhaseId, Track>;

/** Bridge-head sign text overrides: where a bridge starts a path, name the path, not just the island. */
export const BRIDGE_SIGN_SUBTITLES: Partial<Record<`${PhaseId}->${PhaseId}`, string>> = Object.fromEntries(
  CAREER_PATHS.map((p) => [`fork->${pathStart(p.id)}`, p.pathLabel]),
);

/** Distance (m, horizontal) from a landmark within which its panel can be opened. */
export const INTERACT_RADIUS = 6.5;
/** Distance (m, horizontal) from a Challenge pedestal within which its mini-game can be started. */
export const CHALLENGE_RADIUS = 2.4;
/** Distance (m, horizontal) from a balloon dock within which E opens the travel map. */
export const DOCK_INTERACT_RADIUS = 2.2;
/** Distance (m) from the player's body centre at which a Skill Gem is collected. */
export const GEM_PICKUP_RADIUS = 1.4;
/** Gems float this high above the island top. */
export const GEM_HEIGHT = 1.1;

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
  island('dev-watchtower', [-50, 6, -428], 11, 'watchtower'),
  // Engineer path (+X)
  island('eng-neural-garden', [42, 2, -205], 12, 'neuron-trees'),
  island('eng-transformer-tower', [82, 3.5, -222], 12, 'tower'),
  island('eng-model-forge', [115, 4.5, -250], 13, 'forge'),
  island('eng-deep-archive', [132, 3, -290], 12, 'archive'),
  island('eng-clockwork-keep', [130, 5, -335], 12, 'gear-tower'),
  island('eng-gpu-plant', [112, 4, -375], 13, 'power-plant'),
  island('eng-mlops-conveyor', [80, 5.5, -402], 12, 'conveyor'),
  island('eng-security-citadel', [42, 5, -418], 12, 'citadel'),
  // AI FDE path (middle corridor, zig-zagging between the other two)
  island('fde-discovery-camp', [0, 3, -217], 11, 'field-camp'),
  island('fde-integration-docks', [-14, 3.5, -248], 11, 'pipe-docks'),
  island('fde-launch-pad', [12, 4.5, -279], 11, 'launch-pad'),
  island('fde-proving-grounds', [-12, 5, -310], 11, 'observatory'),
  island('fde-trust-vault', [12, 5.5, -341], 11, 'vault'),
  island('fde-go-live-beacon', [-4, 6, -370], 11, 'beacon'),
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
    'dev-watchtower',
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
  ...chain([
    'fork',
    'fde-discovery-camp',
    'fde-integration-docks',
    'fde-launch-pad',
    'fde-proving-grounds',
    'fde-trust-vault',
    'fde-go-live-beacon',
    'summit',
  ]),
];

export const DEFAULT_SPAWN_ISLAND: PhaseId = 'harbor';

/** Falling below this height triggers a respawn. */
export const RESPAWN_Y = -30;
