import type { PhaseId } from '@/data/roadmap';

export interface MiniGameRun {
  score: number;
  stars: 1 | 2 | 3;
}

export interface MiniGameProps<C = unknown> {
  phaseId: PhaseId;
  config: C;
  onComplete: (r: MiniGameRun) => void;
  onExit: () => void;
}
