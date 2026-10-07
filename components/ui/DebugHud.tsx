'use client';

import { useEffect, useState } from 'react';
import { PHASE_IDS } from '@/data/roadmap';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** Last frame's renderer.info, written by an in-Canvas probe (only mounted with `?debug`). */
export const renderStats = { calls: 0, triangles: 0, geometries: 0, textures: 0, programs: 0 };

/** `?debug` readout (FPS comes from drei <Stats> in the top-left). */
export default function DebugHud() {
  const island = useUi((s) => s.currentIsland);
  const nearby = useUi((s) => s.nearbyPhaseId);
  const mode = useUi((s) => s.mode);
  const tier = useUi((s) => s.perfTier);
  const quality = useProgress((s) => s.settings.quality);
  const lastIsland = useProgress((s) => s.lastIsland);
  const visited = useProgress((s) => Object.keys(s.visited).length);
  const [stats, setStats] = useState(renderStats);

  useEffect(() => {
    const id = window.setInterval(() => setStats({ ...renderStats }), 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-2 left-2 z-50 rounded-lg bg-black/60 px-3 py-2 font-mono text-xs leading-5 text-white">
      <div>island: {island ?? '—'}</div>
      <div>near landmark: {nearby ?? '—'}</div>
      <div>checkpoint: {lastIsland}</div>
      <div>
        visited: {visited}/{PHASE_IDS.length}
      </div>
      <div>mode: {mode}</div>
      <div>
        quality: {quality} · tier {tier}
      </div>
      <div>
        draws: {stats.calls} · tris: {(stats.triangles / 1000).toFixed(0)}k
      </div>
      <div>
        geo: {stats.geometries} · tex: {stats.textures} · progs: {stats.programs}
      </div>
    </div>
  );
}
