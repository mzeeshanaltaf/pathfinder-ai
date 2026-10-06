'use client';

import { PHASE_IDS } from '@/data/roadmap';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** Temporary `?debug` readout (FPS comes from drei <Stats> in the top-left). */
export default function DebugHud() {
  const nearby = useUi((s) => s.nearbyPhaseId);
  const mode = useUi((s) => s.mode);
  const locked = useUi((s) => s.pointerLocked);
  const lastIsland = useProgress((s) => s.lastIsland);
  const visited = useProgress((s) => Object.keys(s.visited).length);

  return (
    <div className="pointer-events-none fixed right-2 top-2 z-50 rounded-lg bg-black/60 px-3 py-2 font-mono text-xs leading-5 text-white">
      <div>island: {nearby ?? '—'}</div>
      <div>checkpoint: {lastIsland}</div>
      <div>
        visited: {visited}/{PHASE_IDS.length}
      </div>
      <div>
        mode: {mode}
        {locked ? ' · locked' : ''}
      </div>
    </div>
  );
}
