import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { MiniGameId } from '@/data/minigames';
import type { MiniGameProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGame = ComponentType<MiniGameProps<any>>;

/** Dynamic imports, so each game is its own chunk and only downloads when first played. */
const LOADERS: Record<MiniGameId, () => Promise<{ default: AnyGame }>> = {
  tutorial: () => import('./Tutorial'),
  'pipeline-order': () => import('./PipelineOrder'),
  'sort-bins': () => import('./SortBins'),
  quiz: () => import('./Quiz'),
  'gradient-descent': () => import('./sims/GradientDescent'),
  'curve-fit': () => import('./sims/CurveFit'),
  temperature: () => import('./sims/Temperature'),
  'chunk-retrieve': () => import('./sims/ChunkRetrieve'),
  'injection-defense': () => import('./sims/InjectionDefense'),
  perceptron: () => import('./sims/Perceptron'),
  'attention-beams': () => import('./sims/AttentionBeams'),
  'fit-the-gpu': () => import('./sims/FitTheGpu'),
  'rank-it': () => import('./sims/RankIt'),
  batching: () => import('./sims/Batching'),
  'drift-watch': () => import('./sims/DriftWatch'),
  'final-assembly': () => import('./sims/FinalAssembly'),
};

export const MINIGAME_REGISTRY = Object.fromEntries(
  Object.entries(LOADERS).map(([id, load]) => [id, lazy(load)]),
) as Record<MiniGameId, LazyExoticComponent<AnyGame>>;

/** Start downloading a game's chunk early (e.g. while the intro card is showing). */
export function preloadMiniGame(id: MiniGameId) {
  LOADERS[id]().catch(() => {});
}
