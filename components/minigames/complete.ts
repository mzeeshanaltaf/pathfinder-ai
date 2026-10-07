import type { PhaseId } from '@/data/roadmap';
import { sfx } from '@/lib/audio';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import type { MiniGameRun } from './types';

/** Persist the badge (best stars kept) and show the result screen. */
export function finishMiniGame(phaseId: PhaseId, run: MiniGameRun) {
  const { prevStars, best } = useProgress.getState().awardBadge(phaseId, run.stars);
  useUi.getState().showMiniGameResult({ phaseId, score: run.score, stars: run.stars, prevStars, best });
  if (run.stars > prevStars) sfx.badge();
}

/** Accuracy (0–1) → stars: 90% for 3, 70% for 2. */
export function starsForAccuracy(acc: number): 1 | 2 | 3 {
  return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
}

/** Fisher–Yates shuffle (copy). */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
